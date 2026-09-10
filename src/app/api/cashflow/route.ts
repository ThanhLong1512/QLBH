import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const transactions = await prisma.cashTransaction.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: transactions });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error fetching transactions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      type,
      category,
      amount,
      person,
      description,
      shiftId,
      fundType,
      partnerType,
      partnerId,
      partnerName,
      referenceCode,
      paymentMethod,
    } = body;

    const code = (type === "thu" ? "PT-" : "PC-") + Date.now().toString().slice(-6);
    const date = new Date().toISOString().slice(0, 16).replace("T", " ");

    const newTx = await prisma.cashTransaction.create({
      data: {
        code,
        type: type || "thu",
        category: category || "Khác",
        amount: Number(amount) || 0,
        date,
        person: person || "Nhân viên",
        description: description || "",
        shiftId: shiftId || null,
        fundType: fundType || "cash",
        partnerType: partnerType || "other",
        partnerId: partnerId || null,
        partnerName: partnerName || null,
        referenceCode: referenceCode || null,
        paymentMethod: paymentMethod || "cash",
      },
    });

    // If shift is active and transaction is cash, update expectedCash in shift
    if (shiftId && fundType === "cash") {
      const delta = type === "thu" ? Number(amount) : -Number(amount);
      await prisma.cashShift.update({
        where: { id: shiftId },
        data: {
          expectedCash: { increment: delta },
        },
      });
    }

    return NextResponse.json({ success: true, data: newTx });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error creating transaction" },
      { status: 500 }
    );
  }
}
