import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requirePermission } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const orders = await prisma.order.findMany({
      include: {
        items: true,
        warehouse: { select: { id: true, code: true, name: true } },
        branch: { select: { id: true, code: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error fetching orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { user, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const {
      code,
      customerId,
      customerName,
      customerPhone,
      items,
      subtotal,
      discountAmount,
      shippingFee,
      totalAmount,
      paidAmount,
      debtAmount,
      paymentMethod,
      status,
      cashierName,
      notes,
      hasPinOverride,
      vatRate,
      vatAmount,
      salesChannel,
      warehouseId,
      branchId,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Đơn hàng phải có ít nhất 1 sản phẩm" },
        { status: 400 }
      );
    }

    // Resolve target warehouse (from request, user profile, or system default)
    let effectiveWarehouseId = warehouseId || user?.warehouseId;
    if (!effectiveWarehouseId) {
      const defaultWh = await prisma.warehouse.findFirst({
        where: { isDefault: true, isActive: true },
      });
      effectiveWarehouseId = defaultWh?.id || null;
    }

    const effectiveBranchId = branchId || user?.branchId || null;
    const orderCode = code || `DH-${Date.now().toString().slice(-8)}`;

    // Verify customer existence
    let validCustomerId: string | null = null;
    if (customerId) {
      const cust = await prisma.customer.findUnique({ where: { id: customerId } });
      if (cust) validCustomerId = cust.id;
    }

    // Execute in Prisma Interactive Transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Order
      const newOrder = await tx.order.create({
        data: {
          code: orderCode,
          customerId: validCustomerId,
          customerName: customerName || "Khách Lẻ",
          customerPhone: customerPhone || "---",
          subtotal: Number(subtotal) || 0,
          discountAmount: Number(discountAmount) || 0,
          shippingFee: Number(shippingFee) || 0,
          totalAmount: Number(totalAmount) || 0,
          paidAmount: Number(paidAmount) || 0,
          debtAmount: Number(debtAmount) || 0,
          paymentMethod: paymentMethod || "cash",
          status: status || "completed",
          cashierName: cashierName || user?.name || "Thu Ngân",
          warehouseId: effectiveWarehouseId,
          branchId: effectiveBranchId,
          notes: notes || null,
          hasPinOverride: Boolean(hasPinOverride),
          vatRate: vatRate ? Number(vatRate) : 0,
          vatAmount: vatAmount ? Number(vatAmount) : 0,
          salesChannel: salesChannel || "pos",
          items: {
            create: items.map((it: any) => ({
              productId: it.productId || null,
              sku: it.sku || "UNKNOWN",
              name: it.name || it.productName || "Sản phẩm",
              category: it.category || "",
              selectedUnit: it.selectedUnit || it.unitName || "Cái",
              conversionRate: Number(it.conversionRate) || 1,
              quantity: Number(it.quantity) || 1,
              unitPrice: Number(it.unitPrice) || 0,
              costPricePerUnit: Number(it.costPricePerUnit) || 0,
              totalPrice: Number(it.totalPrice) || 0,
              discountPercent: Number(it.discountPercent) || 0,
              serialNumbers: it.serialNumbers || [],
              batchId: it.batchId || null,
            })),
          },
        },
        include: { items: true },
      });

      // 2. Decrement Product & Warehouse Inventory and Record StockLedger
      for (const it of items) {
        if (it.productId) {
          const totalUnitsToDeduct = (Number(it.quantity) || 1) * (Number(it.conversionRate) || 1);

          // Update product master stock total
          await tx.product.updateMany({
            where: { id: it.productId },
            data: {
              stockBaseUnits: {
                decrement: totalUnitsToDeduct,
              },
            },
          });

          // Update warehouse specific StockBalance & Ledger if warehouse is assigned
          if (effectiveWarehouseId) {
            const currentBal = await tx.stockBalance.findUnique({
              where: {
                productId_warehouseId: {
                  productId: it.productId,
                  warehouseId: effectiveWarehouseId,
                },
              },
            });

            const balanceBefore = currentBal ? currentBal.quantity : 0;
            const balanceAfter = balanceBefore - totalUnitsToDeduct;

            await tx.stockBalance.upsert({
              where: {
                productId_warehouseId: {
                  productId: it.productId,
                  warehouseId: effectiveWarehouseId,
                },
              },
              update: {
                quantity: { decrement: totalUnitsToDeduct },
              },
              create: {
                productId: it.productId,
                warehouseId: effectiveWarehouseId,
                quantity: -totalUnitsToDeduct,
              },
            });

            // Record into StockLedger (Thẻ kho)
            await tx.stockLedger.create({
              data: {
                code: `TK-ORD-${newOrder.code}-${it.sku || it.productId.slice(-4)}-${Date.now().toString().slice(-4)}`,
                productId: it.productId,
                warehouseId: effectiveWarehouseId,
                type: "SALE",
                referenceType: "Order",
                referenceId: newOrder.id,
                referenceCode: newOrder.code,
                quantityChange: -totalUnitsToDeduct,
                balanceBefore,
                balanceAfter,
                costPrice: Number(it.costPricePerUnit) || 0,
                notes: `Xuất bán đơn hàng ${newOrder.code} cho khách ${customerName || "Khách Lẻ"}`,
                createdById: user?.userId,
                createdByName: user?.name || cashierName || "Thu Ngân POS",
              },
            });
          }
        }
      }

      // 3. Update Customer Debt if any
      if (validCustomerId && Number(debtAmount) > 0) {
        await tx.customer.update({
          where: { id: validCustomerId },
          data: {
            currentDebt: { increment: Number(debtAmount) },
            debtWithin30: { increment: Number(debtAmount) },
            historicalRevenue: { increment: Number(totalAmount) },
          },
        });
      }

      // 4. Update Cash Shift & create Cash Transaction if paid
      if (Number(paidAmount) > 0) {
        const activeShift = await tx.cashShift.findFirst({
          where: { isClosed: false },
          orderBy: { startedAt: "desc" },
        });

        if (activeShift) {
          const isCash = paymentMethod === "cash";
          await tx.cashShift.update({
            where: { id: activeShift.id },
            data: {
              cashSales: isCash ? { increment: Number(paidAmount) } : undefined,
              vietQrSales: !isCash ? { increment: Number(paidAmount) } : undefined,
              debtSales: Number(debtAmount) > 0 ? { increment: Number(debtAmount) } : undefined,
              expectedCash: isCash ? { increment: Number(paidAmount) } : undefined,
            },
          });
        }

        // Record CashTransaction voucher
        await tx.cashTransaction.create({
          data: {
            code: `PT-${Date.now().toString().slice(-6)}`,
            type: "thu",
            category: "Bán hàng",
            amount: Number(paidAmount),
            date: new Date().toISOString().slice(0, 16).replace("T", " "),
            person: customerName || "Khách Hàng",
            description: `Thu tiền bán hàng đơn ${newOrder.code}`,
            shiftId: activeShift?.id || null,
            fundType: paymentMethod === "vietqr" ? "bank" : "cash",
            partnerType: "customer",
            partnerId: validCustomerId,
            partnerName: customerName,
            referenceCode: newOrder.code,
            paymentMethod: paymentMethod === "vietqr" ? "vietqr" : "cash",
          },
        });
      }

      return newOrder;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error processing order" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { errorResponse } = await requirePermission(request, "manage_orders");
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: "ID và Status là bắt buộc" }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error updating order" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { errorResponse } = await requirePermission(request, "manage_orders");
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Order ID required" }, { status: 400 });
    }

    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error deleting order" },
      { status: 500 }
    );
  }
}
