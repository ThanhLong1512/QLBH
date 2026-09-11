import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const url = new URL(request.url);
    const productId = url.searchParams.get("productId");
    const warehouseId = url.searchParams.get("warehouseId");
    const type = url.searchParams.get("type");
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 50));
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const skip = (page - 1) * limit;

    const whereClause: Record<string, unknown> = {};
    if (productId) whereClause.productId = productId;
    if (warehouseId) whereClause.warehouseId = warehouseId;
    if (type) whereClause.type = type;

    const [ledgers, totalCount] = await Promise.all([
      prisma.stockLedger.findMany({
        where: whereClause,
        include: {
          product: {
            select: { id: true, name: true, sku: true, baseUnit: true, barcode: true },
          },
          warehouse: {
            select: { id: true, name: true, code: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.stockLedger.count({ where: whereClause }),
    ]);

    // Calculate aggregations
    let totalInflow = 0;
    let totalOutflow = 0;
    for (const entry of ledgers) {
      if (entry.quantityChange > 0) {
        totalInflow += entry.quantityChange;
      } else {
        totalOutflow += Math.abs(entry.quantityChange);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ledgers,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
        summary: {
          totalInflow,
          totalOutflow,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error querying stock ledger" },
      { status: 500 }
    );
  }
}
