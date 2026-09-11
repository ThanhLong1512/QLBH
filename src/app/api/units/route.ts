import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DEFAULT_UNITS = [
  // Base Units (Đơn vị cơ bản)
  { name: "Cái", code: "CAI", description: "Đơn vị đếm chiếc/cái tiêu chuẩn", type: "base" },
  { name: "Lon", code: "LON", description: "Đơn vị lon nước, bia, thực phẩm đóng lon", type: "base" },
  { name: "Chai", code: "CHAI", description: "Chai thủy tinh, chai nhựa dung dịch", type: "base" },
  { name: "Hộp", code: "HOP", description: "Hộp giấy, hộp kim loại", type: "base" },
  { name: "Gói", code: "GOI", description: "Gói gia vị, bánh kẹo, hóa phẩm", type: "base" },
  { name: "Can", code: "CAN", description: "Can nhựa 1L, 2L, 5L dầu nhớt, nước rửa", type: "base" },
  { name: "Bao", code: "BAO", description: "Bao 10kg, 25kg, 50kg nông sản, phụ gia", type: "base" },
  { name: "Vỉ", code: "VI", description: "Vỉ thuốc, vỉ sữa chua, vỉ pin", type: "base" },
  { name: "Chiếc", code: "CHIEC", description: "Chiếc thiết bị điện máy, phụ kiện", type: "base" },
  { name: "Kg", code: "KG", description: "Kilogram cân nặng tiêu chuẩn", type: "base" },
  { name: "Lít", code: "LIT", description: "Đơn vị thể tích chất lỏng", type: "base" },
  { name: "Mét", code: "MET", description: "Đơn vị đo chiều dài dây cáp, vải vóc", type: "base" },
  
  // Packaging Units (Đơn vị đóng gói / quy đổi)
  { name: "Thùng", code: "THUNG", description: "Thùng carton 12/24/48 đơn vị cơ bản", type: "packaging" },
  { name: "Lốc", code: "LOC", description: "Lốc 4 lon/chai hoặc 6 lon/chai", type: "packaging" },
  { name: "Kiện", code: "KIEN", description: "Kiện hàng pallet lớn hoặc khối hàng sỉ", type: "packaging" },
  { name: "Két", code: "KET", description: "Két bia hoặc két chai nước ngọt", type: "packaging" },
];

// GET all units of measure with usage count
export async function GET() {
  try {
    let units = await prisma.unitOfMeasure.findMany({
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });

    // Auto-seed if empty
    if (units.length === 0) {
      // Find existing base units from Product table
      const existingProducts = await prisma.product.findMany({
        select: { baseUnit: true },
        where: { isActive: true },
      });
      const uniqueBaseUnits = Array.from(new Set(existingProducts.map(p => p.baseUnit).filter(Boolean)));
      
      const seedMap = new Map<string, { name: string; code: string; description: string; type: string }>();
      DEFAULT_UNITS.forEach(u => seedMap.set(u.name, u));

      uniqueBaseUnits.forEach((name, i) => {
        if (!seedMap.has(name)) {
          seedMap.set(name, {
            name,
            code: `UOM-${(i + 1).toString().padStart(2, "0")}`,
            description: `Đơn vị tính ${name}`,
            type: "base",
          });
        }
      });

      for (const item of Array.from(seedMap.values())) {
        try {
          await prisma.unitOfMeasure.upsert({
            where: { name: item.name },
            update: {},
            create: item,
          });
        } catch {}
      }

      units = await prisma.unitOfMeasure.findMany({
        orderBy: [{ type: "asc" }, { name: "asc" }],
      });
    }

    // Count usage across products and packaging units
    const [baseCounts, packCounts] = await Promise.all([
      prisma.product.groupBy({
        by: ["baseUnit"],
        _count: { id: true },
        where: { isActive: true },
      }),
      prisma.packagingUnit.groupBy({
        by: ["name"],
        _count: { id: true },
      }),
    ]);

    const countMap: Record<string, number> = {};
    baseCounts.forEach(bc => {
      countMap[bc.baseUnit] = (countMap[bc.baseUnit] || 0) + bc._count.id;
    });
    packCounts.forEach(pc => {
      countMap[pc.name] = (countMap[pc.name] || 0) + pc._count.id;
    });

    const enriched = units.map((u: any) => ({
      ...u,
      productCount: countMap[u.name] || 0,
    }));

    return NextResponse.json({ success: true, data: enriched });
  } catch (error) {
    console.error("Fetch units error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error fetching units" },
      { status: 500 }
    );
  }
}

