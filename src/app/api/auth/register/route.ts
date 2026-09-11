import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

const VALID_ROLES = ["admin", "manager", "cashier", "warehouse", "accountant"] as const;

const ROLE_TITLES: Record<string, string> = {
  admin: "Tổng Quản Trị Hệ Thống",
  manager: "Cửa Hàng Trưởng / Quản Lý",
  cashier: "Nhân Viên Thu Ngân POS",
  warehouse: "Thủ Kho & Vận Hành",
  accountant: "Kế Toán Trưởng & Công Nợ",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password, businessName, businessScale, role } = body;

    // Validation
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Họ và tên không được để trống" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { success: false, error: "Địa chỉ Email không được để trống" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: "Địa chỉ Email không đúng định dạng" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Mật khẩu bảo mật phải có tối thiểu 6 ký tự" },
        { status: 400 }
      );
    }

    // Check existing user
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng Email khác." },
        { status: 400 }
      );
    }

    // Determine role and title
    const selectedRole = VALID_ROLES.includes(role) ? role : "admin";
    const roleTitle = ROLE_TITLES[selectedRole] || "Quản Trị Viên";

    const hashedPassword = hashPassword(password);

    // Save to Database
    const newUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        name: name.trim(),
        phone: phone ? phone.trim() : "",
        password: hashedPassword,
        role: selectedRole,
        roleTitle,
        businessName: businessName ? businessName.trim() : "Hệ Thống Phân Phối NEXUS",
        businessScale: businessScale || "Chuỗi Chi Nhánh & Kho Tổng",
        status: "active",
      },
    });

    // Also sync to Employee table if not present so they appear in staff management
    try {
      const existingEmp = await prisma.employee.findFirst({
        where: { email: cleanEmail },
      });
      if (!existingEmp) {
        await prisma.employee.create({
          data: {
            code: `NV-${Date.now().toString().slice(-4)}`,
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone || "",
            role: selectedRole,
            roleTitle,
            branch: "Trụ sở & Kho Tổng",
            status: "active",
            hireDate: new Date().toISOString().slice(0, 10),
            baseSalary: selectedRole === "admin" ? 25000000 : 12000000,
            commissionRate: 1.0,
          },
        });
      }
    } catch (empErr) {
      console.warn("Could not sync employee record on register:", empErr);
    }

    return NextResponse.json({
      success: true,
      message: `Đăng ký tài khoản thành công cho ${newUser.name}!`,
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        roleTitle: newUser.roleTitle,
        businessName: newUser.businessName,
        businessScale: newUser.businessScale,
      },
    });
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Lỗi hệ thống khi đăng ký tài khoản",
      },
      { status: 500 }
    );
  }
}
