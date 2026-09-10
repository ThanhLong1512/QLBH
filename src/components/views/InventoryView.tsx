"use client";
import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Product,
  StockInboundReceipt,
  StockInboundItem,
  StockOutboundReceipt,
  StockOutboundItem,
  StocktakeReport,
  StocktakeItem
} from '../../types/erp';
import { Pagination } from '../common/Pagination';
import {
  Boxes,
  ArrowDownLeft,
  ArrowUpRight,
  ClipboardCheck,
  Search,
  Plus,
  Filter,
  Download,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  X,
  Eye,
  FileText,
  DollarSign,
  Package,
  Layers,
  Sparkles,
  RotateCw
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const {
    products,
    suppliers,
    inbounds,
    outbounds,
    stocktakes,
    addInboundReceipt,
    addOutboundReceipt,
    addStocktakeReport,
    canViewCosts,
    canExportExcel,
    showToast,
    currentUser
  } = useERP();

  const [activeTab, setActiveTab] = useState<'balance' | 'inbounds' | 'outbounds' | 'stocktake'>('balance');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Pagination states
  const [balancePage, setBalancePage] = useState(1);
  const [balancePageSize, setBalancePageSize] = useState(8);

  const [inboundPage, setInboundPage] = useState(1);
  const [inboundPageSize, setInboundPageSize] = useState(8);

  const [outboundPage, setOutboundPage] = useState(1);
  const [outboundPageSize, setOutboundPageSize] = useState(8);

  // Modals
  const [isInboundModalOpen, setIsInboundModalOpen] = useState(false);
  const [isOutboundModalOpen, setIsOutboundModalOpen] = useState(false);
  const [selectedInboundDetail, setSelectedInboundDetail] = useState<StockInboundReceipt | null>(null);
  const [selectedOutboundDetail, setSelectedOutboundDetail] = useState<StockOutboundReceipt | null>(null);

  // Inbound Form State
  const [inboundSupplierId, setInboundSupplierId] = useState('');
  const [inboundItems, setInboundItems] = useState<
    Array<{
      productId: string;
      productName: string;
      unitName: string;
      conversionRate: number;
      quantity: number;
      unitCost: number;
      batchNumber: string;
      expiryDate: string;
    }>
  >([]);
  const [inboundPaidAmount, setInboundPaidAmount] = useState(0);
  const [inboundPaymentMethod, setInboundPaymentMethod] = useState<'cash' | 'bank_transfer' | 'debt'>('bank_transfer');
  const [inboundNotes, setInboundNotes] = useState('');

  // Outbound Form State
  const [outboundReason, setOutboundReason] = useState<'damage' | 'internal_use' | 'transfer' | 'other'>('internal_use');
  const [outboundDestination, setOutboundDestination] = useState('Chi nhánh Bình Tân');
  const [outboundItems, setOutboundItems] = useState<
    Array<{
      productId: string;
      productName: string;
      unitName: string;
      quantity: number;
    }>
  >([]);
  const [outboundNotes, setOutboundNotes] = useState('');

  // Stocktake interactive counts: productId -> actual count
  const [stocktakeCounts, setStocktakeCounts] = useState<Record<string, number>>({});

  // Categories
  const categories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category))).filter(Boolean);
  }, [products]);

  // Overall Inventory Stats
  const totalStockItems = useMemo(() => {
    return products.reduce((sum, p) => sum + p.stockBaseUnits, 0);
  }, [products]);

  const totalInventoryValue = useMemo(() => {
    return products.reduce((sum, p) => sum + p.stockBaseUnits * p.costPrice, 0);
  }, [products]);

  const lowStockCount = useMemo(() => {
    return products.filter(p => p.stockBaseUnits <= p.minStockAlert).length;
  }, [products]);

  // Filtered products for balance view
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.barcode && p.barcode.includes(searchQuery));
      const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [products, searchQuery, categoryFilter]);

  const paginatedBalanceProducts = useMemo(() => {
    const start = (balancePage - 1) * balancePageSize;
    return filteredProducts.slice(start, start + balancePageSize);
  }, [filteredProducts, balancePage, balancePageSize]);

  // Filtered inbounds
  const filteredInbounds = useMemo(() => {
    return inbounds.filter(r => {
      return (
        r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.supplierName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [inbounds, searchQuery]);

  const paginatedInbounds = useMemo(() => {
    const start = (inboundPage - 1) * inboundPageSize;
    return filteredInbounds.slice(start, start + inboundPageSize);
  }, [filteredInbounds, inboundPage, inboundPageSize]);

  // Filtered outbounds
  const filteredOutbounds = useMemo(() => {
    return outbounds.filter(r => {
      return (
        r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.destination && r.destination.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
  }, [outbounds, searchQuery]);

  const paginatedOutbounds = useMemo(() => {
    const start = (outboundPage - 1) * outboundPageSize;
    return filteredOutbounds.slice(start, start + outboundPageSize);
  }, [filteredOutbounds, outboundPage, outboundPageSize]);

  // Handle open Inbound Modal
  const handleOpenInboundModal = () => {
    if (suppliers.length === 0) {
      showToast('⚠️ Vui lòng tạo ít nhất một nhà cung cấp trước');
      return;
    }
    const defaultSup = suppliers[0];
    setInboundSupplierId(defaultSup.id);

    const initialItemProduct = products[0];
    if (initialItemProduct) {
      setInboundItems([
        {
          productId: initialItemProduct.id,
          productName: initialItemProduct.name,
          unitName: initialItemProduct.baseUnit,
          conversionRate: 1,
          quantity: 10,
          unitCost: initialItemProduct.costPrice,
          batchNumber: `LÔ-${new Date().toISOString().slice(2, 7).replace('-', '')}`,
          expiryDate: new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10)
        }
      ]);
      setInboundPaidAmount(initialItemProduct.costPrice * 10);
    } else {
      setInboundItems([]);
      setInboundPaidAmount(0);
    }
    setInboundPaymentMethod('bank_transfer');
    setInboundNotes('');
    setIsInboundModalOpen(true);
  };

  const calculateInboundTotal = useMemo(() => {
    return inboundItems.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  }, [inboundItems]);

  const handleAddInboundItemRow = () => {
    const p = products[0];
    if (!p) return;
    setInboundItems(prev => [
      ...prev,
      {
        productId: p.id,
        productName: p.name,
        unitName: p.baseUnit,
        conversionRate: 1,
        quantity: 5,
        unitCost: p.costPrice,
        batchNumber: `LÔ-${new Date().toISOString().slice(2, 7).replace('-', '')}`,
        expiryDate: new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10)
      }
    ]);
  };

  const handleSaveInbound = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find(s => s.id === inboundSupplierId);
    if (!sup) {
      showToast('⚠️ Vui lòng chọn nhà cung cấp');
      return;
    }
    if (inboundItems.length === 0) {
      showToast('⚠️ Phiếu nhập kho phải có ít nhất 1 mặt hàng');
      return;
    }

    const totalCost = calculateInboundTotal;
    const paid = inboundPaymentMethod === 'debt' ? 0 : inboundPaidAmount;
    const remainingDebt = Math.max(0, totalCost - paid);

    const itemsPayload: StockInboundItem[] = inboundItems.map(item => {
      const prod = products.find(p => p.id === item.productId)!;
      return {
        productId: item.productId,
        sku: prod.sku,
        productName: prod.name,
        unitName: item.unitName,
        conversionRate: item.conversionRate,
        quantity: item.quantity,
        unitCost: item.unitCost,
        totalCost: item.quantity * item.unitCost,
        batchNumber: item.batchNumber,
        expiryDate: item.expiryDate
      };
    });

    addInboundReceipt({
      date: new Date().toISOString().slice(0, 10),
      supplierId: sup.id,
      supplierName: sup.name,
      creatorName: currentUser ? currentUser.name : 'Thủ Kho',
      items: itemsPayload,
      totalCost,
      paidAmount: paid,
      debtAmount: remainingDebt,
      paymentMethod: inboundPaymentMethod,
      notes: inboundNotes,
      status: 'completed'
    });
    setIsInboundModalOpen(false);
  };

  // Outbound Modal
  const handleOpenOutboundModal = () => {
    const initialProd = products[0];
    if (initialProd) {
      setOutboundItems([
        {
          productId: initialProd.id,
          productName: initialProd.name,
          unitName: initialProd.baseUnit,
          quantity: 1
        }
      ]);
    } else {
      setOutboundItems([]);
    }
    setOutboundReason('internal_use');
    setOutboundDestination('Chi nhánh Bình Tân');
    setOutboundNotes('');
    setIsOutboundModalOpen(true);
  };

  const handleAddOutboundItemRow = () => {
    const p = products[0];
    if (!p) return;
    setOutboundItems(prev => [
      ...prev,
      {
        productId: p.id,
        productName: p.name,
        unitName: p.baseUnit,
        quantity: 1
      }
    ]);
  };

  const handleSaveOutbound = (e: React.FormEvent) => {
    e.preventDefault();
    if (outboundItems.length === 0) {
      showToast('⚠️ Phiếu xuất kho phải có ít nhất 1 mặt hàng');
      return;
    }

    // Check if enough stock
    for (const item of outboundItems) {
      const prod = products.find(p => p.id === item.productId);
      if (prod && prod.stockBaseUnits < item.quantity) {
        showToast(`⚠️ Không đủ tồn kho cho "${prod.name}" (Hiện có: ${prod.stockBaseUnits} ${prod.baseUnit})`);
        return;
      }
    }

    let totalVal = 0;
    const itemsPayload: StockOutboundItem[] = outboundItems.map(item => {
      const prod = products.find(p => p.id === item.productId)!;
      const val = item.quantity * prod.costPrice;
      totalVal += val;
      return {
        productId: item.productId,
        sku: prod.sku,
        productName: prod.name,
        unitName: item.unitName,
        conversionRate: 1,
        quantity: item.quantity,
        unitCost: prod.costPrice,
        totalCost: val
      };
    });

    const getReasonLabelText = (r: string) => {
      switch (r) {
        case 'damage':
        case 'damaged':
          return 'Xuất hủy hỏng/lỗi';
        case 'internal_use':
          return 'Tiêu hao nội bộ';
        case 'transfer':
          return 'Điều chuyển kho';
        case 'loss':
          return 'Thất thoát / Hao hụt';
        default:
          return 'Xuất khác';
      }
    };

    addOutboundReceipt({
      date: new Date().toISOString().slice(0, 10),
      creatorName: currentUser ? currentUser.name : 'Thủ Kho',
      reason: outboundReason === 'damage' ? ('damaged' as any) : outboundReason,
      reasonLabel: getReasonLabelText(outboundReason),
      destination: outboundDestination,
      items: itemsPayload,
      totalCost: totalVal,
      notes: outboundNotes,
      status: 'completed'
    });
    setIsOutboundModalOpen(false);
  };

  // Stocktake Actions
  const handleActualCountChange = (productId: string, val: number) => {
    setStocktakeCounts(prev => ({
      ...prev,
      [productId]: Math.max(0, val)
    }));
  };

  const handleReconcileStocktake = () => {
    const items: StocktakeItem[] = products.map(prod => {
      const systemStock = prod.stockBaseUnits;
      const actualStock =
        stocktakeCounts[prod.id] !== undefined ? stocktakeCounts[prod.id] : systemStock;
      const diff = actualStock - systemStock;
      const diffValue = diff * prod.costPrice;

      return {
        productId: prod.id,
        sku: prod.sku,
        productName: prod.name,
        unitName: prod.baseUnit,
        systemStock,
        actualStock,
        difference: diff,
        unitCost: prod.costPrice,
        differenceValue: diffValue
      };
    });

    const totalDiffVal = items.reduce((sum, item) => sum + Math.abs(item.differenceValue), 0);

    addStocktakeReport({
      date: new Date().toISOString().slice(0, 10),
      creatorName: currentUser ? currentUser.name : 'Ban Kiểm Kê',
      items,
      totalDiscrepancyAmount: totalDiffVal,
      notes: 'Đã hoàn tất đối soát và tự động cân bằng tồn kho thực tế',
      status: 'balanced'
    });
    setStocktakeCounts({});
    showToast('✅ Đã cân bằng số liệu tồn kho thành công!');
  };

  const exportStockBalanceExcel = () => {
    const csvContent = [
      ['Mã SKU', 'Mã Vạch', 'Tên Sản Phẩm', 'Ngành Hàng', 'ĐVT', 'Tồn Kho Khả Dụng', 'Giá Vốn', 'Tổng Giá Trị Tồn'].join(','),
      ...products.map(p =>
        [
          `"${p.sku}"`,
          `"${p.barcode || ''}"`,
          `"${p.name}"`,
          `"${p.category}"`,
          `"${p.baseUnit}"`,
          p.stockBaseUnits,
          p.costPrice,
          p.stockBaseUnits * p.costPrice
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bao_Cao_Xuat_Nhap_Ton_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast('📥 Đã xuất báo cáo xuất nhập tồn thành công!');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Boxes className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Quản Lý Xuất Nhập Tồn & Kiểm Kê Kho
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Báo cáo tổng hợp xuất nhập tồn, lập phiếu nhập kho NCC, xuất hủy/chuyển kho & cân bằng kiểm kê định kỳ
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {canExportExcel && (
            <button
              onClick={exportStockBalanceExcel}
              className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              Xuất Báo Cáo
            </button>
          )}

          <button
            id="create-inbound-receipt-btn"
            onClick={handleOpenInboundModal}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <ArrowDownLeft className="w-4 h-4" />
            Lập Phiếu Nhập Kho
          </button>

          <button
            id="create-outbound-receipt-btn"
            onClick={handleOpenOutboundModal}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <ArrowUpRight className="w-4 h-4" />
            Lập Phiếu Xuất Kho
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Tổng Số Lượng Tồn Kho</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {totalStockItems.toLocaleString('vi-VN')}
            </span>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              {products.length} SKU
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Tổng Giá Trị Tồn Kho</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {canViewCosts ? `${(totalInventoryValue / 1000000).toFixed(1)} tr đ` : '•••••••• đ'}
            </span>
            <span className="text-[10px] text-slate-400">Giá vốn bình quân</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Phiếu Nhập Đã Lập</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {inbounds.length}
            </span>
            <span className="text-xs text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded font-medium">
              +{inbounds.reduce((s, r) => s + r.items.reduce((si, i) => si + i.quantity, 0), 0)} SP
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Cảnh Báo Thiếu Hàng</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {lowStockCount}
            </span>
            <span className="text-xs text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded font-medium">
              Cần đặt NCC
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => {
            setActiveTab('balance');
            setSearchQuery('');
          }}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'balance'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Boxes className="w-4 h-4" />
          Báo Cáo Xuất Nhập Tồn
        </button>

        <button
          onClick={() => {
            setActiveTab('inbounds');
            setSearchQuery('');
          }}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'inbounds'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
          Lịch Sử Nhập Kho (PNK)
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800">
            {inbounds.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('outbounds');
            setSearchQuery('');
          }}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'outbounds'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ArrowUpRight className="w-4 h-4 text-rose-600" />
          Lịch Sử Xuất Kho (PXK)
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800">
            {outbounds.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('stocktake');
            setSearchQuery('');
          }}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'stocktake'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ClipboardCheck className="w-4 h-4 text-indigo-500" />
          Kiểm Kê & Cân Bằng Kho
        </button>
      </div>

      {/* TAB 1: STOCK BALANCE */}
      {activeTab === 'balance' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm sản phẩm theo tên, mã SKU hoặc mã vạch..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setBalancePage(1);
                }}
                className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={categoryFilter}
                onChange={e => {
                  setCategoryFilter(e.target.value);
                  setBalancePage(1);
                }}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <option value="all">Tất cả ngành hàng</option>
                {categories.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold">
                    <th className="py-3 px-4">Mã SKU & Sản Phẩm</th>
                    <th className="py-3 px-4">Ngành Hàng</th>
                    <th className="py-3 px-4">ĐVT</th>
                    <th className="py-3 px-4 text-center">Tồn Hiện Tại</th>
                    <th className="py-3 px-4 text-center">Định Mức Min</th>
                    {canViewCosts && <th className="py-3 px-4 text-right">Giá Vốn</th>}
                    {canViewCosts && <th className="py-3 px-4 text-right">Giá Trị Tồn Kho</th>}
                    <th className="py-3 px-4 text-center">Trạng Thái Kho</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {paginatedBalanceProducts.map(p => {
                    const isLow = p.stockBaseUnits > 0 && p.stockBaseUnits <= (p.minStockThreshold ?? p.minStockAlert ?? 10);
                    const isOut = p.stockBaseUnits <= 0;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=100&auto=format&fit=crop&q=80'}
                              alt={p.name}
                              className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                            />
                            <div>
                              <span className="font-semibold text-slate-900 dark:text-white block">
                                {p.name}
                              </span>
                              <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                                {p.sku}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-slate-600 dark:text-slate-300">{p.category}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-800 dark:text-slate-200">{p.baseUnit}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {p.stockBaseUnits}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-slate-500 font-mono">
                          {p.minStockThreshold ?? p.minStockAlert ?? 10}
                        </td>
                        {canViewCosts && (
                          <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-300">
                            {p.costPrice.toLocaleString('vi-VN')} đ
                          </td>
                        )}
                        {canViewCosts && (
                          <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white font-mono">
                            {(p.stockBaseUnits * p.costPrice).toLocaleString('vi-VN')} đ
                          </td>
                        )}
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              isOut
                                ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                                : isLow
                                ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                            }`}
                          >
                            {isOut ? 'Hết Hàng' : isLow ? 'Sắp Hết' : 'Tồn Đủ'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={balancePage}
              totalItems={filteredProducts.length}
              pageSize={balancePageSize}
              onPageChange={setBalancePage}
              onPageSizeChange={setBalancePageSize}
              itemName="sản phẩm"
              className="border-t border-slate-200 dark:border-slate-800"
            />
          </div>
        </div>
      )}

      {/* TAB 2: INBOUND RECEIPTS */}
      {activeTab === 'inbounds' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold">
                    <th className="py-3 px-4">Mã Phiếu Nhập</th>
                    <th className="py-3 px-4">Thời Gian</th>
                    <th className="py-3 px-4">Nhà Cung Cấp</th>
                    <th className="py-3 px-4">Người Lập</th>
                    <th className="py-3 px-4 text-center">Số Mặt Hàng</th>
                    <th className="py-3 px-4 text-right">Tổng Tiền Hàng</th>
                    <th className="py-3 px-4 text-right">Đã Thanh Toán</th>
                    <th className="py-3 px-4 text-right">Ghi Nợ NCC</th>
                    <th className="py-3 px-4 text-center">Trạng Thái</th>
                    <th className="py-3 px-4 text-center">Chi Tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {paginatedInbounds.map(inbound => (
                    <tr key={inbound.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {inbound.code}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(inbound.date).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {inbound.supplierName}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {inbound.creatorName}
                      </td>
                      <td className="py-3 px-4 text-center font-medium">
                        {inbound.items.length} mặt hàng
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                        {inbound.totalCost.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-emerald-600">
                        {inbound.paidAmount.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-rose-600">
                        {inbound.debtAmount > 0 ? `${inbound.debtAmount.toLocaleString('vi-VN')} đ` : '0 đ'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            inbound.debtAmount === 0
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : inbound.paidAmount > 0
                              ? 'bg-amber-500/10 text-amber-600'
                              : 'bg-rose-500/10 text-rose-600'
                          }`}
                        >
                          {inbound.debtAmount === 0
                            ? 'Đã trả đủ'
                            : inbound.paidAmount > 0
                            ? 'Trả một phần'
                            : 'Ghi nợ 100%'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedInboundDetail(inbound)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={inboundPage}
              totalItems={filteredInbounds.length}
              pageSize={inboundPageSize}
              onPageChange={setInboundPage}
              onPageSizeChange={setInboundPageSize}
              itemName="phiếu nhập kho"
              className="border-t border-slate-200 dark:border-slate-800"
            />
          </div>
        </div>
      )}

      {/* TAB 3: OUTBOUND RECEIPTS */}
      {activeTab === 'outbounds' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold">
                    <th className="py-3 px-4">Mã Phiếu Xuất</th>
                    <th className="py-3 px-4">Thời Gian</th>
                    <th className="py-3 px-4">Lý Do Xuất Kho</th>
                    <th className="py-3 px-4">Nơi Đến / Bộ Phận</th>
                    <th className="py-3 px-4">Người Lập</th>
                    <th className="py-3 px-4 text-center">Số Mặt Hàng</th>
                    <th className="py-3 px-4 text-right">Tổng Giá Trị Xuất</th>
                    <th className="py-3 px-4 text-center">Chi Tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {paginatedOutbounds.map(outbound => {
                    const getReasonLabel = (r: string) => {
                      switch (r) {
                        case 'damage':
                        case 'damaged':
                          return { text: 'Xuất hủy hỏng/lỗi', color: 'text-rose-600 bg-rose-500/10' };
                        case 'internal_use':
                          return { text: 'Tiêu hao nội bộ', color: 'text-indigo-600 bg-indigo-500/10' };
                        case 'transfer':
                          return { text: 'Điều chuyển kho', color: 'text-sky-600 bg-sky-500/10' };
                        default:
                          return { text: outbound.reasonLabel || 'Xuất khác', color: 'text-slate-600 bg-slate-100' };
                      }
                    };
                    const reason = getReasonLabel(outbound.reason);

                    return (
                      <tr key={outbound.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono font-bold text-rose-600 dark:text-rose-400">
                          {outbound.code}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {new Date(outbound.date).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${reason.color}`}>
                            {reason.text}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                          {outbound.destination || 'Nội bộ'}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {outbound.creatorName}
                        </td>
                        <td className="py-3 px-4 text-center font-medium">
                          {outbound.items.length} mặt hàng
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                          {outbound.totalCost.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setSelectedOutboundDetail(outbound)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={outboundPage}
              totalItems={filteredOutbounds.length}
              pageSize={outboundPageSize}
              onPageChange={setOutboundPage}
              onPageSizeChange={setOutboundPageSize}
              itemName="phiếu xuất kho"
              className="border-t border-slate-200 dark:border-slate-800"
            />
          </div>
        </div>
      )}

      {/* TAB 4: STOCKTAKE & AUDIT */}
      {activeTab === 'stocktake' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Bảng Kiểm Kê & Đối Soát Khớp Tồn Kho Thực Tế
              </h3>
              <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-0.5">
                Nhập số lượng đếm được thực tế tại kho. Hệ thống tự động tính chênh lệch Thừa / Thiếu và giá trị lệch. Nhấn nút "Cân Bằng Kho" để khớp dữ liệu.
              </p>
            </div>

            <button
              onClick={handleReconcileStocktake}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow flex items-center gap-2 shrink-0 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Cân Bằng & Khớp Tồn Kho
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold">
                    <th className="py-3 px-4">Sản Phẩm & SKU</th>
                    <th className="py-3 px-4">ĐVT</th>
                    <th className="py-3 px-4 text-center">Tồn Hệ Thống (1)</th>
                    <th className="py-3 px-4 text-center w-40">Thực Tế Đếm Được (2)</th>
                    <th className="py-3 px-4 text-center">Chênh Lệch (2 - 1)</th>
                    {canViewCosts && <th className="py-3 px-4 text-right">Giá Trị Chênh Lệch</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {products.map(p => {
                    const actual =
                      stocktakeCounts[p.id] !== undefined ? stocktakeCounts[p.id] : p.stockBaseUnits;
                    const diff = actual - p.stockBaseUnits;
                    const diffVal = diff * p.costPrice;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-900 dark:text-white block">{p.name}</span>
                          <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">{p.sku}</span>
                        </td>
                        <td className="py-3 px-4 font-medium">{p.baseUnit}</td>
                        <td className="py-3 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                          {p.stockBaseUnits}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="number"
                            min={0}
                            value={actual}
                            onChange={e => handleActualCountChange(p.id, Number(e.target.value))}
                            className="w-24 px-2.5 py-1 text-center font-bold text-xs rounded border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`font-bold px-2 py-0.5 rounded-full text-xs ${
                              diff === 0
                                ? 'text-slate-400 bg-slate-100 dark:bg-slate-800'
                                : diff > 0
                                ? 'text-emerald-600 bg-emerald-500/10'
                                : 'text-rose-600 bg-rose-500/10'
                            }`}
                          >
                            {diff > 0 ? `+${diff}` : diff}
                          </span>
                        </td>
                        {canViewCosts && (
                          <td className="py-3 px-4 text-right font-mono font-semibold">
                            <span className={diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-rose-600' : 'text-slate-400'}>
                              {diffVal > 0 ? `+${diffVal.toLocaleString('vi-VN')} đ` : `${diffVal.toLocaleString('vi-VN')} đ`}
                            </span>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE INBOUND RECEIPT MODAL */}
      {isInboundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-6 py-4 backdrop-blur">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                Lập Phiếu Nhập Kho Từ Nhà Cung Cấp
              </h3>
              <button
                onClick={() => setIsInboundModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInbound} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Chọn Nhà Cung Cấp Cung Ứng *
                  </label>
                  <select
                    value={inboundSupplierId}
                    onChange={e => setInboundSupplierId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code}) - Nợ hiện tại: {s.currentDebt.toLocaleString('vi-VN')} đ
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phương Thức Thanh Toán Khi Nhập *
                  </label>
                  <select
                    value={inboundPaymentMethod}
                    onChange={e => setInboundPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                  >
                    <option value="bank_transfer">Chuyển khoản thanh toán ngay</option>
                    <option value="cash">Chi tiền mặt tại quỹ</option>
                    <option value="debt">Ghi nợ 100% công nợ NCC</option>
                  </select>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Danh Sách Mặt Hàng Nhập Kho ({inboundItems.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddInboundItemRow}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm Dòng Sản Phẩm
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {inboundItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 grid grid-cols-1 sm:grid-cols-5 gap-2 items-center text-xs"
                    >
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-400 block">Sản phẩm</label>
                        <select
                          value={item.productId}
                          onChange={e => {
                            const p = products.find(prod => prod.id === e.target.value);
                            if (p) {
                              const newItems = [...inboundItems];
                              newItems[idx].productId = p.id;
                              newItems[idx].productName = p.name;
                              newItems[idx].unitName = p.baseUnit;
                              newItems[idx].unitCost = p.costPrice;
                              setInboundItems(newItems);
                            }
                          }}
                          className="w-full p-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.sku})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block">Số lượng ({item.unitName})</label>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={e => {
                            const newItems = [...inboundItems];
                            newItems[idx].quantity = Number(e.target.value);
                            setInboundItems(newItems);
                          }}
                          className="w-full p-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block">Đơn giá vốn (VNĐ)</label>
                        <input
                          type="number"
                          min={0}
                          value={item.unitCost}
                          onChange={e => {
                            const newItems = [...inboundItems];
                            newItems[idx].unitCost = Number(e.target.value);
                            setInboundItems(newItems);
                          }}
                          className="w-full p-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2 pt-3 sm:pt-0">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {(item.quantity * item.unitCost).toLocaleString('vi-VN')} đ
                        </span>
                        {inboundItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setInboundItems(inboundItems.filter((_, i) => i !== idx))}
                            className="p-1 text-slate-400 hover:text-rose-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment details */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                  <span>Tổng tiền hàng nhập kho:</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    {calculateInboundTotal.toLocaleString('vi-VN')} đ
                  </span>
                </div>

                {inboundPaymentMethod !== 'debt' && (
                  <div className="flex justify-between items-center">
                    <label className="text-slate-700 dark:text-slate-300 font-medium">
                      Số tiền thực trả cho NCC:
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={calculateInboundTotal}
                      value={inboundPaidAmount}
                      onChange={e => setInboundPaidAmount(Number(e.target.value))}
                      className="w-40 px-2.5 py-1 text-right text-xs font-bold rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-emerald-600"
                    />
                  </div>
                )}

                <div className="flex justify-between items-center text-rose-600 font-semibold pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span>Ghi nợ NCC (Khoản phải trả sau):</span>
                  <span>
                    {inboundPaymentMethod === 'debt'
                      ? `${calculateInboundTotal.toLocaleString('vi-VN')} đ`
                      : `${Math.max(0, calculateInboundTotal - inboundPaidAmount).toLocaleString('vi-VN')} đ`}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ghi Chú Nhập Kho
                </label>
                <input
                  type="text"
                  value={inboundNotes}
                  onChange={e => setInboundNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  placeholder="Ghi chú số hóa đơn đỏ, số biên bản giao nhận..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInboundModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Xác Nhận Nhập Kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE OUTBOUND RECEIPT MODAL */}
      {isOutboundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-6 py-4 backdrop-blur">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-rose-600" />
                Lập Phiếu Xuất Kho Nội Bộ / Xuất Hủy
              </h3>
              <button
                onClick={() => setIsOutboundModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOutbound} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lý Do Xuất Kho *
                  </label>
                  <select
                    value={outboundReason}
                    onChange={e => setOutboundReason(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="internal_use">Sử dụng nội bộ / Văn phòng phẩm</option>
                    <option value="transfer">Điều chuyển chi nhánh / Kho khác</option>
                    <option value="damage">Xuất hủy hàng hỏng vỡ / Hết hạn</option>
                    <option value="other">Xuất mục đích khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Địa Điểm Đến / Người Nhận *
                  </label>
                  <input
                    type="text"
                    required
                    value={outboundDestination}
                    onChange={e => setOutboundDestination(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    placeholder="VD: Chi nhánh Bình Tân, Phòng Hành Chính..."
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Mặt Hàng Xuất Kho ({outboundItems.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddOutboundItemRow}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm Dòng Sản Phẩm
                  </button>
                </div>

                <div className="space-y-2">
                  {outboundItems.map((item, idx) => {
                    const prod = products.find(p => p.id === item.productId);
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center text-xs"
                      >
                        <div className="sm:col-span-2">
                          <label className="text-[10px] text-slate-400 block">Sản phẩm</label>
                          <select
                            value={item.productId}
                            onChange={e => {
                              const p = products.find(pr => pr.id === e.target.value);
                              if (p) {
                                const newItems = [...outboundItems];
                                newItems[idx].productId = p.id;
                                newItems[idx].productName = p.name;
                                newItems[idx].unitName = p.baseUnit;
                                setOutboundItems(newItems);
                              }
                            }}
                            className="w-full p-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                          >
                            {products.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.name} (Tồn: {p.stockBaseUnits} {p.baseUnit})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 block">
                            SL Xuất (Tối đa: {prod?.stockBaseUnits || 0})
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={prod?.stockBaseUnits || 9999}
                            value={item.quantity}
                            onChange={e => {
                              const newItems = [...outboundItems];
                              newItems[idx].quantity = Number(e.target.value);
                              setOutboundItems(newItems);
                            }}
                            className="w-full p-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                          />
                        </div>

                        <div className="flex items-center justify-end">
                          {outboundItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setOutboundItems(outboundItems.filter((_, i) => i !== idx))}
                              className="p-1 text-slate-400 hover:text-rose-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ghi Chú Xuất Kho
                </label>
                <input
                  type="text"
                  value={outboundNotes}
                  onChange={e => setOutboundNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  placeholder="Ghi chú người duyệt, biên bản kiểm tra..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOutboundModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Xác Nhận Xuất Kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL VIEW MODALS */}
      {selectedInboundDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Chi Tiết Phiếu Nhập: {selectedInboundDetail.code}
                </h3>
                <p className="text-xs text-slate-500">
                  NCC: {selectedInboundDetail.supplierName} • {new Date(selectedInboundDetail.date).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <button
                onClick={() => setSelectedInboundDetail(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {selectedInboundDetail.items.map((it, i) => (
                <div key={i} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white block">{it.productName}</span>
                    <span className="text-slate-500 text-[11px]">
                      SL: {it.quantity} {it.unitName} • Đơn giá: {it.unitCost.toLocaleString('vi-VN')} đ
                    </span>
                    {it.batchNumber && (
                      <span className="text-[10px] text-indigo-500 block">
                        Lô: {it.batchNumber} {it.expiryDate ? `(HSD: ${it.expiryDate})` : ''}
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {it.totalCost.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1 text-xs">
              <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                <span>Tổng giá trị phiếu:</span>
                <span>{selectedInboundDetail.totalCost.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Đã thanh toán:</span>
                <span>{selectedInboundDetail.paidAmount.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between text-rose-600 font-bold">
                <span>Ghi nợ nhà cung cấp:</span>
                <span>{selectedInboundDetail.debtAmount.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedInboundDetail(null)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedOutboundDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Chi Tiết Phiếu Xuất: {selectedOutboundDetail.code}
                </h3>
                <p className="text-xs text-slate-500">
                  Nơi đến: {selectedOutboundDetail.destination || 'Nội bộ'} • {new Date(selectedOutboundDetail.date).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOutboundDetail(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {selectedOutboundDetail.items.map((it, i) => (
                <div key={i} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white block">{it.productName}</span>
                    <span className="text-slate-500 text-[11px]">
                      SL: {it.quantity} {it.unitName}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {it.totalCost.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1 text-xs">
              <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                <span>Tổng giá trị xuất kho:</span>
                <span>{selectedOutboundDetail.totalCost.toLocaleString('vi-VN')} đ</span>
              </div>
              {selectedOutboundDetail.notes && (
                <p className="text-slate-500 text-[11px]">Ghi chú: {selectedOutboundDetail.notes}</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOutboundDetail(null)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

