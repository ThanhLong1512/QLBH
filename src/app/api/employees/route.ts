import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: employees });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error fetching employees" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name, phone, email, role, roleTitle, branch, status, hireDate, baseSalary, commissionRate, notes, avatar } = body;

    const empCode = code || `NV-${Date.now().toString().slice(-4)}`;

    const newEmp = await prisma.employee.create({
      data: {
        code: empCode,
        name,
        phone: phone || "",
        email: email || "",
        role: role || "cashier",
        roleTitle: roleTitle || "Nhân Viên",
        branch: branch || "Kho Tổng",
        status: status || "active",
        hireDate: hireDate || new Date().toISOString().slice(0, 10),
        baseSalary: Number(baseSalary) || 0,
        commissionRate: Number(commissionRate) || 0,
        notes: notes || null,
        avatar: avatar || null,
      },
    });

    return NextResponse.json({ success: true, data: newEmp });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error creating employee" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Employee ID required" }, { status: 400 });
    }

    const updated = await prisma.employee.update({
      where: { id },
      data: {
        ...updateData,
        baseSalary: updateData.baseSalary !== undefined ? Number(updateData.baseSalary) : undefined,
        commissionRate: updateData.commissionRate !== undefined ? Number(updateData.commissionRate) : undefined,
        totalOrdersHandled: updateData.totalOrdersHandled !== undefined ? Number(updateData.totalOrdersHandled) : undefined,
        totalRevenueGenerated: updateData.totalRevenueGenerated !== undefined ? Number(updateData.totalRevenueGenerated) : undefined,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error updating employee" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Employee ID required" }, { status: 400 });
    }

    await prisma.employee.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Employee deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error deleting employee" },
      { status: 500 }
    );
  }
}
