import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const warranties = await prisma.warrantyTicket.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: warranties });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error fetching warranties" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerId,
      productId,
      productName,
      sku,
      serialNumber,
      orderCode,
      issueDescription,
      accessoriesAttached,
      technicianName,
      isUnderWarranty,
      repairCost,
      sparePartsCost,
      totalCost,
      notes,
      serviceRecords,
    } = body;

    const code = `PBH-${Date.now().toString().slice(-6)}`;
    const receivedDate = new Date().toISOString().slice(0, 16).replace("T", " ");

    const newTicket = await prisma.warrantyTicket.create({
      data: {
        code,
        customerName: customerName || "Khách Hàng",
        customerPhone: customerPhone || "---",
        customerId: customerId || null,
        productId: productId || null,
        productName: productName || "Sản phẩm",
        sku: sku || "UNKNOWN",
        serialNumber: serialNumber || null,
        orderCode: orderCode || null,
        receivedDate,
        status: "receiving",
        issueDescription: issueDescription || "Yêu cầu bảo hành",
        accessoriesAttached: accessoriesAttached || null,
        technicianName: technicianName || "Kỹ thuật viên",
        isUnderWarranty: isUnderWarranty !== undefined ? Boolean(isUnderWarranty) : true,
        repairCost: Number(repairCost) || 0,
        sparePartsCost: Number(sparePartsCost) || 0,
        totalCost: Number(totalCost) || 0,
        serviceRecords: serviceRecords || [],
        notes: notes || null,
      },
    });

    return NextResponse.json({ success: true, data: newTicket });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error creating warranty ticket" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Warranty Ticket ID required" }, { status: 400 });
    }

    const updated = await prisma.warrantyTicket.update({
      where: { id },
      data: {
        ...updateData,
        repairCost: updateData.repairCost !== undefined ? Number(updateData.repairCost) : undefined,
        sparePartsCost: updateData.sparePartsCost !== undefined ? Number(updateData.sparePartsCost) : undefined,
        totalCost: updateData.totalCost !== undefined ? Number(updateData.totalCost) : undefined,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error updating warranty ticket" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Warranty Ticket ID required" }, { status: 400 });
    }

    await prisma.warrantyTicket.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Warranty ticket deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error deleting warranty ticket" },
      { status: 500 }
    );
  }
}
