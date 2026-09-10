import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: suppliers });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error fetching suppliers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name, contactPerson, phone, email, address, taxId, category, currentDebt, paymentTermsDays, bankName, bankAccount, bankAccountName } = body;

    const supplierCode = code || `NCC-${Date.now().toString().slice(-4)}`;

    const newSupplier = await prisma.supplier.create({
      data: {
        code: supplierCode,
        name,
        contactPerson: contactPerson || "",
        phone: phone || "",
        email: email || "",
        address: address || "",
        taxId: taxId || "",
        category: category || "Dầu Nhờn & Phụ Gia",
        currentDebt: Number(currentDebt) || 0,
        paymentTermsDays: Number(paymentTermsDays) || 30,
        bankName: bankName || null,
        bankAccount: bankAccount || null,
        bankAccountName: bankAccountName || null,
      },
    });

    return NextResponse.json({ success: true, data: newSupplier });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error creating supplier" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Supplier ID required" }, { status: 400 });
    }

    const updated = await prisma.supplier.update({
      where: { id },
      data: {
        ...updateData,
        currentDebt: updateData.currentDebt !== undefined ? Number(updateData.currentDebt) : undefined,
        paymentTermsDays: updateData.paymentTermsDays !== undefined ? Number(updateData.paymentTermsDays) : undefined,
        totalPurchased: updateData.totalPurchased !== undefined ? Number(updateData.totalPurchased) : undefined,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error updating supplier" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Supplier ID required" }, { status: 400 });
    }

    await prisma.supplier.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Supplier deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error deleting supplier" },
      { status: 500 }
    );
  }
}
