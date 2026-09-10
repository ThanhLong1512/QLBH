import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const requests = await prisma.creditApprovalRequest.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: requests });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error fetching approvals" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      orderCode,
      customerId,
      customerName,
      customerPhone,
      orderTotal,
      currentDebt,
      creditLimit,
      excessAmount,
      requestedBy,
      reason,
      messages,
    } = body;

    const newReq = await prisma.creditApprovalRequest.create({
      data: {
        id: `appr-${Date.now()}`,
        orderCode: orderCode || `DH-${Date.now().toString().slice(-6)}`,
        customerId: customerId || "KH-UNKNOWN",
        customerName: customerName || "Khách Hàng",
        customerPhone: customerPhone || "---",
        orderTotal: Number(orderTotal) || 0,
        currentDebt: Number(currentDebt) || 0,
        creditLimit: Number(creditLimit) || 0,
        excessAmount: Number(excessAmount) || 0,
        requestedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
        requestedBy: requestedBy || "Thu Ngân",
        reason: reason || "Vượt hạn mức nợ",
        status: "pending",
        messages: messages || [
          {
            sender: requestedBy || "Thu Ngân",
            role: "cashier",
            timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
            text: reason || "Xin phê duyệt đơn hàng vượt hạn mức tín dụng.",
          },
        ],
      },
    });

    return NextResponse.json({ success: true, data: newReq });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error creating approval request" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, resolvedBy, responseMessage } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: "ID và Status là bắt buộc" }, { status: 400 });
    }

    const existing = await prisma.creditApprovalRequest.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Không tìm thấy yêu cầu" }, { status: 404 });
    }

    const currentMsgs = Array.isArray(existing.messages) ? existing.messages : [];
    if (responseMessage) {
      currentMsgs.push({
        sender: resolvedBy || "Quản Lý",
        role: "admin",
        timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
        text: responseMessage,
      });
    }

    const updated = await prisma.creditApprovalRequest.update({
      where: { id },
      data: {
        status,
        resolvedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
        resolvedBy: resolvedBy || "Quản Lý",
        messages: currentMsgs,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error resolving approval request" },
      { status: 500 }
    );
  }
}
