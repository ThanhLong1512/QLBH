import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
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
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Đơn hàng phải có ít nhất 1 sản phẩm" },
        { status: 400 }
      );
    }

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
          cashierName: cashierName || "Thu Ngân",
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

      // 2. Decrement Product Inventory Stock
      for (const it of items) {
        if (it.productId) {
          const totalUnitsToDeduct = (Number(it.quantity) || 1) * (Number(it.conversionRate) || 1);
          await tx.product.updateMany({
            where: { id: it.productId },
            data: {
              stockBaseUnits: {
                decrement: totalUnitsToDeduct,
              },
            },
          });
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
