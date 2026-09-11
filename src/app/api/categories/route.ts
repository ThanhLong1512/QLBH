import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DEFAULT_CATEGORIES = [
  { name: "Điện Máy", code: "DM", description: "Tivi, Tủ Lạnh, Máy Giặt, Điều Hòa", color: "indigo" },
  { name: "Gia Dụng", code: "GD", description: "Nồi Cơm, Máy Xay, Quạt Điện, Bếp Từ", color: "purple" },
  { name: "Hóa Mỹ Phẩm", code: "HMP", description: "Bột Giặt, Nước Rửa Chén, Dầu Gội", color: "emerald" },
  { name: "Dầu Nhờn & Phụ Gia", code: "DN", description: "Dầu Động Cơ, Dầu Thủy Lực, Nước Làm Mát", color: "amber" },
  { name: "Nước Giải Khát", code: "NGK", description: "Bia, Nước Ngọt, Nước Khoáng", color: "blue" },
  { name: "Thiết Bị Điện", code: "TBD", description: "Công Tắc, Ổ Cắm, Dây Điện, Đèn LED", color: "rose" },
];

// GET all product categories with product count
export async function GET() {
  try {
    let categories = await prisma.productCategory.findMany({
      orderBy: { createdAt: "asc" },
    });

    // Auto-seed if empty
    if (categories.length === 0) {
      // Find existing categories from Product table
      const existingProducts = await prisma.product.findMany({
        select: { category: true },
        where: { isActive: true },
      });
      const uniqueNames = Array.from(new Set(existingProducts.map(p => p.category).filter(Boolean)));
      
      const seedList = uniqueNames.length > 0
        ? uniqueNames.map((name, i) => ({
            name,
            code: `CAT-${(i + 1).toString().padStart(2, '0')}`,
            description: `Nhóm sản phẩm ${name}`,
            color: DEFAULT_CATEGORIES[i % DEFAULT_CATEGORIES.length]?.color || "indigo"
          }))
        : DEFAULT_CATEGORIES;

      for (const item of seedList) {
        try {
          await prisma.productCategory.upsert({
            where: { name: item.name },
            update: {},
            create: item,
          });
        } catch {}
      }

      categories = await prisma.productCategory.findMany({
        orderBy: { createdAt: "asc" },
      });
    }

    // Count products per category
    const productCounts = await prisma.product.groupBy({
      by: ['category'],
      _count: { id: true },
      where: { isActive: true },
    });

    const countMap: Record<string, number> = {};
    productCounts.forEach(pc => {
      countMap[pc.category] = pc._count.id;
    });

    const enriched = categories.map(c => ({
      ...c,
      productCount: countMap[c.name] || 0,
    }));

    return NextResponse.json({ success: true, data: enriched });
  } catch (error) {
    console.error("Fetch categories error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error fetching categories" },
      { status: 500 }
    );
  }
}

// POST create category
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, code, description, color } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: "Tên nhóm sản phẩm là bắt buộc" }, { status: 400 });
    }

    const trimmedName = name.trim();
    const generatedCode = (code || trimmedName.slice(0, 3).toUpperCase()).trim();

    const created = await prisma.productCategory.create({
      data: {
        name: trimmedName,
        code: generatedCode,
        description: description?.trim() || null,
        color: color || "indigo",
      },
    });

    return NextResponse.json({ success: true, data: { ...created, productCount: 0 } });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, error: "Tên nhóm hoặc mã nhóm đã tồn tại" }, { status: 400 });
    }
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error creating category" },
      { status: 500 }
    );
  }
}

// PUT rename/update category
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, oldName, newName, code, description, color } = body;

    if (!id || !newName || !newName.trim()) {
      return NextResponse.json({ success: false, error: "Thông tin cập nhật không hợp lệ" }, { status: 400 });
    }

    const trimmedNewName = newName.trim();

    const updated = await prisma.productCategory.update({
      where: { id },
      data: {
        name: trimmedNewName,
        code: code?.trim() || undefined,
        description: description?.trim() || undefined,
        color: color || undefined,
      },
    });

    // Cascade rename to Product table if category name changed
    if (oldName && oldName !== trimmedNewName) {
      await prisma.product.updateMany({
        where: { category: oldName },
        data: { category: trimmedNewName },
      });
    }

    // Recount products
    const productCount = await prisma.product.count({
      where: { category: trimmedNewName, isActive: true },
    });

    return NextResponse.json({ success: true, data: { ...updated, productCount } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error updating category" },
      { status: 500 }
    );
  }
}

// DELETE category
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const reassignTo = searchParams.get("reassignTo") || "Khác";

    if (!id) {
      return NextResponse.json({ success: false, error: "Category ID required" }, { status: 400 });
    }

    const category = await prisma.productCategory.findUnique({ where: { id } });
    if (!category) {
      return NextResponse.json({ success: false, error: "Không tìm thấy nhóm sản phẩm" }, { status: 404 });
    }

    // Check products in this category
    const inUseCount = await prisma.product.count({
      where: { category: category.name, isActive: true },
    });

    if (inUseCount > 0) {
      // Reassign products to fallback category
      await prisma.product.updateMany({
        where: { category: category.name },
        data: { category: reassignTo },
      });
    }

    await prisma.productCategory.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: `Đã xóa nhóm sản phẩm. ${inUseCount > 0 ? `${inUseCount} sản phẩm đã được chuyển sang nhóm '${reassignTo}'.` : ''}`
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error deleting category" },
      { status: 500 }
    );
  }
}
