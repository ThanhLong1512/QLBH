import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_BATCHES,
  INITIAL_SERIALS,
  INITIAL_ORDERS,
  INITIAL_SHIFTS,
  INITIAL_TRANSACTIONS,
  INITIAL_EMPLOYEES,
  INITIAL_SUPPLIERS,
  INITIAL_INBOUNDS,
  INITIAL_OUTBOUNDS,
  INITIAL_RETURNS,
  INITIAL_WARRANTIES,
  INITIAL_APPROVALS,
} from "@/data/mockData";

export const dynamic = "force-dynamic";

// POST /api/seed - Seeds data from mockData into PostgreSQL database (Single Source of Truth)
export async function POST() {
  try {
    // 1. Seed Products & Packaging Units
    for (const prod of INITIAL_PRODUCTS) {
      const createdProduct = await prisma.product.upsert({
        where: { sku: prod.sku },
        update: {
          name: prod.name,
          category: prod.category,
          baseUnit: prod.baseUnit,
          costPrice: prod.costPrice,
          priceRetail: prod.priceRetail,
          priceWholesale: prod.priceWholesale,
          priceVip: prod.priceVip,
          stockBaseUnits: prod.stockBaseUnits,
          minStockAlert: prod.minStockAlert,
          hasSerial: prod.hasSerial,
          hasExpiry: prod.hasExpiry,
          barcode: prod.barcode,
          imageUrl: prod.imageUrl || prod.image || null,
        },
        create: {
          id: prod.id,
          sku: prod.sku,
          name: prod.name,
          category: prod.category,
          baseUnit: prod.baseUnit,
          costPrice: prod.costPrice,
          priceRetail: prod.priceRetail,
          priceWholesale: prod.priceWholesale,
          priceVip: prod.priceVip,
          stockBaseUnits: prod.stockBaseUnits,
          minStockAlert: prod.minStockAlert,
          hasSerial: prod.hasSerial,
          hasExpiry: prod.hasExpiry,
          barcode: prod.barcode,
          imageUrl: prod.imageUrl || prod.image || null,
        },
      });

      if (prod.units && prod.units.length > 0) {
        await prisma.packagingUnit.deleteMany({ where: { productId: createdProduct.id } });
        for (const u of prod.units) {
          await prisma.packagingUnit.create({
            data: {
              productId: createdProduct.id,
              name: u.name,
              conversionRate: u.conversionRate,
              isBase: u.isBase,
              priceRetail: u.priceRetail,
              priceWholesale: u.priceWholesale,
              priceVip: u.priceVip,
            },
          });
        }
      }
    }

    // 2. Seed Customers
    for (const c of INITIAL_CUSTOMERS) {
      await prisma.customer.upsert({
        where: { code: c.code },
        update: {
          name: c.name,
          phone: c.phone,
          address: c.address,
          tier: c.tier,
          creditLimit: c.creditLimit,
          currentDebt: c.currentDebt,
          taxId: c.taxId || null,
          paymentTermDays: c.paymentTermDays || 30,
          historicalRevenue: c.historicalRevenue || 0,
          debtWithin30: c.debtAging?.within30 || 0,
          debtDays31to60: c.debtAging?.days31to60 || 0,
          debtDays61to90: c.debtAging?.days61to90 || 0,
          debtOver90: c.debtAging?.over90 || 0,
        },
        create: {
          id: c.id,
          code: c.code,
          name: c.name,
          phone: c.phone,
          address: c.address,
          tier: c.tier,
          creditLimit: c.creditLimit,
          currentDebt: c.currentDebt,
          taxId: c.taxId || null,
          paymentTermDays: c.paymentTermDays || 30,
          historicalRevenue: c.historicalRevenue || 0,
          debtWithin30: c.debtAging?.within30 || 0,
          debtDays31to60: c.debtAging?.days31to60 || 0,
          debtDays61to90: c.debtAging?.days61to90 || 0,
          debtOver90: c.debtAging?.over90 || 0,
        },
      });
    }

    // 3. Seed Suppliers
    for (const s of INITIAL_SUPPLIERS) {
      await prisma.supplier.upsert({
        where: { code: s.code },
        update: {
          name: s.name,
          contactPerson: s.contactPerson,
          phone: s.phone,
          email: s.email,
          address: s.address,
          taxId: s.taxId,
          category: s.category,
          currentDebt: s.currentDebt,
          paymentTermsDays: s.paymentTermsDays,
          totalPurchased: s.totalPurchased,
          bankName: s.bankName,
          bankAccount: s.bankAccount,
          bankAccountName: s.bankAccountName,
          status: s.status,
        },
        create: {
          id: s.id,
          code: s.code,
          name: s.name,
          contactPerson: s.contactPerson,
          phone: s.phone,
          email: s.email,
          address: s.address,
          taxId: s.taxId,
          category: s.category,
          currentDebt: s.currentDebt,
          paymentTermsDays: s.paymentTermsDays,
          totalPurchased: s.totalPurchased,
          bankName: s.bankName,
          bankAccount: s.bankAccount,
          bankAccountName: s.bankAccountName,
          status: s.status,
        },
      });
    }

    // 4. Seed Employees
    for (const emp of INITIAL_EMPLOYEES) {
      await prisma.employee.upsert({
        where: { code: emp.code },
        update: {
          name: emp.name,
          phone: emp.phone,
          email: emp.email,
          role: emp.role,
          roleTitle: emp.roleTitle,
          branch: emp.branch,
          status: emp.status,
          hireDate: emp.hireDate,
          baseSalary: emp.baseSalary,
          commissionRate: emp.commissionRate,
          totalOrdersHandled: emp.totalOrdersHandled,
          totalRevenueGenerated: emp.totalRevenueGenerated,
        },
        create: {
          id: emp.id,
          code: emp.code,
          name: emp.name,
          phone: emp.phone,
          email: emp.email,
          role: emp.role,
          roleTitle: emp.roleTitle,
          branch: emp.branch,
          status: emp.status,
          hireDate: emp.hireDate,
          baseSalary: emp.baseSalary,
          commissionRate: emp.commissionRate,
          totalOrdersHandled: emp.totalOrdersHandled,
          totalRevenueGenerated: emp.totalRevenueGenerated,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Đã nạp dữ liệu khởi tạo mẫu thành công vào PostgreSQL!",
    });
  } catch (error) {
    console.error("Seed API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to seed database",
      },
      { status: 500 }
    );
  }
}
