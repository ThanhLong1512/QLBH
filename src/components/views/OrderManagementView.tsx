"use client";
import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Order, OrderStatus } from '../../types/erp';
import { Pagination } from '../common/Pagination';
import {
  Search,
  Filter,
  Download,
  Receipt,
  FileText,
  Tag,
  MessageSquare,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Eye,
  Printer,
  ChevronDown,
  Layers,
  DollarSign,
  Trash2,
  X,
  RotateCcw,
  Smartphone,
  Check,
  AlertCircle
} from 'lucide-react';

export const OrderManagementView: React.FC<{ onOpenApprovalDrawer: (id: string) => void }> = ({
  onOpenApprovalDrawer
}) => {
  const {
    orders,
    updateOrderStatus,
    deleteOrder,
    openPrintModal,
    canExportExcel,
    showToast,
    approvalRequests
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [debtFilter, setDebtFilter] = useState<'all' | 'has_debt' | 'paid_full' | 'has_pin'>('all');
  const [timeFilter, setTimeFilter] = useState<'today' | '7days' | 'month' | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Filter logic
  const filteredOrders = orders.filter((order) => {
    const matchSearch =
      order.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery);

    const matchStatus = statusFilter === 'all' || order.status === statusFilter;

    let matchDebt = true;
    if (debtFilter === 'has_debt') matchDebt = order.debtAmount > 0;
    else if (debtFilter === 'paid_full') matchDebt = order.debtAmount === 0;
    else if (debtFilter === 'has_pin') matchDebt = Boolean(order.hasPinOverride);

    return matchSearch && matchStatus && matchDebt;
  });

  // Paginated slice
  const totalItems = filteredOrders.length;
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Calculate Metrics Ribbon
  const totalOrdersCount = filteredOrders.length;
  const totalRevenue = filteredOrders.reduce((s, o) => s + o.totalAmount, 0);
  const totalPaid = filteredOrders.reduce((s, o) => s + o.paidAmount, 0);
  const totalDebt = filteredOrders.reduce((s, o) => s + o.debtAmount, 0);

  // Client-Side CSV/Excel Export
  const exportToExcel = () => {
    if (!canExportExcel) {
      showToast('🔒 Bạn không có quyền xuất dữ liệu! Tính năng chỉ mở cho Quản Trị Viên.');
      return;
    }

    const headers = ['Mã Đơn', 'Ngày Giờ', 'Khách Hàng', 'SĐT', 'Tổng Tiền', 'Đã Trả', 'Còn Nợ', 'HT Thanh Toán', 'Trạng Thái', 'Thu Ngân'];
    const rows = filteredOrders.map((o) => [
      o.code,
      o.createdAt,
      `"${o.customerName}"`,
      o.customerPhone,
      o.totalAmount,
      o.paidAmount,
      o.debtAmount,
      o.paymentMethod,
      o.status,
      o.cashierName
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NEXUS_Orders_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📥 Đã xuất file Excel / CSV danh sách đơn hàng thành công!');
  };

  // Confirm Delete Order
  const handleConfirmDeleteOrder = () => {
    if (!deletingOrder) return;
    deleteOrder(deletingOrder.id);
    showToast(`🗑️ Đã xóa vĩnh viễn đơn hàng: ${deletingOrder.code}`);
    setDeletingOrder(null);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" /> Hoàn thành
          </span>
        );
      case 'shipping':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
            <Truck className="h-3 w-3" /> Đang giao
          </span>
        );
      case 'pending_approval':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
            <Clock className="h-3 w-3" /> Chờ duyệt nợ
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
            <XCircle className="h-3 w-3" /> Đã hủy
          </span>
        );
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200 text-slate-800 dark:text-slate-100">
      {/* 1. METRIC RIBBON */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Tổng Đơn Hàng</span>
          <div className="text-2xl font-mono font-black text-slate-900 dark:text-white mt-1">
            {totalOrdersCount} <span className="text-xs font-normal text-slate-400">đơn</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Tổng Doanh Thu</span>
          <div className="text-2xl font-mono font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {totalRevenue.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-400">đ</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Đã Thực Thu</span>
          <div className="text-2xl font-mono font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {totalPaid.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-400">đ</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-xs">
          <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold uppercase">Còn Nợ / Treo Sổ</span>
          <div className="text-2xl font-mono font-black text-rose-600 dark:text-rose-400 mt-1">
            {totalDebt.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-400">đ</span>
          </div>
        </div>
      </div>

      {/* 2. FILTER & UNIFIED SEARCH TOOLBAR */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-xs flex flex-col md:flex-row gap-3 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã đơn, khách hàng, SĐT..."
            className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Quick Time & Status Filters Grouped */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Debt Status Quick Filter */}
          <select
            value={debtFilter}
            onChange={(e) => {
              setDebtFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 font-semibold focus:outline-none"
          >
            <option value="all">Tất cả thanh toán</option>
            <option value="has_debt">⚠️ Đơn còn nợ tiền</option>
            <option value="paid_full">✅ Đã thanh toán 100%</option>
            <option value="has_pin">🔐 Đơn duyệt qua PIN</option>
          </select>

          {/* Time Filter Segmented Buttons */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            {(['today', '7days', 'month', 'all'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTimeFilter(t);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeFilter === t
                    ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t === 'today' ? 'Hôm nay' : t === '7days' ? '7 ngày' : t === 'month' ? 'Tháng này' : 'Tất cả'}
              </button>
            ))}
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 font-semibold focus:outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="completed">Hoàn thành</option>
            <option value="shipping">Đang giao hàng</option>
            <option value="pending_approval">Chờ duyệt nợ</option>
            <option value="cancelled">Đã hủy</option>
          </select>

          {/* Export Excel Button */}
          {canExportExcel && (
            <button
              onClick={exportToExcel}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-600/20 hover:bg-emerald-100 dark:hover:bg-emerald-600/30 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 text-xs font-semibold transition-all active:scale-95"
              title="Xuất file Excel / CSV trực tiếp từ trình duyệt (0đ Server)"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Xuất Excel</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. DATA LIST: MOBILE CARDS + DESKTOP TABLE */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden">
        {/* Mobile View: Concise High-Value Cards */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {paginatedOrders.length === 0 ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
              Không tìm thấy đơn hàng nào phù hợp bộ lọc.
            </div>
          ) : (
            paginatedOrders.map((order) => {
              const relatedApproval = approvalRequests.find((r) => r.orderCode === order.code);
              return (
                <div key={order.id} className="p-4 space-y-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                        {order.code}
                      </span>
                      {order.hasPinOverride && (
                        <span className="px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-[10px] font-bold">
                          PIN
                        </span>
                      )}
                    </div>
                    <div>{getStatusBadge(order.status)}</div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-200">{order.customerName}</div>
                      <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono">{order.customerPhone}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-slate-400 font-mono">{order.createdAt}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{order.cashierName}</div>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase">Tổng cộng:</span>
                      <div className="font-mono font-black text-slate-900 dark:text-white">
                        {order.totalAmount.toLocaleString('vi-VN')} đ
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase">Còn nợ:</span>
                      <div className="font-mono font-bold">
                        {order.debtAmount > 0 ? (
                          <span className="text-rose-600 dark:text-rose-400">+{order.debtAmount.toLocaleString('vi-VN')} đ</span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400">Đã trả đủ</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openPrintModal('k80', order)}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold flex items-center gap-1 border border-indigo-200 dark:border-indigo-800"
                      >
                        <Receipt className="h-3.5 w-3.5" /> In K80
                      </button>
                      <button
                        onClick={() => openPrintModal('a5', order)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1"
                      >
                        <FileText className="h-3.5 w-3.5" /> A5
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      {order.status === 'pending_approval' && relatedApproval && (
                        <button
                          onClick={() => onOpenApprovalDrawer(relatedApproval.id)}
                          className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300"
                          title="Phòng chat thẩm định"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-indigo-600"
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeletingOrder(order)}
                        className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                        title="Xóa đơn"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-4">Mã Đơn / Ngày Lập</th>
                <th className="p-4">Khách Hàng & Liên Hệ</th>
                <th className="p-4">Phụ Trách</th>
                <th className="p-4 text-right">Tổng Tiền</th>
                <th className="p-4 text-right">Đã Trả</th>
                <th className="p-4 text-right">Còn Nợ</th>
                <th className="p-4 text-center">Trạng Thái</th>
                <th className="p-4 text-center">Thao Tác & In Ấn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 dark:text-slate-500">
                    Không tìm thấy đơn hàng nào phù hợp bộ lọc.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  const relatedApproval = approvalRequests.find((r) => r.orderCode === order.code);
                  return (
                    <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Code & Time */}
                      <td className="p-4">
                        <div className="font-mono font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {order.code}
                          {order.hasPinOverride && (
                            <span className="px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-[10px] font-bold" title="Có can thiệp mã PIN chống bán lỗ">
                              PIN
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{order.createdAt}</div>
                      </td>

                      {/* Customer */}
                      <td className="p-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-200">{order.customerName}</div>
                        <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono">{order.customerPhone}</div>
                      </td>

                      {/* Cashier */}
                      <td className="p-4 text-slate-600 dark:text-slate-400">{order.cashierName}</td>

                      {/* Amounts */}
                      <td className="p-4 text-right font-mono font-black text-slate-900 dark:text-white">
                        {order.totalAmount.toLocaleString('vi-VN')} đ
                      </td>

                      <td className="p-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {order.paidAmount.toLocaleString('vi-VN')} đ
                      </td>

                      <td className="p-4 text-right font-mono font-bold">
                        {order.debtAmount > 0 ? (
                          <span className="text-rose-600 dark:text-rose-400">+{order.debtAmount.toLocaleString('vi-VN')} đ</span>
                        ) : (
                          <span className="text-slate-400">0 đ</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center">
                        <div className="flex justify-center">{getStatusBadge(order.status)}</div>
                      </td>

                      {/* GROUPED ACTION BUTTONS: PRINT GROUP + CRUD GROUP */}
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          {/* Print Actions Group */}
                          <div className="inline-flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 shadow-xs">
                            <button
                              onClick={() => openPrintModal('k80', order)}
                              className="px-2 py-1 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                              title="In hóa đơn cuộn nhiệt K80"
                            >
                              <Receipt className="h-3.5 w-3.5 text-indigo-500" />
                              <span className="hidden sm:inline">K80</span>
                            </button>

                            <div className="h-3 w-px bg-slate-300 dark:bg-slate-700 mx-0.5" />

                            <button
                              onClick={() => openPrintModal('a5', order)}
                              className="px-2 py-1 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                              title="In phiếu xuất kho A5"
                            >
                              <FileText className="h-3.5 w-3.5 text-slate-500" />
                              <span className="hidden sm:inline">A5</span>
                            </button>

                            <div className="h-3 w-px bg-slate-300 dark:bg-slate-700 mx-0.5" />

                            <button
                              onClick={() => openPrintModal('a6', order)}
                              className="px-2 py-1 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                              title="In tem nhãn dán kiện thùng A6"
                            >
                              <Tag className="h-3.5 w-3.5 text-amber-500" />
                              <span className="hidden sm:inline">A6</span>
                            </button>
                          </div>

                          {/* Approval Chat / Actions Group */}
                          <div className="inline-flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 shadow-xs">
                            {/* View Detail */}
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-indigo-600 transition-colors"
                              title="Xem chi tiết đơn hàng"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>

                            {/* Credit Approval Chat (if pending) */}
                            {order.status === 'pending_approval' && relatedApproval && (
                              <button
                                onClick={() => onOpenApprovalDrawer(relatedApproval.id)}
                                className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 transition-colors animate-pulse"
                                title="Mở phòng chat thẩm định duyệt nợ"
                              >
                                <MessageSquare className="h-3.5 w-3.5" />
                              </button>
                            )}

                            <div className="h-3 w-px bg-slate-300 dark:bg-slate-700 mx-0.5" />

                            {/* Delete Order Action (CRUD) */}
                            <button
                              onClick={() => setDeletingOrder(order)}
                              className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-white dark:hover:bg-slate-700 hover:text-rose-700 transition-colors"
                              title="Xóa đơn hàng này khỏi hệ thống"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          pageSizeOptions={[5, 8, 15, 30]}
        />
      </div>

      {/* ================= MODAL: ORDER DETAIL & STATUS CHANGE ================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Chi Tiết Đơn Hàng</span>
                <h3 className="font-bold text-base font-mono">{selectedOrder.code}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* General Info */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <div className="text-slate-500">Khách hàng:</div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">{selectedOrder.customerName}</div>
                <div className="font-mono text-indigo-600 dark:text-indigo-400">{selectedOrder.customerPhone}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <div className="text-slate-500">Thời gian tạo & Thu ngân:</div>
                <div className="font-mono text-slate-900 dark:text-white">{selectedOrder.createdAt}</div>
                <div className="text-slate-600 dark:text-slate-400">NV: {selectedOrder.cashierName}</div>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Danh Sách Mặt Hàng:</div>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 text-[11px]">
                    <tr>
                      <th className="p-2.5">Sản Phẩm</th>
                      <th className="p-2.5 text-center">ĐVT</th>
                      <th className="p-2.5 text-right">SL</th>
                      <th className="p-2.5 text-right">Đơn Giá</th>
                      <th className="p-2.5 text-right">Thành Tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-medium">{item.productName}</td>
                        <td className="p-2.5 text-center font-mono">{item.unitName}</td>
                        <td className="p-2.5 text-right font-mono font-bold">{item.quantity}</td>
                        <td className="p-2.5 text-right font-mono">{item.unitPrice.toLocaleString('vi-VN')}đ</td>
                        <td className="p-2.5 text-right font-mono font-bold">{item.totalPrice.toLocaleString('vi-VN')}đ</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Tổng tiền hàng:</span>
                <span className="font-mono font-bold">{selectedOrder.totalAmount.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>Đã thanh toán ({selectedOrder.paymentMethod}):</span>
                <span className="font-mono">{selectedOrder.paidAmount.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between text-rose-600 dark:text-rose-400 font-bold border-t border-slate-200 dark:border-slate-700 pt-1">
                <span>Còn ghi nợ:</span>
                <span className="font-mono">{selectedOrder.debtAmount.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>

            {/* Update Status Control */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-slate-700 dark:text-slate-300">Cập Nhật Trạng Thái Đơn Hàng:</div>
              <div className="flex flex-wrap gap-2">
                {(['completed', 'shipping', 'cancelled'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, st);
                      setSelectedOrder({ ...selectedOrder, status: st });
                      showToast(`✅ Đã đổi trạng thái đơn sang: ${st}`);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                      selectedOrder.status === st
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'completed' ? 'Hoàn thành' : st === 'shipping' ? 'Đang giao hàng' : 'Đã hủy'}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => {
                  setDeletingOrder(selectedOrder);
                  setSelectedOrder(null);
                }}
                className="text-rose-600 hover:underline text-xs font-semibold flex items-center gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" /> Xóa Đơn Hàng
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openPrintModal('k80', selectedOrder)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold"
                >
                  In Bill
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE ORDER CONFIRMATION ================= */}
      {deletingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-2.5 rounded-full bg-rose-100 dark:bg-rose-900/30">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-base">Xác Nhận Xóa Đơn Hàng</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Hành động này sẽ xóa dữ liệu đơn hàng khỏi hệ thống</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1.5">
              <div>Mã đơn hàng: <strong className="font-mono text-indigo-600 dark:text-indigo-400">{deletingOrder.code}</strong></div>
              <div>Khách hàng: <strong className="text-slate-900 dark:text-white">{deletingOrder.customerName}</strong></div>
              <div>Tổng tiền: <strong className="font-mono text-slate-900 dark:text-white">{deletingOrder.totalAmount.toLocaleString('vi-VN')} đ</strong></div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingOrder(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleConfirmDeleteOrder}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
              >
                Xác Nhận Xóa Đơn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

