import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authUser = await getCurrentUser(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Chưa đăng nhập hoặc phiên làm việc đã kết thúc" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      include: { employee: true },
    });

    if (!user || user.status !== "active") {
      return NextResponse.json(
        { success: false, error: "Tài khoản không tồn tại hoặc đã bị vô hiệu hóa" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        roleTitle: user.roleTitle,
        businessName: user.businessName,
        businessScale: user.businessScale,
        branchId: user.branchId || user.employee?.branchId,
        warehouseId: user.warehouseId,
        employeeId: user.employee?.id,
        employeeCode: user.employee?.code,
        permissions: authUser.permissions,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error verifying session" },
      { status: 500 }
    );
  }
}
