"use client";
import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import { Pagination } from '../common/Pagination';
import { Order, CartItem } from '../../types/erp';
import {
  BarChart3,
  TrendingUp,
  Receipt,
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  Search,
  Percent,
  DollarSign,
  Package,
  Users,
  CreditCard,
  Building2,
  Printer,
  ChevronRight,
  Eye,
  X,
  FileText,
  ShoppingBag,
  ArrowUpRight,
  Sparkles,
  PieChart as PieChartIcon,
  Tag
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

export const SalesReportView: React.FC = () => {
  const { orders, customers, employees, canExportExcel, showToast } = useERP();

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'revenue' | 'vat' | 'breakdown' | 'ledger'>('revenue');

  // Breakdown sub-tab
  const [breakdownType, setBreakdownType] = useState<'employee' | 'product' | 'category' | 'customer' | 'channel' | 'tier'>('employee');

  // Time range filters
  const [timeRange, setTimeRange] = useState<'all' | 'today' | 'yesterday' | '7days' | '30days'>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Tax filter for VAT tab
  const [vatRateFilter, setVatRateFilter] = useState<'all' | '0' | '5' | '8' | '10'>('all');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination for VAT table
  const [vatPage, setVatPage] = useState(1);
  const [vatPageSize, setVatPageSize] = useState(10);

  // Pagination for Sales Ledger
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerPageSize, setLedgerPageSize] = useState(10);

  // Selected order for detailed modal / print
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filter orders by time range and search
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      // 1. Search Query
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        ord.code.toLowerCase().includes(q) ||
        ord.customerName.toLowerCase().includes(q) ||
        ord.cashierName.toLowerCase().includes(q) ||
        (ord.invoiceNumber && ord.invoiceNumber.toLowerCase().includes(q)) ||
        (ord.customerTaxId && ord.customerTaxId.toLowerCase().includes(q)) ||
        ord.items.some((i) => i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q));

      if (!matchSearch) return false;

      // 2. Time Filter
      const ordDateStr = ord.createdAt.slice(0, 10); // e.g. "2026-09-10"
      if (fromDate && ordDateStr < fromDate) return false;
      if (toDate && ordDateStr > toDate) return false;

      if (timeRange === 'today') {
        return ordDateStr === '2026-09-10';
      }
      if (timeRange === 'yesterday') {
        return ordDateStr === '2026-09-09';
      }
      if (timeRange === '7days') {
        return ordDateStr >= '2026-09-03';
      }
      if (timeRange === '30days') {
        return ordDateStr >= '2026-08-11';
      }

      return true;
    });
  }, [orders, searchQuery, fromDate, toDate, timeRange]);

  // Aggregate Key Metrics
  const metrics = useMemo(() => {
    let grossSales = 0;
    let totalDiscounts = 0;
    let netRevenue = 0;
    let totalCogs = 0;
    let totalShipping = 0;
    let totalVat = 0;
    let totalPaid = 0;
    let totalDebt = 0;

    filteredOrders.forEach((o) => {
      grossSales += o.subtotal;
      totalDiscounts += o.discountAmount;
      totalShipping += o.shippingFee;
      netRevenue += o.totalAmount;
      totalPaid += o.paidAmount;
      totalDebt += o.debtAmount;

      // Calculate VAT: if order has explicit vatAmount, use it; else fallback to 8%
      const vat = o.vatAmount ?? Math.round((o.totalAmount * (o.vatRate ?? 8)) / 100);
      totalVat += vat;

      // Calculate COGS
      o.items.forEach((item) => {
        const itemCogs = (item.costPricePerUnit || item.unitPrice * 0.8) * item.quantity;
        totalCogs += itemCogs;
      });
    });

    const grossProfit = netRevenue - totalCogs;
    const profitMargin = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;
    const averageOrderValue = filteredOrders.length > 0 ? netRevenue / filteredOrders.length : 0;

    return {
      grossSales,
      totalDiscounts,
      netRevenue,
      totalCogs,
      grossProfit,
      profitMargin,
      totalShipping,
      totalVat,
      totalPaid,
      totalDebt,
      orderCount: filteredOrders.length,
      averageOrderValue
    };
  }, [filteredOrders]);

  // Chart Data 1: Daily Revenue & Gross Profit
  const dailyChartData = useMemo(() => {
    const map: Record<string, { date: string; revenue: number; profit: number; orders: number }> = {};
    filteredOrders.forEach((o) => {
      const d = o.createdAt.slice(0, 10);
      let cogs = 0;
      o.items.forEach((item) => {
        cogs += (item.costPricePerUnit || item.unitPrice * 0.8) * item.quantity;
      });
      const profit = o.totalAmount - cogs;

      if (!map[d]) {
        map[d] = { date: d.slice(5), revenue: 0, profit: 0, orders: 0 };
      }
      map[d].revenue += o.totalAmount;
      map[d].profit += profit;
      map[d].orders += 1;
    });

    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredOrders]);

  // Chart Data 2: Payment Methods Breakdown
  const paymentChartData = useMemo(() => {
    const map: Record<string, number> = {
      'VietQR': 0,
      'Tiền Mặt': 0,
      'Ghi Nợ': 0,
      'Khác': 0
    };

    filteredOrders.forEach((o) => {
      if (o.paymentMethod === 'vietqr') map['VietQR'] += o.totalAmount;
      else if (o.paymentMethod === 'cash') map['Tiền Mặt'] += o.totalAmount;
      else if (o.paymentMethod === 'debt') map['Ghi Nợ'] += o.totalAmount;
      else map['Khác'] += o.totalAmount;
    });

    const colors = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6'];
    return Object.entries(map)
      .filter(([_, val]) => val > 0)
      .map(([name, value], idx) => ({
        name,
        value,
        color: colors[idx % colors.length]
      }));
  }, [filteredOrders]);

  // Chart Data 3: Channel Breakdown
  const channelChartData = useMemo(() => {
    const map: Record<string, number> = {
      'POS Quầy Bán Lẻ': 0,
      'Phân Phối Đại Lý B2B': 0,
      'Kênh Online & Zalo': 0
    };

    filteredOrders.forEach((o) => {
      const ch = o.salesChannel || 'pos';
      if (ch === 'b2b') map['Phân Phối Đại Lý B2B'] += o.totalAmount;
      else if (ch === 'online') map['Kênh Online & Zalo'] += o.totalAmount;
      else map['POS Quầy Bán Lẻ'] += o.totalAmount;
    });

    return Object.entries(map).map(([channel, total]) => ({
      channel,
      total
    }));
  }, [filteredOrders]);

  // VAT List & Metrics
  const vatOrders = useMemo(() => {
    return filteredOrders
      .map((ord) => {
        const vatRate = ord.vatRate ?? 8;
        const totalAmount = ord.totalAmount;
        // Tax exclusive revenue:
        const preTaxAmount = Math.round(totalAmount / (1 + vatRate / 100));
        const vatAmount = totalAmount - preTaxAmount;
        const invNo = ord.invoiceNumber || `HD-${ord.code.replace('DH-', '')}`;
        const taxId = ord.customerTaxId || customers.find((c) => c.id === ord.customerId)?.taxId || 'Khách lẻ (Không lấy HĐ)';

        return {
          order: ord,
          invoiceNumber: invNo,
          date: ord.createdAt,
          customerName: ord.customerName,
          taxId,
          preTaxAmount,
          vatRate,
          vatAmount,
          totalAmount
        };
      })
      .filter((item) => {
        if (vatRateFilter === 'all') return true;
        return item.vatRate.toString() === vatRateFilter;
      });
  }, [filteredOrders, vatRateFilter, customers]);

  const vatMetrics = useMemo(() => {
    const totalPreTax = vatOrders.reduce((s, i) => s + i.preTaxAmount, 0);
    const totalVat = vatOrders.reduce((s, i) => s + i.vatAmount, 0);
    const totalWithVat = vatOrders.reduce((s, i) => s + i.totalAmount, 0);
    return { totalPreTax, totalVat, totalWithVat, count: vatOrders.length };
  }, [vatOrders]);

  // Paginated VAT Orders
  const paginatedVatOrders = useMemo(() => {
    return vatOrders.slice((vatPage - 1) * vatPageSize, vatPage * vatPageSize);
  }, [vatOrders, vatPage, vatPageSize]);

  // Breakdown Data Calculations
  const breakdownData = useMemo(() => {
    if (breakdownType === 'employee') {
      const map: Record<string, { name: string; orderCount: number; revenue: number; cogs: number }> = {};
      filteredOrders.forEach((o) => {
        const emp = o.cashierName || 'Không xác định';
        if (!map[emp]) map[emp] = { name: emp, orderCount: 0, revenue: 0, cogs: 0 };
        map[emp].orderCount += 1;
        map[emp].revenue += o.totalAmount;
        o.items.forEach((item) => {
          map[emp].cogs += (item.costPricePerUnit || item.unitPrice * 0.8) * item.quantity;
        });
      });
      return Object.values(map)
        .map((r) => ({
          ...r,
          profit: r.revenue - r.cogs,
          margin: r.revenue > 0 ? ((r.revenue - r.cogs) / r.revenue) * 100 : 0,
          ratio: metrics.netRevenue > 0 ? (r.revenue / metrics.netRevenue) * 100 : 0
        }))
        .sort((a, b) => b.revenue - a.revenue);
    }

    if (breakdownType === 'product') {
      const map: Record<string, { sku: string; name: string; category: string; quantity: number; revenue: number; cogs: number }> = {};
      filteredOrders.forEach((o) => {
        o.items.forEach((item) => {
          if (!map[item.sku]) {
            map[item.sku] = {
              sku: item.sku,
              name: item.name,
              category: item.category,
              quantity: 0,
              revenue: 0,
              cogs: 0
            };
          }
          map[item.sku].quantity += item.quantity;
          map[item.sku].revenue += item.totalPrice;
          map[item.sku].cogs += (item.costPricePerUnit || item.unitPrice * 0.8) * item.quantity;
        });
      });
      return Object.values(map)
        .map((r) => ({
          ...r,
          profit: r.revenue - r.cogs,
          margin: r.revenue > 0 ? ((r.revenue - r.cogs) / r.revenue) * 100 : 0,
          ratio: metrics.netRevenue > 0 ? (r.revenue / metrics.netRevenue) * 100 : 0
        }))
        .sort((a, b) => b.revenue - a.revenue);
    }

    if (breakdownType === 'category') {
      const map: Record<string, { category: string; quantity: number; revenue: number; cogs: number }> = {};
      filteredOrders.forEach((o) => {
        o.items.forEach((item) => {
          const cat = item.category || 'Khác';
          if (!map[cat]) map[cat] = { category: cat, quantity: 0, revenue: 0, cogs: 0 };
          map[cat].quantity += item.quantity;
          map[cat].revenue += item.totalPrice;
          map[cat].cogs += (item.costPricePerUnit || item.unitPrice * 0.8) * item.quantity;
        });
      });
      return Object.values(map)
        .map((r) => ({
          name: r.category,
          quantity: r.quantity,
          revenue: r.revenue,
          cogs: r.cogs,
          profit: r.revenue - r.cogs,
          margin: r.revenue > 0 ? ((r.revenue - r.cogs) / r.revenue) * 100 : 0,
          ratio: metrics.netRevenue > 0 ? (r.revenue / metrics.netRevenue) * 100 : 0
        }))
        .sort((a, b) => b.revenue - a.revenue);
    }

    if (breakdownType === 'customer') {
      const map: Record<string, { name: string; phone: string; orderCount: number; revenue: number; debt: number }> = {};
      filteredOrders.forEach((o) => {
        const cName = o.customerName;
        if (!map[cName]) {
          map[cName] = {
            name: cName,
            phone: o.customerPhone,
            orderCount: 0,
            revenue: 0,
            debt: 0
          };
        }
        map[cName].orderCount += 1;
        map[cName].revenue += o.totalAmount;
        map[cName].debt += o.debtAmount;
      });
      return Object.values(map)
        .map((r) => ({
          ...r,
          ratio: metrics.netRevenue > 0 ? (r.revenue / metrics.netRevenue) * 100 : 0
        }))
        .sort((a, b) => b.revenue - a.revenue);
    }

    if (breakdownType === 'tier') {
      const tierMap: Record<string, { name: string; orderCount: number; revenue: number; debt: number }> = {
        'vip': { name: 'Bậc 3: Đại Lý VIP & Phân Phối Cấp 1', orderCount: 0, revenue: 0, debt: 0 },
        'wholesale': { name: 'Bậc 2: Bán Sỉ & Đại Lý Cấp 2', orderCount: 0, revenue: 0, debt: 0 },
        'retail': { name: 'Bậc 1: Bán Lẻ Trực Tiếp Tại Quầy', orderCount: 0, revenue: 0, debt: 0 }
      };

      filteredOrders.forEach((o) => {
        const cust = customers.find(c => c.id === o.customerId);
        let tierKey = 'retail';
        if (cust?.tier === 'vang' || cust?.tier === 'kim_cuong') {
          tierKey = 'vip';
        } else if (cust?.tier === 'bac' || o.salesChannel === 'b2b') {
          tierKey = 'wholesale';
        }
        tierMap[tierKey].orderCount += 1;
        tierMap[tierKey].revenue += o.totalAmount;
        tierMap[tierKey].debt += o.debtAmount;
      });

      return Object.values(tierMap)
        .map((r) => ({
          ...r,
          ratio: metrics.netRevenue > 0 ? (r.revenue / metrics.netRevenue) * 100 : 0
        }))
        .sort((a, b) => b.revenue - a.revenue);
    }

    // Channel breakdown
    const map: Record<string, { name: string; orderCount: number; revenue: number; debt: number }> = {
      'pos': { name: 'Bán Lẻ Tại Quầy (POS)', orderCount: 0, revenue: 0, debt: 0 },
      'b2b': { name: 'Phân Phối Đại Lý B2B', orderCount: 0, revenue: 0, debt: 0 },
      'online': { name: 'Đơn Hàng Trực Tuyến / Zalo', orderCount: 0, revenue: 0, debt: 0 }
    };
    filteredOrders.forEach((o) => {
      const ch = o.salesChannel || 'pos';
      if (!map[ch]) map[ch] = { name: ch, orderCount: 0, revenue: 0, debt: 0 };
      map[ch].orderCount += 1;
      map[ch].revenue += o.totalAmount;
      map[ch].debt += o.debtAmount;
    });
    return Object.values(map)
      .map((r) => ({
        ...r,
        ratio: metrics.netRevenue > 0 ? (r.revenue / metrics.netRevenue) * 100 : 0
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [breakdownType, filteredOrders, metrics.netRevenue, customers]);

  // Paginated Sales Ledger Orders
  const paginatedLedgerOrders = useMemo(() => {
    return filteredOrders.slice((ledgerPage - 1) * ledgerPageSize, ledgerPage * ledgerPageSize);
  }, [filteredOrders, ledgerPage, ledgerPageSize]);

  // Export handlers
  const exportRevenueReport = () => {
    if (!canExportExcel) {
      showToast('🔒 Chỉ Quản Trị Viên mới có quyền xuất báo cáo doanh thu!');
      return;
    }
    const headers = ['Mã Đơn', 'Ngày Bán', 'Kênh Bán', 'Khách Hàng', 'Thu Ngân', 'Tổng Tiền Hàng', 'Chiết Khấu', 'Thành Tiền', 'Đã Thanh Toán', 'Còn Nợ', 'Hình Thức TT'];
    const rows = filteredOrders.map((o) => [
      o.code,
      `"${o.createdAt}"`,
      o.salesChannel === 'b2b' ? 'Đại lý B2B' : o.salesChannel === 'online' ? 'Online' : 'POS Quầy',
      `"${o.customerName}"`,
      `"${o.cashierName}"`,
      o.subtotal,
      o.discountAmount,
      o.totalAmount,
      o.paidAmount,
      o.debtAmount,
      o.paymentMethod
    ]);
    const csv = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCsv(csv, `Bao_Cao_Doanh_Thu_${new Date().toISOString().slice(0, 10)}.csv`);
    showToast('📥 Đã xuất báo cáo doanh thu ra file CSV thành công!');
  };

  const exportVatReport = () => {
    if (!canExportExcel) {
      showToast('🔒 Chỉ Quản Trị Viên mới có quyền xuất báo cáo thuế GTGT!');
      return;
    }
    const headers = [
      'Số Hóa Đơn',
      'Ngày Lập',
      'Tên Người Mua',
      'Mã Số Thuế',
      'Doanh Số Bán Chưa Thuế (VNĐ)',
      'Thuế Suất (%)',
      'Tiền Thuế GTGT (VNĐ)',
      'Tổng Thanh Toán (VNĐ)'
    ];
    const rows = vatOrders.map((v) => [
      v.invoiceNumber,
      `"${v.date}"`,
      `"${v.customerName}"`,
      `"${v.taxId}"`,
      v.preTaxAmount,
      `${v.vatRate}%`,
      v.vatAmount,
      v.totalAmount
    ]);
    const csv = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCsv(csv, `Bang_Ke_Hoa_Don_VAT_GTGT_${new Date().toISOString().slice(0, 10)}.csv`);
    showToast('📥 Đã xuất bảng kê thuế GTGT đầu ra (Mẫu 01-1/GTGT) thành công!');
  };

  const exportSalesLedger = () => {
    if (!canExportExcel) {
      showToast('🔒 Chỉ Quản Trị Viên mới có quyền xuất sổ bán hàng!');
      return;
    }
    const headers = [
      'Ngày Ghi Sổ',
      'Mã Đơn',
      'Khách Hàng',
      'Mã SKU',
      'Tên Hàng Hóa',
      'ĐVT',
      'Số Lượng',
      'Đơn Giá (VNĐ)',
      'Thành Tiền (VNĐ)',
      'Chiết Khấu',
      'Doanh Thu Thuần',
      'Giá Vốn Ước Tính',
      'Lãi Gộp',
      'Thanh Toán'
    ];
    const rows: any[] = [];
    filteredOrders.forEach((o) => {
      o.items.forEach((it) => {
        const itemCogs = (it.costPricePerUnit || it.unitPrice * 0.8) * it.quantity;
        const profit = it.totalPrice - itemCogs;
        rows.push([
          `"${o.createdAt}"`,
          o.code,
          `"${o.customerName}"`,
          it.sku,
          `"${it.name}"`,
          it.selectedUnit,
          it.quantity,
          it.unitPrice,
          it.totalPrice,
          it.discountPercent ? `${it.discountPercent}%` : '0',
          it.totalPrice,
          itemCogs,
          profit,
          o.paymentMethod
        ]);
      });
    });
    const csv = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCsv(csv, `So_Nhat_Ky_Ban_Hang_${new Date().toISOString().slice(0, 10)}.csv`);
    showToast('📥 Đã xuất Sổ Nhật Ký Bán Hàng chi tiết thành công!');
  };

  const downloadCsv = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6 w-full animate-in fade-in duration-200 text-slate-800 dark:text-slate-100">
      {/* HEADER & GLOBAL ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Hệ Thống Báo Cáo Doanh Thu, Thuế VAT & Sổ Bán Hàng
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Giám sát thời gian thực kết quả kinh doanh, bảng kê hóa đơn thuế GTGT và sổ nhật ký bán hàng
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          {activeTab === 'revenue' && (
            <button
              onClick={exportRevenueReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              <Download className="h-4 w-4" />
              <span>Xuất Báo Cáo Doanh Thu</span>
            </button>
          )}

          {activeTab === 'vat' && (
            <button
              onClick={exportVatReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Xuất Bảng Kê VAT (01-1/GTGT)</span>
            </button>
          )}

          {activeTab === 'ledger' && (
            <button
              onClick={exportSalesLedger}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              <Download className="h-4 w-4" />
              <span>Xuất Sổ Bán Hàng</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 MAIN NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('revenue')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'revenue'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span>1. Báo Cáo Doanh Thu & Lợi Nhuận</span>
        </button>

        <button
          onClick={() => setActiveTab('vat')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'vat'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Percent className="h-4 w-4" />
          <span>2. Báo Cáo Thuế VAT (Bảng Kê HĐ GTGT)</span>
        </button>

        <button
          onClick={() => setActiveTab('breakdown')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'breakdown'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>3. Doanh Thu Chi Tiết Phân Loại</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ledger'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>4. Sổ Nhật Ký Bán Hàng (Sales Ledger)</span>
        </button>
      </div>

      {/* FILTER & DATE TOOLBAR */}
      <div className="flex flex-col lg:flex-row gap-3 justify-between items-stretch lg:items-center bg-white dark:bg-slate-900/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setVatPage(1);
              setLedgerPage(1);
            }}
            placeholder="Tìm theo mã đơn, số hóa đơn, khách hàng, nhân viên, sản phẩm..."
            className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Date presets & Custom Pickers */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'today', label: 'Hôm nay' },
              { id: 'yesterday', label: 'Hôm qua' },
              { id: '7days', label: '7 ngày' },
              { id: '30days', label: '30 ngày' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setTimeRange(p.id as any);
                  setFromDate('');
                  setToDate('');
                  setVatPage(1);
                  setLedgerPage(1);
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  timeRange === p.id
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Date range pickers */}
          <div className="flex items-center gap-1 text-xs">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setTimeRange('all');
                setVatPage(1);
                setLedgerPage(1);
              }}
              className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
              title="Từ ngày"
            />
            <span className="text-slate-400">-</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setTimeRange('all');
                setVatPage(1);
                setLedgerPage(1);
              }}
              className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
              title="Đến ngày"
            />
          </div>
        </div>
      </div>

      {/* ==================== TAB 1: BÁO CÁO DOANH THU & LỢI NHUẬN ==================== */}
      {activeTab === 'revenue' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* 4 HIGHLIGHT KPI CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* DOANH THU THỰC TẾ */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Doanh Thu Thuần</span>
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-mono font-black text-slate-900 dark:text-white mt-2">
                {metrics.netRevenue.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-400">đ</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {metrics.orderCount} đơn hàng • Doanh thu gộp: {metrics.grossSales.toLocaleString('vi-VN')} đ
              </div>
            </div>

            {/* LỢI NHUẬN GỘP & MARGIN */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Lợi Nhuận Gộp (Gross Profit)</span>
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-mono font-black text-emerald-600 dark:text-emerald-400 mt-2">
                +{metrics.grossProfit.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-400">đ</span>
              </div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold mt-1">
                Tỷ suất lãi gộp: {metrics.profitMargin.toFixed(1)}%
              </div>
            </div>

            {/* GIÁ VỐN HÀNG BÁN (COGS) */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Giá Vốn Xuất Kho (COGS)</span>
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                  <Package className="h-4 w-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-mono font-black text-rose-600 dark:text-rose-400 mt-2">
                {metrics.totalCogs.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-400">đ</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Chiết khấu đã trừ: -{metrics.totalDiscounts.toLocaleString('vi-VN')} đ
              </div>
            </div>

            {/* GIÁ TRỊ ĐƠN TRUNG BÌNH (AOV) & DÒNG TIỀN */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">AOV & Dòng Tiền Thực Thu</span>
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                  <CreditCard className="h-4 w-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-mono font-black text-blue-600 dark:text-blue-400 mt-2">
                {Math.round(metrics.averageOrderValue).toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-400">đ/đơn</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Thực thu: {metrics.totalPaid.toLocaleString('vi-VN')} đ • Nợ: {metrics.totalDebt.toLocaleString('vi-VN')} đ
              </div>
            </div>
          </div>

          {/* VISUAL CHARTS ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* AREA CHART: REVENUE & PROFIT OVER TIME */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-indigo-500" />
                    Biểu Đồ Xu Hướng Doanh Thu & Lợi Nhuận Gộp
                  </h3>
                  <p className="text-[11px] text-slate-400">Diễn biến doanh số và biên lãi thực tế theo các ngày</p>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis
                      tickFormatter={(val) => `${(val / 1000000).toFixed(0)}tr`}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      formatter={(val: any) => [`${Number(val).toLocaleString('vi-VN')} đ`, '']}
                      labelFormatter={(lbl) => `Ngày: ${lbl}`}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Doanh Thu Thuần"
                      stroke="#6366f1"
                      fillOpacity={1}
                      fill="url(#colorRev)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      name="Lợi Nhuận Gộp"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorProf)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* PIE CHART: PAYMENT METHODS */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4 text-purple-500" />
                  Cơ Cấu Phương Thức Thanh Toán
                </h3>
                <p className="text-[11px] text-slate-400">Tỷ trọng tiền mặt, VietQR và dư nợ</p>
              </div>

              <div className="h-52 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {paymentChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: any) => `${Number(val).toLocaleString('vi-VN')} đ`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                {paymentChartData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 dark:text-slate-300 truncate">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CHANNEL BAR CHART & REVENUE SUMMARY */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="h-4 w-4 text-indigo-500" />
              Doanh Số Phân Theo Kênh Bán Hàng (Omnichannel)
            </h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelChartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="channel" tick={{ fontSize: 11 }} />
                  <YAxis
                    tickFormatter={(val) => `${(val / 1000000).toFixed(0)}tr`}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip formatter={(val: any) => [`${Number(val).toLocaleString('vi-VN')} đ`, 'Doanh số']} />
                  <Bar dataKey="total" fill="#6366f1" radius={[8, 8, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: BÁO CÁO THUẾ VAT (BẢNG KÊ HÓA ĐƠN GTGT) ==================== */}
      {activeTab === 'vat' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* VAT METRIC CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Tổng Hóa Đơn Xuất</span>
              <div className="text-xl font-black font-mono text-slate-900 dark:text-white mt-1">
                {vatMetrics.count} <span className="text-xs font-normal text-slate-400">hóa đơn</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Doanh Số Chưa Thuế</span>
              <div className="text-xl font-black font-mono text-slate-900 dark:text-white mt-1">
                {vatMetrics.totalPreTax.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-400">đ</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-xs">
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Tiền Thuế GTGT Đầu Ra</span>
              <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                +{vatMetrics.totalVat.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-400">đ</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-xs">
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">Tổng Giá Trị Thanh Toán</span>
              <div className="text-xl font-black font-mono text-indigo-600 dark:text-indigo-400 mt-1">
                {vatMetrics.totalWithVat.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-400">đ</span>
              </div>
            </div>
          </div>

          {/* TAX RATE SELECTOR TOOLBAR */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Percent className="h-4 w-4 text-indigo-500" />
                Lọc Theo Thuế Suất VAT:
              </span>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {[
                  { id: 'all', label: 'Tất Cả' },
                  { id: '8', label: '8% (Nghị quyết giảm thuế)' },
                  { id: '10', label: '10% (Chuẩn)' },
                  { id: '5', label: '5%' },
                  { id: '0', label: '0%' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setVatRateFilter(t.id as any);
                      setVatPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      vatRateFilter === t.id
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-slate-500 text-[11px] hidden sm:block">
              Mẫu số 01-1/GTGT • Nghị định 123/2020/NĐ-CP & Thông tư 78/2021/TT-BTC
            </div>
          </div>

          {/* TABLE: BẢNG KÊ HÓA ĐƠN GTGT ĐẦU RA */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="p-4">Số Hóa Đơn</th>
                    <th className="p-4">Ngày Lập</th>
                    <th className="p-4">Tên Người Mua Hàng</th>
                    <th className="p-4">Mã Số Thuế (MST)</th>
                    <th className="p-4 text-right">Doanh Số Chưa Thuế</th>
                    <th className="p-4 text-center">Thuế Suất</th>
                    <th className="p-4 text-right">Thuế GTGT (VNĐ)</th>
                    <th className="p-4 text-right">Tổng Thanh Toán</th>
                    <th className="p-4 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {paginatedVatOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        Không có hóa đơn GTGT nào phù hợp điều kiện lọc.
                      </td>
                    </tr>
                  ) : (
                    paginatedVatOrders.map((v) => (
                      <tr key={v.order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {v.invoiceNumber}
                        </td>
                        <td className="p-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                          {v.date}
                        </td>
                        <td className="p-4 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                          {v.customerName}
                        </td>
                        <td className="p-4 font-mono text-slate-600 dark:text-slate-400">
                          {v.taxId}
                        </td>
                        <td className="p-4 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                          {v.preTaxAmount.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="p-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                            {v.vatRate}%
                          </span>
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          +{v.vatAmount.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {v.totalAmount.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => setSelectedOrder(v.order)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                            title="Xem chi tiết hóa đơn & in ấn"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={vatPage}
              pageSize={vatPageSize}
              totalItems={vatOrders.length}
              onPageChange={setVatPage}
              onPageSizeChange={(size) => {
                setVatPageSize(size);
                setVatPage(1);
              }}
              itemName="hóa đơn VAT"
            />
          </div>
        </div>
      )}

      {/* ==================== TAB 3: DOANH THU CHI TIẾT ==================== */}
      {activeTab === 'breakdown' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* BREAKDOWN TYPE SELECTOR */}
          <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            {[
              { id: 'employee', label: 'Theo Nhân Viên / Thu Ngân', icon: Users },
              { id: 'product', label: 'Theo Từng Mặt Hàng (SKU)', icon: Package },
              { id: 'category', label: 'Theo Nhóm Ngành Hàng', icon: ShoppingBag },
              { id: 'customer', label: 'Theo Khách Hàng', icon: Building2 },
              { id: 'channel', label: 'Theo Kênh Bán Hàng', icon: ArrowUpRight },
              { id: 'tier', label: 'Theo Bậc Giá & Đại Lý (3 Bậc)', icon: Tag }
            ].map((b) => {
              const Icon = b.icon;
              return (
                <button
                  key={b.id}
                  onClick={() => setBreakdownType(b.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    breakdownType === b.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{b.label}</span>
                </button>
              );
            })}
          </div>

          {/* BREAKDOWN TABLE */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="p-4">Đối Tượng / Phân Loại</th>
                    {breakdownType === 'product' && <th className="p-4">Mã SKU & Nhóm</th>}
                    {breakdownType === 'customer' && <th className="p-4">Số Điện Thoại</th>}
                    <th className="p-4 text-center">Số Lượng / Đơn</th>
                    <th className="p-4 text-right">Doanh Thu Thuần</th>
                    <th className="p-4 text-right">Tỷ Trọng (%)</th>
                    {(breakdownType === 'employee' || breakdownType === 'product' || breakdownType === 'category') && (
                      <>
                        <th className="p-4 text-right">Giá Vốn (COGS)</th>
                        <th className="p-4 text-right">Lãi Gộp (Profit)</th>
                        <th className="p-4 text-center">Biên Lãi (%)</th>
                      </>
                    )}
                    {(breakdownType === 'customer' || breakdownType === 'channel' || breakdownType === 'tier') && (
                      <th className="p-4 text-right">Dư Nợ Chưa Thu</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {breakdownData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        Không tìm thấy dữ liệu phân tích chi tiết.
                      </td>
                    </tr>
                  ) : (
                    breakdownData.map((row: any, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {row.name}
                          </div>
                        </td>

                        {breakdownType === 'product' && (
                          <td className="p-4 font-mono text-slate-500">
                            {row.sku} <span className="text-[10px] text-indigo-500">({row.category})</span>
                          </td>
                        )}

                        {breakdownType === 'customer' && (
                          <td className="p-4 font-mono text-slate-500">
                            {row.phone}
                          </td>
                        )}

                        <td className="p-4 text-center font-mono font-semibold">
                          {row.quantity !== undefined ? row.quantity.toLocaleString('vi-VN') : row.orderCount}
                        </td>

                        <td className="p-4 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {row.revenue.toLocaleString('vi-VN')} đ
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-mono text-xs">{row.ratio.toFixed(1)}%</span>
                            <div className="w-12 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div
                                className="h-full bg-indigo-500 rounded-full"
                                style={{ width: `${Math.min(row.ratio, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {(breakdownType === 'employee' || breakdownType === 'product' || breakdownType === 'category') && (
                          <>
                            <td className="p-4 text-right font-mono text-slate-600 dark:text-slate-400">
                              {row.cogs.toLocaleString('vi-VN')} đ
                            </td>
                            <td className="p-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              +{row.profit.toLocaleString('vi-VN')} đ
                            </td>
                            <td className="p-4 text-center font-mono font-semibold">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  row.margin >= 20
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                                }`}
                              >
                                {row.margin.toFixed(1)}%
                              </span>
                            </td>
                          </>
                        )}

                        {(breakdownType === 'customer' || breakdownType === 'channel' || breakdownType === 'tier') && (
                          <td className="p-4 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                            {row.debt ? `${row.debt.toLocaleString('vi-VN')} đ` : '0 đ'}
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 4: SỔ NHẬT KÝ BÁN HÀNG ==================== */}
      {activeTab === 'ledger' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="p-4">Ngày Ghi Sổ</th>
                    <th className="p-4">Số Chứng Từ</th>
                    <th className="p-4">Khách Hàng</th>
                    <th className="p-4">Sản Phẩm Chi Tiết</th>
                    <th className="p-4 text-right">Doanh Số</th>
                    <th className="p-4 text-right">Chiết Khấu</th>
                    <th className="p-4 text-right">Doanh Thu Thuần</th>
                    <th className="p-4 text-center">Phương Thức</th>
                    <th className="p-4 text-center">Trạng Thái</th>
                    <th className="p-4 text-center">Xem / In</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {paginatedLedgerOrders.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-slate-400">
                        Không tìm thấy giao dịch nào trong sổ bán hàng.
                      </td>
                    </tr>
                  ) : (
                    paginatedLedgerOrders.map((ord) => {
                      return (
                        <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                            {ord.createdAt}
                          </td>

                          <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                            {ord.code}
                            {ord.invoiceNumber && (
                              <div className="text-[10px] text-indigo-500 font-mono">
                                HĐ: {ord.invoiceNumber}
                              </div>
                            )}
                          </td>

                          <td className="p-4">
                            <div className="font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                              {ord.customerName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {ord.customerPhone}
                            </div>
                          </td>

                          <td className="p-4 max-w-xs">
                            <div className="text-[11px] text-slate-700 dark:text-slate-300">
                              {ord.items.map((it, i) => (
                                <div key={i} className="truncate">
                                  • {it.name} <span className="text-slate-400 font-mono">(x{it.quantity} {it.selectedUnit})</span>
                                </div>
                              ))}
                            </div>
                          </td>

                          <td className="p-4 text-right font-mono text-slate-700 dark:text-slate-300">
                            {ord.subtotal.toLocaleString('vi-VN')} đ
                          </td>

                          <td className="p-4 text-right font-mono text-rose-500">
                            {ord.discountAmount > 0 ? `-${ord.discountAmount.toLocaleString('vi-VN')} đ` : '0 đ'}
                          </td>

                          <td className="p-4 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {ord.totalAmount.toLocaleString('vi-VN')} đ
                          </td>

                          <td className="p-4 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold capitalize bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {ord.paymentMethod}
                            </span>
                          </td>

                          <td className="p-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                ord.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                                  : ord.status === 'shipping'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                              }`}
                            >
                              {ord.status === 'completed'
                                ? 'Hoàn tất'
                                : ord.status === 'shipping'
                                ? 'Đang giao'
                                : 'Chờ duyệt'}
                            </span>
                          </td>

                          <td className="p-4 text-center">
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                              title="Xem chi tiết & in phiếu"
                            >
                              <Printer className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={ledgerPage}
              pageSize={ledgerPageSize}
              totalItems={filteredOrders.length}
              onPageChange={setLedgerPage}
              onPageSizeChange={(size) => {
                setLedgerPageSize(size);
                setLedgerPage(1);
              }}
              itemName="chứng từ bán hàng"
            />
          </div>
        </div>
      )}

      {/* ==================== ORDER / INVOICE MODAL PREVIEW ==================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white text-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-300 space-y-4 my-8">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-black text-base text-indigo-700 tracking-wide uppercase">
                  NEXUS ERP - HÓA ĐƠN BÁN HÀNG & KÊ KHAI VAT
                </h3>
                <p className="text-[11px] text-slate-500">
                  Số: <strong className="font-mono">{selectedOrder.code}</strong> • HĐĐT: <strong className="font-mono text-indigo-600">{selectedOrder.invoiceNumber || 'HD-202609-AUTO'}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 print:hidden"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Customer info */}
            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl text-xs">
              <div>
                <span className="text-slate-400">Khách hàng: </span>
                <strong className="text-slate-800">{selectedOrder.customerName}</strong>
              </div>
              <div>
                <span className="text-slate-400">Điện thoại: </span>
                <span className="font-mono">{selectedOrder.customerPhone}</span>
              </div>
              <div>
                <span className="text-slate-400">Mã số thuế: </span>
                <span className="font-mono font-semibold text-slate-700">{selectedOrder.customerTaxId || 'Khách lẻ'}</span>
              </div>
              <div>
                <span className="text-slate-400">Thu ngân / Sale: </span>
                <span>{selectedOrder.cashierName}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="p-2.5">Mặt hàng</th>
                    <th className="p-2.5 text-center">ĐVT</th>
                    <th className="p-2.5 text-center">SL</th>
                    <th className="p-2.5 text-right">Đơn giá</th>
                    <th className="p-2.5 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedOrder.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-medium">{it.name}</td>
                      <td className="p-2.5 text-center text-slate-500">{it.selectedUnit}</td>
                      <td className="p-2.5 text-center font-mono font-bold">{it.quantity}</td>
                      <td className="p-2.5 text-right font-mono">{it.unitPrice.toLocaleString('vi-VN')} đ</td>
                      <td className="p-2.5 text-right font-mono font-bold">{it.totalPrice.toLocaleString('vi-VN')} đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="space-y-1.5 text-xs border-t border-slate-200 pt-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Cộng tiền hàng:</span>
                <span className="font-mono">{selectedOrder.subtotal.toLocaleString('vi-VN')} đ</span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Chiết khấu đơn hàng:</span>
                  <span className="font-mono">-{selectedOrder.discountAmount.toLocaleString('vi-VN')} đ</span>
                </div>
              )}
              <div className="flex justify-between text-slate-700">
                <span>Thuế suất GTGT ({selectedOrder.vatRate ?? 8}%):</span>
                <span className="font-mono font-semibold">
                  {(selectedOrder.vatAmount ?? Math.round((selectedOrder.totalAmount * (selectedOrder.vatRate ?? 8)) / 100)).toLocaleString('vi-VN')} đ
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-indigo-700 pt-1 border-t border-slate-200">
                <span>Tổng cộng thanh toán:</span>
                <span className="font-mono">{selectedOrder.totalAmount.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>

            {/* Print action buttons */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 print:hidden">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-1.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                <Printer className="h-4 w-4" />
                <span>In Chứng Từ / Hóa Đơn</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

