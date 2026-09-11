import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const url = new URL(request.url);
    const warehouseId = url.searchParams.get("warehouseId");
    const productId = url.searchParams.get("productId");

    const whereClause: Record<string, unknown> = {};
    if (warehouseId) whereClause.warehouseId = warehouseId;
    if (productId) whereClause.productId = productId;

    const balances = await prisma.stockBalance.findMany({
      where: whereClause,
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            category: true,
            baseUnit: true,
            costPrice: true,
            priceRetail: true,
            priceWholesale: true,
            priceVip: true,
            barcode: true,
            imageUrl: true,
            minStockAlert: true,
          },
        },
        warehouse: {
          select: {
            id: true,
            code: true,
            name: true,
            isDefault: true,
          },
        },
      },
      orderBy: [{ warehouse: { isDefault: "desc" } }, { product: { name: "asc" } }],
    });

    return NextResponse.json({ success: true, data: balances });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error fetching stock balances" },
      { status: 500 }
    );
  }
}
