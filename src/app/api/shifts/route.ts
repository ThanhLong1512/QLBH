import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const shifts = await prisma.cashShift.findMany({
      orderBy: { startedAt: "desc" },
      include: { transactions: true },
    });
    return NextResponse.json({ success: true, data: shifts });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error fetching shifts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ...shiftData } = body;

    // Action 1: Open new shift
    if (action === "open") {
      const { cashierName, openingCash } = shiftData;
      const startedAt = new Date().toISOString().slice(0, 16).replace("T", " ");

      const newShift = await prisma.cashShift.create({
        data: {
          id: `shift-${Date.now()}`,
          cashierName: cashierName || "Thu Ngân",
          startedAt,
          openingCash: Number(openingCash) || 0,
          expectedCash: Number(openingCash) || 0,
          isClosed: false,
        },
      });

      return NextResponse.json({ success: true, data: newShift });
    }

    // Action 2: Close active shift
    if (action === "close") {
      const { id, actualCash, variance, varianceReason, managerSignOff } = shiftData;
      const closedAt = new Date().toISOString().slice(0, 16).replace("T", " ");

      const closed = await prisma.cashShift.update({
        where: { id },
        data: {
          closedAt,
          actualCash: Number(actualCash) || 0,
          variance: Number(variance) || 0,
          varianceReason: varianceReason || null,
          isClosed: true,
          managerSignOff: managerSignOff || null,
        },
      });

      return NextResponse.json({ success: true, data: closed });
    }

    // Action 3: Cash Drop (Rút tiền két)
    if (action === "cash_drop") {
      const { id, dropAmount } = shiftData;
      const updated = await prisma.cashShift.update({
        where: { id },
        data: {
          cashDrops: { increment: Number(dropAmount) || 0 },
          expectedCash: { decrement: Number(dropAmount) || 0 },
        },
      });

      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({ success: false, error: "Invalid shift action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error handling shift" },
      { status: 500 }
    );
  }
}
