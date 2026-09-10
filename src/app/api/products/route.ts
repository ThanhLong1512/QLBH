import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET all active products
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { units: true, batches: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error fetching products" },
      { status: 500 }
    );
  }
}

// POST create new product
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      sku,
      name,
      category,
      baseUnit,
      costPrice,
      priceRetail,
      priceWholesale,
      priceVip,
      stockBaseUnits,
      minStockAlert,
      hasSerial,
      hasExpiry,
      barcode,
      imageUrl,
      units,
    } = body;

    if (!sku || !name) {
      return NextResponse.json(
        { success: false, error: "SKU and Product Name are required" },
        { status: 400 }
      );
    }

    const newProduct = await prisma.product.create({
      data: {
        sku,
        name,
        category: category || "Điện Máy",
        baseUnit: baseUnit || "Cái",
        costPrice: Number(costPrice) || 0,
        priceRetail: Number(priceRetail) || 0,
        priceWholesale: Number(priceWholesale) || 0,
        priceVip: Number(priceVip) || 0,
        stockBaseUnits: Number(stockBaseUnits) || 0,
        minStockAlert: Number(minStockAlert) || 10,
        hasSerial: Boolean(hasSerial),
        hasExpiry: Boolean(hasExpiry),
        barcode: barcode || "",
        imageUrl: imageUrl || null,
        units: units && units.length > 0 ? {
          create: units.map((u: any) => ({
            name: u.name,
            conversionRate: Number(u.conversionRate) || 1,
            isBase: Boolean(u.isBase),
            priceRetail: Number(u.priceRetail) || 0,
            priceWholesale: Number(u.priceWholesale) || 0,
            priceVip: Number(u.priceVip) || 0,
          }))
        } : undefined,
      },
      include: { units: true },
    });

    return NextResponse.json({ success: true, data: newProduct });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error creating product" },
      { status: 500 }
    );
  }
}

// PUT update product
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, units, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID required" }, { status: 400 });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        costPrice: updateData.costPrice !== undefined ? Number(updateData.costPrice) : undefined,
        priceRetail: updateData.priceRetail !== undefined ? Number(updateData.priceRetail) : undefined,
        priceWholesale: updateData.priceWholesale !== undefined ? Number(updateData.priceWholesale) : undefined,
        priceVip: updateData.priceVip !== undefined ? Number(updateData.priceVip) : undefined,
        stockBaseUnits: updateData.stockBaseUnits !== undefined ? Number(updateData.stockBaseUnits) : undefined,
      },
      include: { units: true },
    });

    if (units && Array.isArray(units)) {
      await prisma.packagingUnit.deleteMany({ where: { productId: id } });
      await prisma.packagingUnit.createMany({
        data: units.map((u: any) => ({
          productId: id,
          name: u.name,
          conversionRate: Number(u.conversionRate) || 1,
          isBase: Boolean(u.isBase),
          priceRetail: Number(u.priceRetail) || 0,
          priceWholesale: Number(u.priceWholesale) || 0,
          priceVip: Number(u.priceVip) || 0,
        })),
      });
    }

    const refreshed = await prisma.product.findUnique({
      where: { id },
      include: { units: true },
    });

    return NextResponse.json({ success: true, data: refreshed });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error updating product" },
      { status: 500 }
    );
  }
}

// DELETE soft delete
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID required" }, { status: 400 });
    }

    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, message: "Product deactivated successfully" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error deleting product" },
      { status: 500 }
    );
  }
}
