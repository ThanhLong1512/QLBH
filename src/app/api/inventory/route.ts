import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "inbounds" | "outbounds" | "batches"

    if (type === "batches") {
      const batches = await prisma.productBatch.findMany({ orderBy: { createdAt: "desc" } });
      return NextResponse.json({ success: true, data: batches });
    }

    if (type === "outbounds") {
      const outbounds = await prisma.stockOutboundReceipt.findMany({ orderBy: { createdAt: "desc" } });
      return NextResponse.json({ success: true, data: outbounds });
    }

    const inbounds = await prisma.stockInboundReceipt.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ success: true, data: inbounds });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error fetching inventory data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ...payload } = body;

    // 1. Stock Inbound (Nhập kho)
    if (action === "inbound") {
      const { supplierId, supplierName, creatorName, items, totalCost, paidAmount, debtAmount, paymentMethod } = payload;
      const code = `PNK-${Date.now().toString().slice(-6)}`;
      const date = new Date().toISOString().slice(0, 16).replace("T", " ");

      const result = await prisma.$transaction(async (tx) => {
        // Create Receipt
        const receipt = await tx.stockInboundReceipt.create({
          data: {
            code,
            date,
            supplierId: supplierId || "NCC-DEFAULT",
            supplierName: supplierName || "Nhà Cung Cấp",
            creatorName: creatorName || "Thủ Kho",
            totalCost: Number(totalCost) || 0,
            paidAmount: Number(paidAmount) || 0,
            debtAmount: Number(debtAmount) || 0,
            paymentMethod: paymentMethod || "bank_transfer",
            items: items || [],
          },
        });

        // Increment product stock
        if (items && Array.isArray(items)) {
          for (const it of items) {
            const addedStock = (Number(it.quantity) || 0) * (Number(it.conversionRate) || 1);
            if (it.productId) {
              await tx.product.updateMany({
                where: { id: it.productId },
                data: {
                  stockBaseUnits: { increment: addedStock },
                  costPrice: Number(it.unitCost) || undefined,
                },
              });
            }
          }
        }

        // Increment supplier debt if any
        if (supplierId && Number(debtAmount) > 0) {
          await tx.supplier.updateMany({
            where: { id: supplierId },
            data: {
              currentDebt: { increment: Number(debtAmount) },
              totalPurchased: { increment: Number(totalCost) },
            },
          });
        }

        return receipt;
      });

      return NextResponse.json({ success: true, data: result });
    }

    // 2. Stock Outbound (Xuất kho hủy/điều chuyển)
    if (action === "outbound") {
      const { reason, reasonLabel, creatorName, destination, items, totalCost } = payload;
      const code = `PXK-${Date.now().toString().slice(-6)}`;
      const date = new Date().toISOString().slice(0, 16).replace("T", " ");

      const result = await prisma.$transaction(async (tx) => {
        const receipt = await tx.stockOutboundReceipt.create({
          data: {
            code,
            date,
            reason: reason || "other",
            reasonLabel: reasonLabel || "Xuất khác",
            creatorName: creatorName || "Thủ Kho",
            destination: destination || null,
            totalCost: Number(totalCost) || 0,
            items: items || [],
          },
        });

        // Decrement product stock
        if (items && Array.isArray(items)) {
          for (const it of items) {
            const deduct = (Number(it.quantity) || 0) * (Number(it.conversionRate) || 1);
            if (it.productId) {
              await tx.product.updateMany({
                where: { id: it.productId },
                data: {
                  stockBaseUnits: { decrement: deduct },
                },
              });
            }
          }
        }

        return receipt;
      });

      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json({ success: false, error: "Invalid inventory action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error processing inventory action" },
      { status: 500 }
    );
  }
}
