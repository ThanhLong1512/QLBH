import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
    });

    const formatted = customers.map((c) => ({
      ...c,
      debtAging: {
        within30: c.debtWithin30,
        days31to60: c.debtDays31to60,
        days61to90: c.debtDays61to90,
        over90: c.debtOver90,
      },
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error fetching customers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name, phone, address, tier, creditLimit, paymentTermDays } = body;

    if (!name || !phone) {
      return NextResponse.json({ success: false, error: "Tên và SĐT là bắt buộc" }, { status: 400 });
    }

    const customerCode = code || `KH-${Date.now().toString().slice(-4)}`;

    const newCustomer = await prisma.customer.create({
      data: {
        code: customerCode,
        name,
        phone,
        address: address || "",
        tier: tier || "bac",
        creditLimit: Number(creditLimit) || 20000000,
        paymentTermDays: Number(paymentTermDays) || 30,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...newCustomer,
        debtAging: { within30: 0, days31to60: 0, days61to90: 0, over90: 0 },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error creating customer" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, debtAging, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Customer ID required" }, { status: 400 });
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        ...updateData,
        creditLimit: updateData.creditLimit !== undefined ? Number(updateData.creditLimit) : undefined,
        currentDebt: updateData.currentDebt !== undefined ? Number(updateData.currentDebt) : undefined,
        debtWithin30: debtAging?.within30 !== undefined ? Number(debtAging.within30) : undefined,
        debtDays31to60: debtAging?.days31to60 !== undefined ? Number(debtAging.days31to60) : undefined,
        debtDays61to90: debtAging?.days61to90 !== undefined ? Number(debtAging.days61to90) : undefined,
        debtOver90: debtAging?.over90 !== undefined ? Number(debtAging.over90) : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        debtAging: {
          within30: updated.debtWithin30,
          days31to60: updated.debtDays31to60,
          days61to90: updated.debtDays61to90,
          over90: updated.debtOver90,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error updating customer" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Customer ID required" }, { status: 400 });
    }

    await prisma.customer.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error deleting customer" },
      { status: 500 }
    );
  }
}
