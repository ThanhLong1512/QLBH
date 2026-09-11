import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requirePermission } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

// GET all active warehouses
export async function GET(request: Request) {
  try {
    const { errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const warehouses = await prisma.warehouse.findMany({
      where: { isActive: true },
      include: {
        branch: true,
        _count: {
          select: { stockBalances: true },
        },
      },
      orderBy: [
        { isDefault: "desc" },
        { createdAt: "asc" },
      ],
    });

    return NextResponse.json({ success: true, data: warehouses });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error fetching warehouses" },
      { status: 500 }
    );
  }
}

// POST create warehouse
export async function POST(request: Request) {
  try {
    const { errorResponse } = await requirePermission(request, "manage_warehouse");
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { code, name, branchId, address, phone, isDefault } = body;

    if (!code || !name) {
      return NextResponse.json(
        { success: false, error: "Mã và Tên Kho Hàng là bắt buộc" },
        { status: 400 }
      );
    }

    // If marked as default, unset other default warehouses
    if (isDefault) {
      await prisma.warehouse.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const warehouse = await prisma.warehouse.create({
      data: {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        branchId: branchId || null,
        address: address?.trim() || "",
        phone: phone?.trim() || "",
        isDefault: Boolean(isDefault),
        isActive: true,
      },
      include: { branch: true },
    });

    // Auto-create initial stock balance rows for all existing products
    const products = await prisma.product.findMany({ select: { id: true, minStockAlert: true } });
    if (products.length > 0) {
      await prisma.stockBalance.createMany({
        data: products.map((p) => ({
          productId: p.id,
          warehouseId: warehouse.id,
          quantity: 0,
          minStockAlert: p.minStockAlert || 10,
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json({ success: true, data: warehouse });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error creating warehouse" },
      { status: 500 }
    );
  }
}

// PUT update warehouse
export async function PUT(request: Request) {
  try {
    const { errorResponse } = await requirePermission(request, "manage_warehouse");
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { id, name, branchId, address, phone, isDefault, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID Kho Hàng là bắt buộc" },
        { status: 400 }
      );
    }

    if (isDefault) {
      await prisma.warehouse.updateMany({
        where: { id: { not: id }, isDefault: true },
        data: { isDefault: false },
      });
    }

    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(branchId !== undefined && { branchId: branchId || null }),
        ...(address !== undefined && { address: address.trim() }),
        ...(phone !== undefined && { phone: phone.trim() }),
        ...(isDefault !== undefined && { isDefault: Boolean(isDefault) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
      include: { branch: true },
    });

    return NextResponse.json({ success: true, data: warehouse });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error updating warehouse" },
      { status: 500 }
    );
  }
}
