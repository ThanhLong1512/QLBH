import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [
      products,
      customers,
      batches,
      serials,
      warranties,
      orders,
      shifts,
      transactions,
      employees,
      suppliers,
      inbounds,
      outbounds,
      returns,
      approvalRequests,
      stocktakes,
      transfers,
      warehouses,
      branches,
      stockBalances,
    ] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        include: { units: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.customer.findMany({
        orderBy: { createdAt: "desc" },
      }),
      prisma.productBatch.findMany({
        orderBy: { createdAt: "desc" },
      }),
      prisma.serialItem.findMany({
        orderBy: { createdAt: "desc" },
      }),
      prisma.warrantyTicket.findMany({
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.findMany({
        include: { items: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.cashShift.findMany({
        orderBy: { createdAt: "desc" },
      }),
      prisma.cashTransaction.findMany({
        orderBy: { createdAt: "desc" },
      }),
      prisma.employee.findMany({
        orderBy: { createdAt: "desc" },
      }),
      prisma.supplier.findMany({
        orderBy: { createdAt: "desc" },
      }),
      prisma.stockInboundReceipt.findMany({
        orderBy: { createdAt: "desc" },
      }),
      prisma.stockOutboundReceipt.findMany({
        orderBy: { createdAt: "desc" },
      }),
      prisma.returnReceipt.findMany({
        orderBy: { createdAt: "desc" },
      }),
      prisma.creditApprovalRequest.findMany({
        orderBy: { createdAt: "desc" },
      }),
      prisma.stocktakeReport.findMany({
        orderBy: { createdAt: "desc" },
      }),
      prisma.warehouseTransfer.findMany({
        orderBy: { createdAt: "desc" },
      }),
      prisma.warehouse.findMany({
        where: { isActive: true },
        include: { branch: true },
        orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
      }),
      prisma.branch.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.stockBalance.findMany({
        include: {
          warehouse: { select: { id: true, code: true, name: true, isDefault: true } },
        },
      }),
    ]);

    // Format customers with nested debtAging object matching frontend types
    const formattedCustomers = customers.map((c) => ({
      ...c,
      debtAging: {
        within30: c.debtWithin30,
        days31to60: c.debtDays31to60,
        days61to90: c.debtDays61to90,
        over90: c.debtOver90,
      },
    }));

    return NextResponse.json({
      success: true,
      data: {
        products,
        customers: formattedCustomers,
        batches,
        serials,
        warranties,
        orders,
        shifts,
        transactions,
        employees,
        suppliers,
        inbounds,
        outbounds,
        returns,
        approvalRequests,
        stocktakes,
        transfers,
        warehouses,
        branches,
        stockBalances,
      },
    });
  } catch (error) {
    console.error("Bootstrap API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to bootstrap data from database",
      },
      { status: 500 }
    );
  }
}
