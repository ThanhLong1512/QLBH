import { PrismaClient } from "@prisma/client";
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
} from "../src/data/mockData";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Database Seeding to Supabase PostgreSQL...");

  // 1. Seed Products & Packaging Units
  console.log("📦 Seeding Products...");
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

    // Units
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
  console.log("👥 Seeding Customers...");
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
  console.log("🏭 Seeding Suppliers...");
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
  console.log("🧑‍💼 Seeding Employees...");
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

  // 5. Seed Product Batches
  console.log("🏷️ Seeding Product Batches...");
  for (const b of INITIAL_BATCHES) {
    const existing = await prisma.productBatch.findFirst({ where: { batchId: b.batchId } });
    if (!existing) {
      await prisma.productBatch.create({
        data: {
          batchId: b.batchId,
          sku: b.sku,
          productionDate: b.productionDate,
          expiryDate: b.expiryDate,
          quantityBaseUnits: b.quantityBaseUnits,
          warehouseLocation: b.warehouseLocation,
          daysRemaining: b.daysRemaining,
        },
      });
    }
  }

  // 6. Seed Serials
  console.log("🔢 Seeding Serials...");
  for (const s of INITIAL_SERIALS) {
    await prisma.serialItem.upsert({
      where: { serialNumber: s.serialNumber },
      update: {
        sku: s.sku,
        productName: s.productName,
        importDate: s.importDate,
        supplier: s.supplier,
        orderCode: s.orderCode,
        customerName: s.customerName,
        customerPhone: s.customerPhone,
        warrantyUntil: s.warrantyUntil,
        status: s.status,
        timeline: (s.timeline as any) || [],
      },
      create: {
        serialNumber: s.serialNumber,
        sku: s.sku,
        productName: s.productName,
        importDate: s.importDate,
        supplier: s.supplier,
        orderCode: s.orderCode,
        customerName: s.customerName,
        customerPhone: s.customerPhone,
        warrantyUntil: s.warrantyUntil,
        status: s.status,
        timeline: (s.timeline as any) || [],
      },
    });
  }

  // 7. Seed Orders
  console.log("🛒 Seeding Orders...");
  for (const o of INITIAL_ORDERS) {
    const custExists = o.customerId
      ? await prisma.customer.findUnique({ where: { id: o.customerId } })
      : null;
    const validCustomerId = custExists ? o.customerId : null;

    const orderRecord = await prisma.order.upsert({
      where: { code: o.code },
      update: {
        customerId: validCustomerId,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        subtotal: o.subtotal,
        discountAmount: o.discountAmount,
        shippingFee: o.shippingFee,
        totalAmount: o.totalAmount,
        paidAmount: o.paidAmount,
        debtAmount: o.debtAmount,
        paymentMethod: o.paymentMethod,
        status: o.status,
        cashierName: o.cashierName,
        notes: o.notes,
        hasPinOverride: o.hasPinOverride || false,
        vatRate: o.vatRate || 0,
        vatAmount: o.vatAmount || 0,
        salesChannel: o.salesChannel || "pos",
      },
      create: {
        id: o.id,
        code: o.code,
        customerId: validCustomerId,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        subtotal: o.subtotal,
        discountAmount: o.discountAmount,
        shippingFee: o.shippingFee,
        totalAmount: o.totalAmount,
        paidAmount: o.paidAmount,
        debtAmount: o.debtAmount,
        paymentMethod: o.paymentMethod,
        status: o.status,
        cashierName: o.cashierName,
        notes: o.notes,
        hasPinOverride: o.hasPinOverride || false,
        vatRate: o.vatRate || 0,
        vatAmount: o.vatAmount || 0,
        salesChannel: o.salesChannel || "pos",
      },
    });

    if (o.items && o.items.length > 0) {
      await prisma.orderItem.deleteMany({ where: { orderId: orderRecord.id } });
      for (const it of o.items) {
        const prodExists = it.productId
          ? await prisma.product.findUnique({ where: { id: it.productId } })
          : null;

        await prisma.orderItem.create({
          data: {
            orderId: orderRecord.id,
            productId: prodExists ? it.productId : null,
            sku: it.sku,
            name: it.name || it.productName || "Sản phẩm",
            category: it.category || "",
            selectedUnit: it.selectedUnit || it.unitName || "Cái",
            conversionRate: it.conversionRate || 1,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            costPricePerUnit: it.costPricePerUnit || 0,
            totalPrice: it.totalPrice,
            discountPercent: it.discountPercent || 0,
            serialNumbers: (it.serialNumbers as any) || [],
            batchId: it.batchId || null,
          },
        });
      }
    }
  }

  // 8. Seed Shifts & Cash Transactions
  console.log("💵 Seeding Shifts & Cashflow Transactions...");
  for (const sh of INITIAL_SHIFTS) {
    const shiftRec = await prisma.cashShift.upsert({
      where: { id: sh.id },
      update: {
        cashierName: sh.cashierName,
        startedAt: sh.startedAt,
        closedAt: sh.closedAt,
        openingCash: sh.openingCash,
        cashSales: sh.cashSales,
        vietQrSales: sh.vietQrSales,
        debtSales: sh.debtSales,
        cashDrops: sh.cashDrops,
        expectedCash: sh.expectedCash,
        actualCash: sh.actualCash,
        variance: sh.variance,
        varianceReason: sh.varianceReason,
        isClosed: sh.isClosed,
      },
      create: {
        id: sh.id,
        cashierName: sh.cashierName,
        startedAt: sh.startedAt,
        closedAt: sh.closedAt,
        openingCash: sh.openingCash,
        cashSales: sh.cashSales,
        vietQrSales: sh.vietQrSales,
        debtSales: sh.debtSales,
        cashDrops: sh.cashDrops,
        expectedCash: sh.expectedCash,
        actualCash: sh.actualCash,
        variance: sh.variance,
        varianceReason: sh.varianceReason,
        isClosed: sh.isClosed,
      },
    });
  }

  for (const tr of INITIAL_TRANSACTIONS) {
    await prisma.cashTransaction.upsert({
      where: { code: tr.code },
      update: {
        type: tr.type,
        category: tr.category,
        amount: tr.amount,
        date: tr.date,
        person: tr.person,
        description: tr.description,
        shiftId: tr.shiftId,
        fundType: tr.fundType || "cash",
        partnerType: tr.partnerType,
        partnerId: tr.partnerId,
        partnerName: tr.partnerName,
        referenceCode: tr.referenceCode,
        paymentMethod: tr.paymentMethod || "cash",
      },
      create: {
        id: tr.id,
        code: tr.code,
        type: tr.type,
        category: tr.category,
        amount: tr.amount,
        date: tr.date,
        person: tr.person,
        description: tr.description,
        shiftId: tr.shiftId,
        fundType: tr.fundType || "cash",
        partnerType: tr.partnerType,
        partnerId: tr.partnerId,
        partnerName: tr.partnerName,
        referenceCode: tr.referenceCode,
        paymentMethod: tr.paymentMethod || "cash",
      },
    });
  }

  // 9. Seed Inbound / Outbound / Returns / Warranties / Approvals
  console.log("📋 Seeding Stock Receipts, Returns, Warranties & Approvals...");
  for (const inb of INITIAL_INBOUNDS) {
    await prisma.stockInboundReceipt.upsert({
      where: { code: inb.code },
      update: {
        date: inb.date,
        supplierId: inb.supplierId,
        supplierName: inb.supplierName,
        creatorName: inb.creatorName,
        totalCost: inb.totalCost,
        paidAmount: inb.paidAmount,
        debtAmount: inb.debtAmount,
        items: inb.items as any,
      },
      create: {
        id: inb.id,
        code: inb.code,
        date: inb.date,
        supplierId: inb.supplierId,
        supplierName: inb.supplierName,
        creatorName: inb.creatorName,
        totalCost: inb.totalCost,
        paidAmount: inb.paidAmount,
        debtAmount: inb.debtAmount,
        items: inb.items as any,
      },
    });
  }

  for (const outb of INITIAL_OUTBOUNDS) {
    await prisma.stockOutboundReceipt.upsert({
      where: { code: outb.code },
      update: {
        date: outb.date,
        reason: outb.reason,
        reasonLabel: outb.reasonLabel,
        creatorName: outb.creatorName,
        totalCost: outb.totalCost,
        items: outb.items as any,
      },
      create: {
        id: outb.id,
        code: outb.code,
        date: outb.date,
        reason: outb.reason,
        reasonLabel: outb.reasonLabel,
        creatorName: outb.creatorName,
        totalCost: outb.totalCost,
        items: outb.items as any,
      },
    });
  }

  for (const ret of INITIAL_RETURNS) {
    await prisma.returnReceipt.upsert({
      where: { code: ret.code },
      update: {
        type: ret.type,
        date: ret.date,
        referenceOrderCode: ret.referenceOrderCode,
        partnerId: ret.partnerId,
        partnerName: ret.partnerName,
        creatorName: ret.creatorName,
        totalRefundAmount: ret.totalRefundAmount,
        refundMethod: ret.refundMethod,
        items: ret.items as any,
      },
      create: {
        id: ret.id,
        code: ret.code,
        type: ret.type,
        date: ret.date,
        referenceOrderCode: ret.referenceOrderCode,
        partnerId: ret.partnerId,
        partnerName: ret.partnerName,
        creatorName: ret.creatorName,
        totalRefundAmount: ret.totalRefundAmount,
        refundMethod: ret.refundMethod,
        items: ret.items as any,
      },
    });
  }

  for (const w of INITIAL_WARRANTIES) {
    await prisma.warrantyTicket.upsert({
      where: { code: w.code },
      update: {
        customerName: w.customerName,
        customerPhone: w.customerPhone,
        customerId: w.customerId,
        productName: w.productName,
        sku: w.sku,
        serialNumber: w.serialNumber,
        orderCode: w.orderCode,
        receivedDate: w.receivedDate,
        status: w.status,
        issueDescription: w.issueDescription,
        technicianName: w.technicianName,
        isUnderWarranty: w.isUnderWarranty,
        repairCost: w.repairCost,
        sparePartsCost: w.sparePartsCost,
        totalCost: w.totalCost,
        serviceRecords: (w.serviceRecords as any) || [],
      },
      create: {
        id: w.id,
        code: w.code,
        customerName: w.customerName,
        customerPhone: w.customerPhone,
        customerId: w.customerId,
        productName: w.productName,
        sku: w.sku,
        serialNumber: w.serialNumber,
        orderCode: w.orderCode,
        receivedDate: w.receivedDate,
        status: w.status,
        issueDescription: w.issueDescription,
        technicianName: w.technicianName,
        isUnderWarranty: w.isUnderWarranty,
        repairCost: w.repairCost,
        sparePartsCost: w.sparePartsCost,
        totalCost: w.totalCost,
        serviceRecords: (w.serviceRecords as any) || [],
      },
    });
  }

  for (const app of INITIAL_APPROVALS) {
    await prisma.creditApprovalRequest.upsert({
      where: { id: app.id },
      update: {
        orderCode: app.orderCode,
        customerId: app.customerId,
        customerName: app.customerName,
        customerPhone: app.customerPhone,
        orderTotal: app.orderTotal,
        currentDebt: app.currentDebt,
        creditLimit: app.creditLimit,
        excessAmount: app.excessAmount,
        requestedAt: app.requestedAt,
        requestedBy: app.requestedBy,
        reason: app.reason,
        status: app.status,
        resolvedAt: (app as any).resolvedAt || null,
        resolvedBy: (app as any).resolvedBy || null,
        messages: app.messages as any,
      },
      create: {
        id: app.id,
        orderCode: app.orderCode,
        customerId: app.customerId,
        customerName: app.customerName,
        customerPhone: app.customerPhone,
        orderTotal: app.orderTotal,
        currentDebt: app.currentDebt,
        creditLimit: app.creditLimit,
        excessAmount: app.excessAmount,
        requestedAt: app.requestedAt,
        requestedBy: app.requestedBy,
        reason: app.reason,
        status: app.status,
        resolvedAt: (app as any).resolvedAt || null,
        resolvedBy: (app as any).resolvedBy || null,
        messages: app.messages as any,
      },
    });
  }

  console.log("✅ Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
