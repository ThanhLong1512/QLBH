import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const returns = await prisma.returnReceipt.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: returns });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error fetching returns" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const {
      type,
      referenceOrderCode,
      partnerId,
      partnerName,
      partnerPhone,
      creatorName,
      totalRefundAmount,
      refundMethod,
      notes,
      items,
    } = payload;

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const counter = Math.floor(100 + Math.random() * 900);
    const code = `PTH-${dateStr}-${counter}`;
    const date = new Date().toISOString().slice(0, 16).replace("T", " ");

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create return receipt
      const receipt = await tx.returnReceipt.create({
        data: {
          code,
          type: type || "customer_return",
          date,
          referenceOrderCode: referenceOrderCode || null,
          partnerId: partnerId || "PARTNER-UNKNOWN",
          partnerName: partnerName || "Khách hàng",
          partnerPhone: partnerPhone || null,
          creatorName: creatorName || "Nhân viên",
          totalRefundAmount: Number(totalRefundAmount) || 0,
          refundMethod: refundMethod || "cash",
          status: "completed",
          notes: notes || null,
          items: items || [],
        },
      });

      // 2. Handle stock & finances
      if (type === "customer_return") {
        // Restock products if marked restock
        if (items && Array.isArray(items)) {
          for (const it of items) {
            if (it.productId && it.condition === "restock") {
              const qtyToAdd = (Number(it.quantity) || 0) * (Number(it.conversionRate) || 1);
              await tx.product.updateMany({
                where: { id: it.productId },
                data: {
                  stockBaseUnits: { increment: qtyToAdd },
                },
              });
            }
          }
        }

        // Refund method handling
        if (refundMethod === "cash" && Number(totalRefundAmount) > 0) {
          const openShift = await tx.cashShift.findFirst({
            where: { isClosed: false },
            orderBy: { createdAt: "desc" },
          });

          await tx.cashTransaction.create({
            data: {
              code: `PC-${Math.floor(10000 + Math.random() * 90000)}`,
              type: "chi",
              category: "Hoàn tiền trả hàng",
              amount: Number(totalRefundAmount),
              date,
              person: partnerName || "Khách hàng",
              description: `Hoàn tiền phiếu trả hàng ${code}`,
              shiftId: openShift?.id || null,
              fundType: "cash",
              partnerType: "customer",
              partnerId: partnerId || null,
              partnerName: partnerName || null,
              referenceCode: code,
              paymentMethod: "cash",
            },
          });

          if (openShift) {
            await tx.cashShift.update({
              where: { id: openShift.id },
              data: {
                expectedCash: { decrement: Number(totalRefundAmount) },
              },
            });
          }
        } else if (refundMethod === "debt_deduction" && partnerId && Number(totalRefundAmount) > 0) {
          await tx.customer.updateMany({
            where: { id: partnerId },
            data: {
              currentDebt: { decrement: Number(totalRefundAmount) },
            },
          });
        }
      } else if (type === "supplier_return") {
        // Deduct returned items from inventory
        if (items && Array.isArray(items)) {
          for (const it of items) {
            if (it.productId) {
              const deductQty = (Number(it.quantity) || 0) * (Number(it.conversionRate) || 1);
              await tx.product.updateMany({
                where: { id: it.productId },
                data: {
                  stockBaseUnits: { decrement: deductQty },
                },
              });
            }
          }
        }

        // Reduce supplier debt
        if (partnerId && Number(totalRefundAmount) > 0) {
          await tx.supplier.updateMany({
            where: { id: partnerId },
            data: {
              currentDebt: { decrement: Number(totalRefundAmount) },
            },
          });
        }
      }

      return receipt;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error creating return receipt" },
      { status: 500 }
    );
  }
}
