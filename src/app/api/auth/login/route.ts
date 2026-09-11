import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { ROLE_PERMISSIONS, UserRole } from "@/types/erp";

export const dynamic = "force-dynamic";

const DEMO_USERS = [
  {
    email: "admin@nexus-erp.vn",
    name: "Trần Hoàng Nam",
    phone: "0918.234.889",
    role: "admin" as UserRole,
    roleTitle: "Tổng Quản Trị Hệ Thống",
    businessName: "Tập Đoàn Bán Lẻ & Phân Phối NEXUS",
    businessScale: "Chuỗi 10+ Chi Nhánh & Kho Tổng",
    password: "123456",
  },
  {
    email: "quanly@nexus-erp.vn",
    name: "Trần Đình Trọng",
    phone: "0966.334.455",
    role: "manager" as UserRole,
    roleTitle: "Cửa Hàng Trưởng / Quản Lý",
    businessName: "Tập Đoàn Bán Lẻ & Phân Phối NEXUS",
    businessScale: "Chi Nhánh Trung Tâm Quận 1",
    password: "123456",
  },
  {
    email: "thungan@nexus-erp.vn",
    name: "Nguyễn Văn Hùng",
    phone: "0903.112.334",
    role: "cashier" as UserRole,
    roleTitle: "Nhân Viên Thu Ngân POS",
    businessName: "Tập Đoàn Bán Lẻ & Phân Phối NEXUS",
    businessScale: "Chi Nhánh Trung Tâm Quận 1",
    password: "123456",
  },
  {
    email: "thukho@nexus-erp.vn",
    name: "Lê Minh Tuấn",
    phone: "0938.556.778",
    role: "warehouse" as UserRole,
    roleTitle: "Thủ Kho & Vận Hành",
    businessName: "Tập Đoàn Bán Lẻ & Phân Phối NEXUS",
    businessScale: "Kho Tổng Trung Tâm KCN Tân Bình",
    password: "123456",
  },
  {
    email: "ketoan@nexus-erp.vn",
    name: "Phan Thị Hà",
    phone: "0982.667.890",
    role: "accountant" as UserRole,
    roleTitle: "Kế Toán Trưởng & Công Nợ",
    businessName: "Tập Đoàn Bán Lẻ & Phân Phối NEXUS",
    businessScale: "Trụ sở & Kho Tổng Bình Tân",
    password: "123456",
  },
];

// Ensure default demo users exist in the PostgreSQL database
async function ensureDemoUsers() {
  try {
    for (const demo of DEMO_USERS) {
      const exists = await prisma.user.findUnique({
        where: { email: demo.email },
      });
      if (!exists) {
        await prisma.user.create({
          data: {
            email: demo.email,
            name: demo.name,
            phone: demo.phone,
            password: hashPassword(demo.password),
            role: demo.role,
            roleTitle: demo.roleTitle,
            businessName: demo.businessName,
            businessScale: demo.businessScale,
            status: "active",
          },
        });
      }
    }
  } catch (err) {
    console.warn("Could not ensure demo users:", err);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập Email hoặc Tên đăng nhập" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập Mật khẩu bảo mật" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Auto-seed demo users if database is fresh
    await ensureDemoUsers();

    // Look up user in Database
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    // Fallback search in employees table if user registered via seed or another way
    if (!user) {
      const emp = await prisma.employee.findFirst({
        where: { email: cleanEmail },
      });
      if (emp) {
        // Auto create user account for this existing employee
        const hashedPassword = hashPassword(password);
        user = await prisma.user.create({
          data: {
            email: emp.email,
            name: emp.name,
            phone: emp.phone,
            password: hashedPassword,
            role: emp.role || "cashier",
            roleTitle: emp.roleTitle || "Nhân Viên",
            businessName: "Tập Đoàn Bán Lẻ & Phân Phối NEXUS",
            businessScale: emp.branch,
            status: emp.status || "active",
          },
        });
      }
    }

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Tài khoản không tồn tại trong hệ thống. Vui lòng kiểm tra lại Email hoặc Đăng ký tài khoản mới.",
        },
        { status: 404 }
      );
    }

    if (user.status !== "active") {
      return NextResponse.json(
        {
          success: false,
          error: "Tài khoản của bạn hiện đang bị khóa hoặc tạm dừng. Vui lòng liên hệ quản trị viên.",
        },
        { status: 403 }
      );
    }

    // Verify password
    const isValid = verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Mật khẩu không chính xác. Vui lòng kiểm tra lại.",
        },
        { status: 401 }
      );
    }

    const role = (user.role as UserRole) || "cashier";
    const permissions = ROLE_PERMISSIONS[role] || [];

    return NextResponse.json({
      success: true,
      message: `Chào mừng ${user.name}! Đăng nhập thành công với vai trò ${user.roleTitle || role}.`,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role,
        roleTitle: user.roleTitle,
        businessName: user.businessName,
        businessScale: user.businessScale,
        permissions,
      },
    });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Lỗi hệ thống khi đăng nhập",
      },
      { status: 500 }
    );
  }
}
