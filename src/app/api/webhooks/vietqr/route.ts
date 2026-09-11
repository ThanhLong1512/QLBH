import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Global in-memory cache for received VietQR webhook payments
type VietQRTransaction = {
  orderCode: string;
  amount: number;
  reference: string;
  bank: string;
  receivedAt: string;
  rawContent: string;
  status: "PAID";
};

const getGlobalTransactions = (): Map<string, VietQRTransaction> => {
  if (!(globalThis as any).__vietqrTransactions) {
    (globalThis as any).__vietqrTransactions = new Map<string, VietQRTransaction>();
  }
  return (globalThis as any).__vietqrTransactions;
};

/**
 * 0-Cost VietQR Webhook Receiver
 * Handles incoming webhooks from SePay, Casso, Bank Gateway or Simulated Webhooks
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      amountIn,
      amountOut,
      code,
      transactionContent,
      referenceNumber,
      orderCode: directOrderCode,
      gateway,
      bank,
    } = body;

    const rawAmount = amountIn || body.amount || amountOut || 0;
    const amount = typeof rawAmount === "string" ? parseFloat(rawAmount.replace(/[^0-9.-]+/g, "")) : Number(rawAmount);
    const content = transactionContent || code || body.description || body.content || "";

    // Extract Order Code: regex matching standard patterns like DH-123456 or explicit directOrderCode
    let orderCode = directOrderCode || "";
    if (!orderCode && content) {
      const match = content.match(/(DH-\d+|ORDER-[A-Z0-9]+|[A-Z]{2,4}-\d{4,12})/i);
      if (match) {
        orderCode = match[0].toUpperCase();
      } else {
        // Fallback: take entire trimmed content as key if short
        orderCode = content.trim().toUpperCase();
      }
    }

    const ref = referenceNumber || body.id || `MB-NAPAS-${Date.now().toString().slice(-6)}`;
    const bankName = gateway || bank || "MB Bank (Napas 247 0đ)";

    const paymentRecord: VietQRTransaction = {
      orderCode: orderCode.toUpperCase(),
      amount: amount || 0,
      reference: ref,
      bank: bankName,
      receivedAt: new Date().toISOString(),
      rawContent: content,
      status: "PAID",
    };

    // Save to global in-memory transaction registry
    const transMap = getGlobalTransactions();
    if (orderCode) {
      transMap.set(orderCode.toUpperCase(), paymentRecord);
    }
    // Also index by reference number
    transMap.set(ref.toUpperCase(), paymentRecord);

    console.log(`[VietQR Webhook] Received payment for order ${orderCode}: +${amount} VNĐ (Ref: ${ref})`);

    // End-to-end Database Persistence: If order exists in PostgreSQL, mark as paid
    if (orderCode) {
      try {
        const existingOrder = await prisma.order.findFirst({
          where: {
            OR: [
              { code: orderCode },
              { code: orderCode.toUpperCase() }
            ]
          }
        });

        if (existingOrder && existingOrder.status !== "completed") {
          await prisma.order.update({
            where: { id: existingOrder.id },
            data: {
              status: "completed",
              paidAmount: amount > 0 ? amount : existingOrder.totalAmount,
              debtAmount: 0,
              paymentMethod: "vietqr"
            }
          });
          console.log(`[VietQR Webhook] Auto-closed order ${existingOrder.code} in PostgreSQL DB.`);
        }
      } catch (dbErr) {
        console.warn("[VietQR Webhook] DB auto-close notice:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Đã xác nhận thanh toán VietQR Napas 247 thành công cho đơn ${orderCode || ref}`,
      data: paymentRecord,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Lỗi xử lý webhook VietQR",
      },
      { status: 400 }
    );
  }
}

/**
 * GET Handler:
 * Query status of a specific orderCode: /api/webhooks/vietqr?orderCode=DH-123456
 * Or return list of recent received webhook transactions
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderCode = searchParams.get("orderCode") || searchParams.get("code");

  const transMap = getGlobalTransactions();

  if (orderCode) {
    const norm = orderCode.trim().toUpperCase();
    const found = transMap.get(norm);

    if (found) {
      return NextResponse.json({
        success: true,
        paid: true,
        data: found,
      });
    }

    // Fallback: check PostgreSQL Database if order is marked as completed with paidAmount >= totalAmount
    try {
      const dbOrder = await prisma.order.findFirst({
        where: {
          OR: [{ code: norm }, { code: orderCode }]
        }
      });
      if (dbOrder && (dbOrder.status === "completed" || dbOrder.paidAmount >= dbOrder.totalAmount)) {
        return NextResponse.json({
          success: true,
          paid: true,
          data: {
            orderCode: dbOrder.code,
            amount: dbOrder.totalAmount,
            reference: `DB-${dbOrder.id.slice(-6)}`,
            bank: "VietQR (Đã thanh toán)",
            receivedAt: dbOrder.createdAt.toISOString(),
            rawContent: dbOrder.code,
            status: "PAID",
          },
        });
      }
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      paid: false,
      message: `Chưa ghi nhận biến động số dư cho mã đơn ${orderCode}`,
    });
  }

  // If no orderCode, return recent transactions list & health status
  const recentTransactions = Array.from(transMap.values()).slice(-20).reverse();

  return NextResponse.json({
    status: "active",
    name: "VietQR End-to-End Real-Time Webhook Gateway",
    mode: "live_napas247",
    supportedBanks: ["MB", "VCB", "TCB", "ACB", "VPB", "BIDV", "VIB", "TPB"],
    recentCount: recentTransactions.length,
    recentTransactions,
  });
}
