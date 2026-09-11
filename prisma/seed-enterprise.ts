import { prisma } from "../src/lib/prisma";

async function seedEnterpriseMaster() {
  console.log("--- Starting Enterprise Master Data Seed & Migration ---");

  // 1. Seed Branches
  const branchesData = [
    {
      code: "CN-TONG",
      name: "Trụ Sở Chính & Kho Tổng Tân Bình",
      address: "KCN Tân Bình, Phường Tây Thạnh, Quận Tân Phú, TP. HCM",
      phone: "028.3812.9999",
      isActive: true,
    },
    {
      code: "CN-Q1",
      name: "Chi Nhánh Trung Tâm Quận 1",
      address: "128 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP. HCM",
      phone: "028.3925.1122",
      isActive: true,
    },
    {
      code: "CN-BT",
      name: "Chi Nhánh Tây Sài Gòn - Bình Tân",
      address: "45 Kinh Dương Vương, Phường An Lạc, Quận Bình Tân, TP. HCM",
      phone: "028.3752.8899",
      isActive: true,
    },
  ];

  const branchMap = new Map<string, string>();
  for (const b of branchesData) {
    const branch = await prisma.branch.upsert({
      where: { code: b.code },
      update: { name: b.name, address: b.address, phone: b.phone },
      create: b,
    });
    branchMap.set(b.code, branch.id);
    console.log(`✓ Branch upserted: ${branch.code} - ${branch.name}`);
  }

  // 2. Seed Warehouses
  const warehousesData = [
    {
      code: "KHO-TONG",
      name: "Kho Tổng Trung Tâm KCN Tân Bình",
      branchId: branchMap.get("CN-TONG"),
      address: "Lô C2, Đường số 3, KCN Tân Bình, Tân Phú, TP. HCM",
      phone: "028.3812.9998",
      isDefault: true,
      isActive: true,
    },
    {
      code: "KHO-Q1",
      name: "Kho Chi Nhánh Quận 1",
      branchId: branchMap.get("CN-Q1"),
      address: "128 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP. HCM",
      phone: "028.3925.1123",
      isDefault: false,
      isActive: true,
    },
    {
      code: "KHO-BT",
      name: "Kho Chi Nhánh Bình Tân",
      branchId: branchMap.get("CN-BT"),
      address: "45 Kinh Dương Vương, Phường An Lạc, Quận Bình Tân, TP. HCM",
      phone: "028.3752.8898",
      isDefault: false,
      isActive: true,
    },
  ];

  const warehouseMap = new Map<string, string>();
  for (const w of warehousesData) {
    const warehouse = await prisma.warehouse.upsert({
      where: { code: w.code },
      update: { name: w.name, branchId: w.branchId, address: w.address, phone: w.phone, isDefault: w.isDefault },
      create: w,
    });
    warehouseMap.set(w.code, warehouse.id);
    console.log(`✓ Warehouse upserted: ${warehouse.code} - ${warehouse.name} (Default: ${warehouse.isDefault})`);
  }

  const defaultWarehouseId = warehouseMap.get("KHO-TONG")!;
  const q1WarehouseId = warehouseMap.get("KHO-Q1")!;
  const btWarehouseId = warehouseMap.get("KHO-BT")!;

  // 3. Populate StockBalance and initial StockLedger for all existing products
  const products = await prisma.product.findMany();
  console.log(`Found ${products.length} products to initialize stock balances...`);

  for (const prod of products) {
    // Kho Tổng gets 70% or stockBaseUnits
    const mainQty = Math.max(0, prod.stockBaseUnits || 50);
    const q1Qty = Math.floor(mainQty * 0.2);
    const btQty = Math.floor(mainQty * 0.1);
    const actualMainQty = mainQty - q1Qty - btQty;

    const allocations = [
      { warehouseId: defaultWarehouseId, qty: actualMainQty, code: "KHO-TONG" },
      { warehouseId: q1WarehouseId, qty: q1Qty, code: "KHO-Q1" },
      { warehouseId: btWarehouseId, qty: btQty, code: "KHO-BT" },
    ];

    for (const alloc of allocations) {
      await prisma.stockBalance.upsert({
        where: {
          productId_warehouseId: {
            productId: prod.id,
            warehouseId: alloc.warehouseId,
          },
        },
        update: { quantity: alloc.qty },
        create: {
          productId: prod.id,
          warehouseId: alloc.warehouseId,
          quantity: alloc.qty,
          minStockAlert: prod.minStockAlert || 10,
        },
      });

      // Check if ledger already exists for initial balance
      const existingLedger = await prisma.stockLedger.findFirst({
        where: {
          productId: prod.id,
          warehouseId: alloc.warehouseId,
          type: "INITIAL",
        },
      });

      if (!existingLedger) {
        await prisma.stockLedger.create({
          data: {
            code: `TK-INIT-${prod.sku}-${alloc.code}`,
            productId: prod.id,
            warehouseId: alloc.warehouseId,
            type: "INITIAL",
            referenceType: "InitialBalance",
            referenceCode: "SYS-INIT",
            quantityChange: alloc.qty,
            balanceBefore: 0,
            balanceAfter: alloc.qty,
            costPrice: prod.costPrice,
            notes: `Khởi tạo số dư ban đầu cho ${alloc.code}`,
            createdByName: "Hệ Thống",
          },
        });
      }
    }
  }
  console.log("✓ Stock balances and initial ledgers initialized successfully.");

  // 4. Link User ↔ Employee
  const users = await prisma.user.findMany();
  const employees = await prisma.employee.findMany();
  console.log(`Matching ${users.length} Users with ${employees.length} Employees...`);

  for (const user of users) {
    const matchedEmployee = employees.find(
      (e) => e.email.trim().toLowerCase() === user.email.trim().toLowerCase()
    );

    if (matchedEmployee) {
      // Determine branchId from employee.branch string
      let assignedBranchId = branchMap.get("CN-TONG");
      if (matchedEmployee.branch.includes("Quận 1") || matchedEmployee.branch.includes("Q1")) {
        assignedBranchId = branchMap.get("CN-Q1");
      } else if (matchedEmployee.branch.includes("Bình Tân")) {
        assignedBranchId = branchMap.get("CN-BT");
      }

      await prisma.employee.update({
        where: { id: matchedEmployee.id },
        data: {
          userId: user.id,
          branchId: assignedBranchId,
        },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: {
          branchId: assignedBranchId,
          warehouseId: defaultWarehouseId,
        },
      });

      console.log(`✓ Linked User [${user.email}] <--> Employee [${matchedEmployee.code} - ${matchedEmployee.name}] at Branch [${assignedBranchId}]`);
    }
  }

  console.log("--- Enterprise Master Migration Completed Successfully! ---");
}

seedEnterpriseMaster()
  .catch((e) => {
    console.error("Migration seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
