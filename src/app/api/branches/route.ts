import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requirePermission } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

// GET all branches
export async function GET(request: Request) {
  try {
    const { errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const branches = await prisma.branch.findMany({
      where: { isActive: true },
      include: {
        warehouses: {
          where: { isActive: true },
        },
        _count: {
          select: { employees: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, data: branches });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error fetching branches" },
      { status: 500 }
    );
  }
}

// POST create branch
export async function POST(request: Request) {
  try {
    const { errorResponse } = await requirePermission(request, "system_settings");
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { code, name, address, phone } = body;

    if (!code || !name) {
      return NextResponse.json(
        { success: false, error: "Mã và Tên Chi Nhánh là bắt buộc" },
        { status: 400 }
      );
    }

    const branch = await prisma.branch.create({
      data: {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        address: address?.trim() || "",
        phone: phone?.trim() || "",
        isActive: true,
      },
      include: { warehouses: true },
    });

    return NextResponse.json({ success: true, data: branch });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error creating branch" },
      { status: 500 }
    );
  }
}

// PUT update branch
export async function PUT(request: Request) {
  try {
    const { errorResponse } = await requirePermission(request, "system_settings");
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { id, name, address, phone, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID Chi Nhánh là bắt buộc" },
        { status: 400 }
      );
    }

    const branch = await prisma.branch.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(address !== undefined && { address: address.trim() }),
        ...(phone !== undefined && { phone: phone.trim() }),
        ...(isActive !== undefined && { isActive }),
      },
      include: { warehouses: true },
    });

    return NextResponse.json({ success: true, data: branch });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error updating branch" },
      { status: 500 }
    );
  }
}
