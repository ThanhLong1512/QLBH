import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requirePermission } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "inbounds" | "outbounds" | "batches" | "transfers" | "stocktakes"

    if (type === "batches") {
      const batches = await prisma.productBatch.findMany({ orderBy: { createdAt: "desc" } });
      return NextResponse.json({ success: true, data: batches });
    }

    if (type === "outbounds") {
      const outbounds = await prisma.stockOutboundReceipt.findMany({
        include: {
          warehouse: { select: { id: true, code: true, name: true } },
          outboundItems: true,
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ success: true, data: outbounds });
    }

    if (type === "transfers") {
      const transfers = await prisma.warehouseTransfer.findMany({
        include: {
          sourceWarehouseRel: { select: { id: true, code: true, name: true } },
          targetWarehouseRel: { select: { id: true, code: true, name: true } },
          transferItems: true,
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ success: true, data: transfers });
    }

    if (type === "stocktakes") {
      const stocktakes = await prisma.stocktakeReport.findMany({
        include: {
          warehouse: { select: { id: true, code: true, name: true } },
          stocktakeItems: true,
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ success: true, data: stocktakes });
    }

    const inbounds = await prisma.stockInboundReceipt.findMany({
      include: {
        warehouse: { select: { id: true, code: true, name: true } },
        inboundItems: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: inbounds });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error fetching inventory data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { user, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { action, ...payload } = body;

    // Helper: resolve effective warehouse
    const resolveWarehouseId = async (inputWarehouseId?: string) => {
      if (inputWarehouseId) return inputWarehouseId;
      if (user?.warehouseId) return user.warehouseId;
      const def = await prisma.warehouse.findFirst({ where: { isDefault: true, isActive: true } });
      return def?.id || null;
    };

    // 1. Stock Inbound (Nhập kho)
    if (action === "inbound") {
      const {
        supplierId,
        supplierName,
        creatorName,
        items,
        totalCost,
        paidAmount,
        debtAmount,
        paymentMethod,
        warehouseId,
      } = payload;
      const effectiveWhId = await resolveWarehouseId(warehouseId);
      const code = `PNK-${Date.now().toString().slice(-6)}`;
      const date = new Date().toISOString().slice(0, 16).replace("T", " ");

      const result = await prisma.$transaction(async (tx) => {
        // Create Inbound Receipt with relational items
        const receipt = await tx.stockInboundReceipt.create({
          data: {
            code,
            date,
            supplierId: supplierId || "NCC-DEFAULT",
            supplierName: supplierName || "Nhà Cung Cấp",
            creatorName: creatorName || user?.name || "Thủ Kho",
            warehouseId: effectiveWhId,
            totalCost: Number(totalCost) || 0,
            paidAmount: Number(paidAmount) || 0,
            debtAmount: Number(debtAmount) || 0,
            paymentMethod: paymentMethod || "bank_transfer",
            items: items || [],
            inboundItems: items && Array.isArray(items) ? {
              create: items.map((it: any) => ({
                productId: it.productId || null,
                sku: it.sku || "UNKNOWN",
                name: it.name || it.productName || "Sản phẩm",
                unitName: it.selectedUnit || it.unitName || "Cái",
                conversionRate: Number(it.conversionRate) || 1,
                quantity: Number(it.quantity) || 1,
                unitCost: Number(it.unitCost) || 0,
                totalCost: (Number(it.quantity) || 1) * (Number(it.unitCost) || 0),
                batchId: it.batchId || null,
                serials: it.serialNumbers || [],
              })),
            } : undefined,
          },
          include: { inboundItems: true },
        });

        // Increment product stock and warehouse StockBalance & Record Ledger
        if (items && Array.isArray(items)) {
          for (const it of items) {
            const addedStock = (Number(it.quantity) || 0) * (Number(it.conversionRate) || 1);
            if (it.productId) {
              await tx.product.updateMany({
                where: { id: it.productId },
                data: {
                  stockBaseUnits: { increment: addedStock },
                  costPrice: Number(it.unitCost) || undefined,
                },
              });

              if (effectiveWhId) {
                const curBal = await tx.stockBalance.findUnique({
                  where: {
                    productId_warehouseId: {
                      productId: it.productId,
                      warehouseId: effectiveWhId,
                    },
                  },
                });

                const balanceBefore = curBal ? curBal.quantity : 0;
                const balanceAfter = balanceBefore + addedStock;

                await tx.stockBalance.upsert({
                  where: {
                    productId_warehouseId: {
                      productId: it.productId,
                      warehouseId: effectiveWhId,
                    },
                  },
                  update: {
                    quantity: { increment: addedStock },
                  },
                  create: {
                    productId: it.productId,
                    warehouseId: effectiveWhId,
                    quantity: addedStock,
                  },
                });

                // Write StockLedger
                await tx.stockLedger.create({
                  data: {
                    code: `TK-PNK-${code}-${it.sku || it.productId.slice(-4)}-${Date.now().toString().slice(-4)}`,
                    productId: it.productId,
                    warehouseId: effectiveWhId,
                    type: "INBOUND",
                    referenceType: "StockInboundReceipt",
                    referenceId: receipt.id,
                    referenceCode: receipt.code,
                    quantityChange: addedStock,
                    balanceBefore,
                    balanceAfter,
                    costPrice: Number(it.unitCost) || 0,
                    notes: `Nhập kho từ NCC ${supplierName || "Nhà Cung Cấp"}`,
                    createdById: user?.userId,
                    createdByName: user?.name || creatorName || "Thủ Kho",
                  },
                });
              }
            }
          }
        }

        // Increment supplier debt if any
        if (supplierId && Number(debtAmount) > 0) {
          await tx.supplier.updateMany({
            where: { id: supplierId },
            data: {
              currentDebt: { increment: Number(debtAmount) },
              totalPurchased: { increment: Number(totalCost) },
            },
          });
        }

        return receipt;
      });

      return NextResponse.json({ success: true, data: result });
    }

    // 2. Stock Outbound (Xuất kho hủy/nội bộ)
    if (action === "outbound") {
      const { reason, reasonLabel, creatorName, destination, items, totalCost, warehouseId } = payload;
      const effectiveWhId = await resolveWarehouseId(warehouseId);
      const code = `PXK-${Date.now().toString().slice(-6)}`;
      const date = new Date().toISOString().slice(0, 16).replace("T", " ");

      const result = await prisma.$transaction(async (tx) => {
        const receipt = await tx.stockOutboundReceipt.create({
          data: {
            code,
            date,
            reason: reason || "other",
            reasonLabel: reasonLabel || "Xuất khác",
            creatorName: creatorName || user?.name || "Thủ Kho",
            destination: destination || null,
            warehouseId: effectiveWhId,
            totalCost: Number(totalCost) || 0,
            items: items || [],
            outboundItems: items && Array.isArray(items) ? {
              create: items.map((it: any) => ({
                productId: it.productId || null,
                sku: it.sku || "UNKNOWN",
                name: it.name || it.productName || "Sản phẩm",
                quantity: Number(it.quantity) || 1,
                unitCost: Number(it.unitCost) || 0,
                totalCost: (Number(it.quantity) || 1) * (Number(it.unitCost) || 0),
                reason: reason || "other",
              })),
            } : undefined,
          },
          include: { outboundItems: true },
        });

        // Decrement product stock and warehouse StockBalance & Record Ledger
        if (items && Array.isArray(items)) {
          for (const it of items) {
            const deduct = (Number(it.quantity) || 0) * (Number(it.conversionRate) || 1);
            if (it.productId) {
              await tx.product.updateMany({
                where: { id: it.productId },
                data: {
                  stockBaseUnits: { decrement: deduct },
                },
              });

              if (effectiveWhId) {
                const curBal = await tx.stockBalance.findUnique({
                  where: {
                    productId_warehouseId: {
                      productId: it.productId,
                      warehouseId: effectiveWhId,
                    },
                  },
                });

                const balanceBefore = curBal ? curBal.quantity : 0;
                const balanceAfter = balanceBefore - deduct;

                await tx.stockBalance.upsert({
                  where: {
                    productId_warehouseId: {
                      productId: it.productId,
                      warehouseId: effectiveWhId,
                    },
                  },
                  update: {
                    quantity: { decrement: deduct },
                  },
                  create: {
                    productId: it.productId,
                    warehouseId: effectiveWhId,
                    quantity: -deduct,
                  },
                });

                await tx.stockLedger.create({
                  data: {
                    code: `TK-PXK-${code}-${it.sku || it.productId.slice(-4)}-${Date.now().toString().slice(-4)}`,
                    productId: it.productId,
                    warehouseId: effectiveWhId,
                    type: "OUTBOUND",
                    referenceType: "StockOutboundReceipt",
                    referenceId: receipt.id,
                    referenceCode: receipt.code,
                    quantityChange: -deduct,
                    balanceBefore,
                    balanceAfter,
                    costPrice: Number(it.unitCost) || 0,
                    notes: `Xuất kho lý do: ${reasonLabel || "Xuất khác"}`,
                    createdById: user?.userId,
                    createdByName: user?.name || creatorName || "Thủ Kho",
                  },
                });
              }
            }
          }
        }

        return receipt;
      });

      return NextResponse.json({ success: true, data: result });
    }

    // 3. Stocktake & Reconciliation (Kiểm kê & Cân bằng kho)
    if (action === "stocktake") {
      const { creatorName, warehouseLocation, warehouseId, items, totalDiscrepancyAmount, notes } = payload;
      const effectiveWhId = await resolveWarehouseId(warehouseId);
      const code = `PKK-${Date.now().toString().slice(-6)}`;
      const date = new Date().toISOString().slice(0, 16).replace("T", " ");

      const result = await prisma.$transaction(async (tx) => {
        const report = await tx.stocktakeReport.create({
          data: {
            code,
            date,
            warehouseLocation: warehouseLocation || "Kho Tổng",
            warehouseId: effectiveWhId,
            creatorName: creatorName || user?.name || "Ban Kiểm Kê",
            items: items || [],
            totalDiscrepancyAmount: Number(totalDiscrepancyAmount) || 0,
            status: "balanced",
            notes: notes || "Đã cân bằng số liệu tồn kho thực tế",
            balancedAt: date,
            balancedBy: creatorName || user?.name || "Ban Kiểm Kê",
            stocktakeItems: items && Array.isArray(items) ? {
              create: items.map((it: any) => ({
                productId: it.productId || null,
                sku: it.sku || "UNKNOWN",
                name: it.name || it.productName || "Sản phẩm",
                systemStock: Number(it.systemStock) || 0,
                actualStock: Number(it.actualStock) || 0,
                discrepancy: (Number(it.actualStock) || 0) - (Number(it.systemStock) || 0),
                unitCost: Number(it.costPrice || it.unitCost) || 0,
                discrepancyValue: ((Number(it.actualStock) || 0) - (Number(it.systemStock) || 0)) * (Number(it.costPrice || it.unitCost) || 0),
              })),
            } : undefined,
          },
          include: { stocktakeItems: true },
        });

        // Reconcile each item's stock to actualStock and write Ledger
        if (items && Array.isArray(items)) {
          for (const it of items) {
            if (it.productId && typeof it.actualStock === "number") {
              const actualStock = Math.max(0, it.actualStock);

              let discrepancy = 0;
              let balanceBefore = 0;

              if (effectiveWhId) {
                const curBal = await tx.stockBalance.findUnique({
                  where: {
                    productId_warehouseId: {
                      productId: it.productId,
                      warehouseId: effectiveWhId,
                    },
                  },
                });

                balanceBefore = curBal ? curBal.quantity : 0;
                discrepancy = actualStock - balanceBefore;

                await tx.stockBalance.upsert({
                  where: {
                    productId_warehouseId: {
                      productId: it.productId,
                      warehouseId: effectiveWhId,
                    },
                  },
                  update: { quantity: actualStock },
                  create: {
                    productId: it.productId,
                    warehouseId: effectiveWhId,
                    quantity: actualStock,
                  },
                });
              } else {
                const currentProd = await tx.product.findUnique({ where: { id: it.productId } });
                balanceBefore = currentProd ? currentProd.stockBaseUnits : 0;
                discrepancy = actualStock - balanceBefore;
              }

              // Adjust enterprise total stockBaseUnits by the net discrepancy delta in this warehouse
              if (discrepancy !== 0) {
                await tx.product.updateMany({
                  where: { id: it.productId },
                  data: {
                    stockBaseUnits: { increment: discrepancy },
                  },
                });
              }

                if (discrepancy !== 0 && effectiveWhId) {
                  await tx.stockLedger.create({
                    data: {
                      code: `TK-PKK-${code}-${it.sku || it.productId.slice(-4)}-${Date.now().toString().slice(-4)}`,
                      productId: it.productId,
                      warehouseId: effectiveWhId,
                      type: "STOCKTAKE_ADJUST",
                      referenceType: "StocktakeReport",
                      referenceId: report.id,
                      referenceCode: report.code,
                      quantityChange: discrepancy,
                      balanceBefore,
                      balanceAfter: actualStock,
                      costPrice: Number(it.costPrice || it.unitCost) || 0,
                      notes: `Điều chỉnh kiểm kê cân bằng kho: ${discrepancy > 0 ? "Thừa" : "Thiếu"} ${Math.abs(discrepancy)}`,
                      createdById: user?.userId,
                      createdByName: user?.name || creatorName || "Ban Kiểm Kê",
                    },
                  });
                }
            }
          }
        }

        return report;
      });

      return NextResponse.json({ success: true, data: result });
    }

    // 4. Warehouse Transfer (Phiếu chuyển kho nội bộ)
    if (action === "transfer") {
      const {
        sourceWarehouse,
        targetWarehouse,
        sourceWarehouseId,
        targetWarehouseId,
        creatorName,
        items,
        totalQuantity,
        totalCost,
        notes,
      } = payload;

      const code = `CK-${Date.now().toString().slice(-6)}`;
      const date = new Date().toISOString().slice(0, 16).replace("T", " ");

      const result = await prisma.$transaction(async (tx) => {
        const transfer = await tx.warehouseTransfer.create({
          data: {
            code,
            date,
            sourceWarehouse: sourceWarehouse || "Kho Tổng",
            targetWarehouse: targetWarehouse || "Chi nhánh Bình Tân",
            sourceWarehouseId: sourceWarehouseId || null,
            targetWarehouseId: targetWarehouseId || null,
            creatorName: creatorName || user?.name || "Thủ Kho",
            status: "in_transit",
            items: items || [],
            totalQuantity: Number(totalQuantity) || 0,
            totalCost: Number(totalCost) || 0,
            notes: notes || "",
            shippedAt: date,
            transferItems: items && Array.isArray(items) ? {
              create: items.map((it: any) => ({
                productId: it.productId || null,
                sku: it.sku || "UNKNOWN",
                name: it.name || it.productName || "Sản phẩm",
                quantity: Number(it.quantity) || 1,
                unitCost: Number(it.costPrice || it.unitCost) || 0,
                totalCost: (Number(it.quantity) || 1) * (Number(it.costPrice || it.unitCost) || 0),
              })),
            } : undefined,
          },
          include: { transferItems: true },
        });

        // Decrement source inventory and write TRANSFER_OUT ledger
        if (items && Array.isArray(items) && sourceWarehouseId) {
          for (const it of items) {
            const deduct = (Number(it.quantity) || 0) * (Number(it.conversionRate) || 1);
            if (it.productId) {
              const curBal = await tx.stockBalance.findUnique({
                where: {
                  productId_warehouseId: {
                    productId: it.productId,
                    warehouseId: sourceWarehouseId,
                  },
                },
              });

              const balanceBefore = curBal ? curBal.quantity : 0;
              const balanceAfter = balanceBefore - deduct;

              await tx.stockBalance.upsert({
                where: {
                  productId_warehouseId: {
                    productId: it.productId,
                    warehouseId: sourceWarehouseId,
                  },
                },
                update: { quantity: { decrement: deduct } },
                create: {
                  productId: it.productId,
                  warehouseId: sourceWarehouseId,
                  quantity: -deduct,
                },
              });

              await tx.stockLedger.create({
                data: {
                  code: `TK-CK-OUT-${code}-${it.sku || it.productId.slice(-4)}-${Date.now().toString().slice(-4)}`,
                  productId: it.productId,
                  warehouseId: sourceWarehouseId,
                  type: "TRANSFER_OUT",
                  referenceType: "WarehouseTransfer",
                  referenceId: transfer.id,
                  referenceCode: transfer.code,
                  quantityChange: -deduct,
                  balanceBefore,
                  balanceAfter,
                  costPrice: Number(it.costPrice || it.unitCost) || 0,
                  notes: `Xuất điều chuyển sang ${targetWarehouse || "kho đích"}`,
                  createdById: user?.userId,
                  createdByName: user?.name || creatorName || "Thủ Kho",
                },
              });
            }
          }
        }

        return transfer;
      });

      return NextResponse.json({ success: true, data: result });
    }

    // 5. Update Transfer Status & Receive Goods
    if (action === "update_transfer_status") {
      const { transferId, status, receiverName } = payload;
      const now = new Date().toISOString().slice(0, 16).replace("T", " ");

      const result = await prisma.$transaction(async (tx) => {
        const currentTransfer = await tx.warehouseTransfer.findUnique({
          where: { id: transferId },
          include: { transferItems: true },
        });

        if (!currentTransfer) {
          throw new Error("Không tìm thấy lệnh chuyển kho");
        }

        const updated = await tx.warehouseTransfer.update({
          where: { id: transferId },
          data: {
            status,
            receiverName: receiverName || user?.name || undefined,
            receivedAt: status === "completed" ? now : undefined,
            shippedAt: status === "in_transit" ? now : undefined,
          },
        });

        // When receiving goods into target warehouse: Increment stock & write TRANSFER_IN ledger
        if (status === "completed" && currentTransfer.targetWarehouseId) {
          const itemsToReceive = currentTransfer.transferItems.length > 0
            ? currentTransfer.transferItems
            : (Array.isArray(currentTransfer.items) ? (currentTransfer.items as any[]) : []);

          for (const it of itemsToReceive) {
            if (it.productId) {
              const qty = Number(it.quantity) || 1;
              const curBal = await tx.stockBalance.findUnique({
                where: {
                  productId_warehouseId: {
                    productId: it.productId,
                    warehouseId: currentTransfer.targetWarehouseId,
                  },
                },
              });

              const balanceBefore = curBal ? curBal.quantity : 0;
              const balanceAfter = balanceBefore + qty;

              await tx.stockBalance.upsert({
                where: {
                  productId_warehouseId: {
                    productId: it.productId,
                    warehouseId: currentTransfer.targetWarehouseId,
                  },
                },
                update: { quantity: { increment: qty } },
                create: {
                  productId: it.productId,
                  warehouseId: currentTransfer.targetWarehouseId,
                  quantity: qty,
                },
              });

              await tx.stockLedger.create({
                data: {
                  code: `TK-CK-IN-${currentTransfer.code}-${it.sku || it.productId.slice(-4)}-${Date.now().toString().slice(-4)}`,
                  productId: it.productId,
                  warehouseId: currentTransfer.targetWarehouseId,
                  type: "TRANSFER_IN",
                  referenceType: "WarehouseTransfer",
                  referenceId: currentTransfer.id,
                  referenceCode: currentTransfer.code,
                  quantityChange: qty,
                  balanceBefore,
                  balanceAfter,
                  costPrice: Number(it.unitCost) || 0,
                  notes: `Nhận hàng chuyển kho từ ${currentTransfer.sourceWarehouse}`,
                  createdById: user?.userId,
                  createdByName: user?.name || receiverName || "Thủ Kho Nhận",
                },
              });
            }
          }
        }

        return updated;
      });

      return NextResponse.json({ success: true, data: result });
    }

    // 6. Product Batch Create/Update
    if (action === "batch") {
      const { batchId, sku, productId, productionDate, expiryDate, quantityBaseUnits, warehouseLocation, daysRemaining } = payload;

      const batch = await prisma.productBatch.create({
        data: {
          batchId: batchId || `LOT-${Date.now().toString().slice(-6)}`,
          sku: sku || "SKU-UNKNOWN",
          productId: productId || null,
          productionDate: productionDate || new Date().toISOString().slice(0, 10),
          expiryDate: expiryDate || new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10),
          quantityBaseUnits: Number(quantityBaseUnits) || 0,
          warehouseLocation: warehouseLocation || "Kho Tổng",
          daysRemaining: Number(daysRemaining) || 180,
        },
      });

      return NextResponse.json({ success: true, data: batch });
    }

    return NextResponse.json({ success: false, error: "Invalid inventory action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error processing inventory action" },
      { status: 500 }
    );
  }
}
