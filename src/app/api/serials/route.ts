import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const serials = await prisma.serialItem.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: serials });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error fetching serials" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if bulk insert
    if (Array.isArray(body)) {
      const created = [];
      for (const item of body) {
        const serialNumber = item.serialNumber?.trim().toUpperCase();
        if (!serialNumber) continue;

        const record = await prisma.serialItem.upsert({
          where: { serialNumber },
          update: {
            sku: item.sku || "UNKNOWN",
            productName: item.productName || "Sản phẩm",
            importDate: item.importDate || new Date().toISOString().slice(0, 10),
            supplier: item.supplier || "NCC",
            orderCode: item.orderCode || null,
            customerName: item.customerName || null,
            customerPhone: item.customerPhone || null,
            warrantyUntil: item.warrantyUntil || "",
            status: item.status || "in_stock",
            notes: item.notes || null,
            batchNumber: item.batchNumber || null,
            timeline: item.timeline || [],
          },
          create: {
            serialNumber,
            sku: item.sku || "UNKNOWN",
            productName: item.productName || "Sản phẩm",
            importDate: item.importDate || new Date().toISOString().slice(0, 10),
            supplier: item.supplier || "NCC",
            orderCode: item.orderCode || null,
            customerName: item.customerName || null,
            customerPhone: item.customerPhone || null,
            warrantyUntil: item.warrantyUntil || "",
            status: item.status || "in_stock",
            notes: item.notes || null,
            batchNumber: item.batchNumber || null,
            timeline: item.timeline || [],
          },
        });
        created.push(record);
      }
      return NextResponse.json({ success: true, data: created });
    }

    // Single insert
    const { serialNumber, sku, productName, importDate, supplier, warrantyUntil, status, notes, batchNumber, timeline } = body;
    const cleanSn = serialNumber?.trim().toUpperCase();
    if (!cleanSn) {
      return NextResponse.json({ success: false, error: "Serial number is required" }, { status: 400 });
    }

    const created = await prisma.serialItem.create({
      data: {
        serialNumber: cleanSn,
        sku: sku || "UNKNOWN",
        productName: productName || "Sản phẩm",
        importDate: importDate || new Date().toISOString().slice(0, 10),
        supplier: supplier || "NCC",
        warrantyUntil: warrantyUntil || "",
        status: status || "in_stock",
        notes: notes || null,
        batchNumber: batchNumber || null,
        timeline: timeline || [],
      },
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error saving serial" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { serialNumber, ...updateData } = body;

    if (!serialNumber) {
      return NextResponse.json({ success: false, error: "Serial number is required" }, { status: 400 });
    }

    const updated = await prisma.serialItem.update({
      where: { serialNumber: serialNumber.trim().toUpperCase() },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error updating serial" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const serialNumber = searchParams.get("serialNumber");

    if (!serialNumber) {
      return NextResponse.json({ success: false, error: "Serial number is required" }, { status: 400 });
    }

    await prisma.serialItem.delete({
      where: { serialNumber: serialNumber.trim().toUpperCase() },
    });

    return NextResponse.json({ success: true, message: "Serial deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error deleting serial" },
      { status: 500 }
    );
  }
}