// POST create unit
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, code, description, type } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: "Tên đơn vị tính là bắt buộc" }, { status: 400 });
    }

    const trimmedName = name.trim();
    const generatedCode = (code || trimmedName.slice(0, 4).toUpperCase()).trim();

    const created = await prisma.unitOfMeasure.create({
      data: {
        name: trimmedName,
        code: generatedCode,
        description: description?.trim() || null,
        type: type === "packaging" ? "packaging" : "base",
      },
    });

    return NextResponse.json({ success: true, data: { ...created, productCount: 0 } });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ success: false, error: "Tên ĐVT hoặc mã ĐVT đã tồn tại" }, { status: 400 });
    }
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error creating unit" },
      { status: 500 }
    );
  }
}

// PUT update unit
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, oldName, newName, code, description, type } = body;

    if (!id || !newName || !newName.trim()) {
      return NextResponse.json({ success: false, error: "Thông tin cập nhật ĐVT không hợp lệ" }, { status: 400 });
    }

    const trimmedNewName = newName.trim();

    const updated = await prisma.unitOfMeasure.update({
      where: { id },
      data: {
        name: trimmedNewName,
        code: code?.trim() || undefined,
        description: description !== undefined ? description?.trim() || null : undefined,
        type: type === "packaging" ? "packaging" : "base",
      },
    });

    // Cascade rename to Product & PackagingUnit if name changed
    if (oldName && oldName !== trimmedNewName) {
      await prisma.product.updateMany({
        where: { baseUnit: oldName },
        data: { baseUnit: trimmedNewName },
      });
      await prisma.packagingUnit.updateMany({
        where: { name: oldName },
        data: { name: trimmedNewName },
      });
    }

    // Recount products
    const [baseCount, packCount] = await Promise.all([
      prisma.product.count({ where: { baseUnit: trimmedNewName, isActive: true } }),
      prisma.packagingUnit.count({ where: { name: trimmedNewName } }),
    ]);

    return NextResponse.json({
      success: true,
      data: { ...updated, productCount: baseCount + packCount },
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ success: false, error: "Tên ĐVT hoặc mã ĐVT đã tồn tại" }, { status: 400 });
    }
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error updating unit" },
      { status: 500 }
    );
  }
}

// DELETE unit
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Unit ID required" }, { status: 400 });
    }

    const unit = await prisma.unitOfMeasure.findUnique({ where: { id } });
    if (!unit) {
      return NextResponse.json({ success: false, error: "Không tìm thấy đơn vị tính" }, { status: 404 });
    }

    // Check usage
    const inUseProductCount = await prisma.product.count({
      where: { baseUnit: unit.name, isActive: true },
    });
    const inUsePackCount = await prisma.packagingUnit.count({
      where: { name: unit.name },
    });
    const totalInUse = inUseProductCount + inUsePackCount;

    if (totalInUse > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Không thể xóa ĐVT '${unit.name}' vì đang có ${totalInUse} sản phẩm/quy cách đóng gói sử dụng. Vui lòng đổi ĐVT của các sản phẩm trước khi xóa.`,
        },
        { status: 400 }
      );
    }

    await prisma.unitOfMeasure.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: `Đã xóa đơn vị tính '${unit.name}' thành công.`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error deleting unit" },
      { status: 500 }
    );
  }
}
