"use client";
import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Customer, CustomerTier } from '../../types/erp';
import { Pagination } from '../common/Pagination';
import { MoneyInput } from '../common/MoneyInput';
import { RowActionMenu } from '../common/RowActionMenu';
import {
  Users,
  Search,
  Plus,
  ShieldCheck,
  ShieldAlert,
  Edit2,
  Trash2,
  Phone,
  MapPin,
  X,
  CreditCard,
  Wallet,
  Download,
  LayoutGrid,
  Table as TableIcon,
  CheckCircle2,
  AlertTriangle,
  ArrowDownRight,
  TrendingDown,
  Filter
} from 'lucide-react';

export const CustomerView: React.FC = () => {
  const {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    recordCustomerPayment,
    canExportExcel,
    showToast
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [debtStatusFilter, setDebtStatusFilter] = useState<'all' | 'has_debt' | 'zero_debt'>('all');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Modals state
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCust, setEditingCust] = useState<Customer | null>(null);
  const [deletingCust, setDeletingCust] = useState<Customer | null>(null);

  // Quick Debt Collection Modal state
  const [debtModalCust, setDebtModalCust] = useState<Customer | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'cash' | 'vietqr'>('vietqr');
  const [payNotes, setPayNotes] = useState('');

  // Form State for Create / Edit Customer
  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    phone: string;
    address: string;
    tier: CustomerTier;
    creditLimit: number;
    paymentTermDays: number;
  }>({
    code: '',
    name: '',
    phone: '',
    address: '',
    tier: 'bac',
    creditLimit: 20000000,
    paymentTermDays: 30
  });

  // Filter logic
  const filteredCustomers = customers.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase());

    const isOverLimit = c.creditLimit > 0 && c.currentDebt > c.creditLimit;

    let matchTier = true;
    if (tierFilter === 'all') matchTier = true;
    else if (tierFilter === 'over_limit') matchTier = isOverLimit;
    else matchTier = c.tier === tierFilter;

    let matchDebt = true;
    if (debtStatusFilter === 'has_debt') matchDebt = c.currentDebt > 0;
    else if (debtStatusFilter === 'zero_debt') matchDebt = c.currentDebt === 0;

    return matchSearch && matchTier && matchDebt;
  });

  // Paginated slice
  const totalCustomerItems = filteredCustomers.length;
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Total metrics
  const totalCustomers = customers.length;
  const totalDebt = customers.reduce((s, c) => s + c.currentDebt, 0);
  const totalOverLimit = customers.filter((c) => c.creditLimit > 0 && c.currentDebt > c.creditLimit).length;

  // Open Create Customer Modal
  const handleOpenCreateCustomer = () => {
    setEditingCust(null);
    const newCode = `KH-${Math.floor(1000 + Math.random() * 9000)}`;
    setFormData({
      code: newCode,
      name: '',
      phone: '',
      address: '',
      tier: 'bac',
      creditLimit: 20000000,
      paymentTermDays: 30
    });
    setIsCustomerModalOpen(true);
  };

  // Open Edit Customer Modal
  const handleOpenEditCustomer = (c: Customer) => {
    setEditingCust(c);
    setFormData({
      code: c.code,
      name: c.name,
      phone: c.phone,
      address: c.address,
      tier: c.tier,
      creditLimit: c.creditLimit,
      paymentTermDays: c.paymentTermDays ?? 30
    });
    setIsCustomerModalOpen(true);
  };

  // Submit Create or Edit Customer
  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('⚠️ Vui lòng nhập tên khách hàng / đại lý!');
      return;
    }

    if (editingCust) {
      // Update
      const updated: Customer = {
        ...editingCust,
        code: formData.code,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        tier: formData.tier,
        creditLimit: formData.creditLimit,
        paymentTermDays: formData.paymentTermDays
      };
      updateCustomer(updated);
      showToast(`✅ Đã cập nhật thông tin khách hàng: ${updated.name}`);
    } else {
      // Create
      const newCust: Customer = {
        id: `cust_${Date.now()}`,
        code: formData.code,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        tier: formData.tier,
        creditLimit: formData.creditLimit,
        paymentTermDays: formData.paymentTermDays,
        currentDebt: 0,
        historicalRevenue: 0,
        debtAging: {
          within30: 0,
          days31to60: 0,
          days61to90: 0,
          over90: 0
        }
      };
      addCustomer(newCust);
      showToast(`🎉 Đã thêm mới khách hàng: ${newCust.name}`);
    }

    setIsCustomerModalOpen(false);
  };

  // Confirm Delete Customer
  const handleConfirmDelete = () => {
    if (!deletingCust) return;
    if (deletingCust.currentDebt > 0) {
      showToast(`⚠️ Cảnh báo: ${deletingCust.name} vẫn còn dư nợ ${deletingCust.currentDebt.toLocaleString('vi-VN')}đ! Vui lòng thu hết nợ trước khi xóa.`);
      return;
    }
    deleteCustomer(deletingCust.id);
    showToast(`🗑️ Đã xóa khách hàng: ${deletingCust.name}`);
    setDeletingCust(null);
  };

  // Open Quick Debt Collection Modal
  const handleOpenDebtPayment = (c: Customer) => {
    setDebtModalCust(c);
    setPayAmount(c.currentDebt > 0 ? c.currentDebt : 1000000);
    setPayMethod('vietqr');
    setPayNotes(`Thu công nợ khách hàng ${c.name} (${c.code})`);
  };

  // Submit Debt Collection
  const handleSubmitDebtPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!debtModalCust) return;
    if (payAmount <= 0) {
      showToast('⚠️ Vui lòng nhập số tiền thu hợp lệ!');
      return;
    }

    recordCustomerPayment(debtModalCust.id, payAmount, payMethod === 'vietqr' ? 'Chuyển khoản VietQR' : 'Tiền mặt', payNotes);
    showToast(`💰 Đã ghi nhận thu nợ ${payAmount.toLocaleString('vi-VN')}đ từ ${debtModalCust.name}`);
    setDebtModalCust(null);
  };

  // Export Customers to CSV
  const handleExportCustomers = () => {
    if (!canExportExcel) {
      showToast('🔒 Chỉ Quản trị viên (Admin) mới có quyền xuất dữ liệu khách hàng!');
      return;
    }

    const headers = ['Mã KH', 'Tên Đại Lý / Khách Hàng', 'SĐT', 'Địa Chỉ', 'Phân Hạng', 'Hạn Mức Nợ (VNĐ)', 'Dư Nợ Hiện Tại (VNĐ)', 'Hạn Nợ (Ngày)', 'Doanh Số Lịch Sử (VNĐ)'];
    const rows = filteredCustomers.map((c) => [
      c.code,
      `"${c.name}"`,
      c.phone,
      `"${c.address}"`,
      c.tier,
      c.creditLimit,
      c.currentDebt,
      c.paymentTermDays,
      c.historicalRevenue
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NEXUS_Danh_Sach_Khach_Hang_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📥 Đã xuất file dữ liệu khách hàng thành công!');
  };

  const getTierBadge = (tier: CustomerTier) => {
    switch (tier) {
      case 'kim_cuong':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
            Kim Cương
          </span>
        );
      case 'vang':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-500/30">
            Hạng Vàng
          </span>
        );
      case 'bac':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/30">
            Hạng Bạc
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            Hạng Đồng
          </span>
        );
    }
  };

  return (
    <div className="p-6 space-y-6 w-full animate-in fade-in duration-200 text-slate-800 dark:text-slate-100">
      {/* 1. TOP HEADER & UNIFIED ACTION TOOLBAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-1 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Quản Lý Khách Hàng, Đại Lý & Credit Guard (CRUD)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Quản lý danh sách đối tác, kiểm soát trần tín dụng tự động và thu nợ dòng tiền tức thì
          </p>
        </div>

        {/* PRIMARY ACTION BUTTON GROUP */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Group 1: CRUD & Export Buttons */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200 dark:border-slate-700/80 shadow-xs">
            <button
              onClick={handleOpenCreateCustomer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
              title="Thêm đối tác / khách hàng mới vào hệ thống"
            >
              <Plus className="h-4 w-4" />
              <span>Thêm Khách Hàng</span>
            </button>

            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1.5" />

            <button
              onClick={handleExportCustomers}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 text-xs font-semibold transition-all active:scale-95"
              title="Xuất danh sách khách hàng ra Excel/CSV"
            >
              <Download className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
              <span className="hidden sm:inline">Xuất Excel</span>
            </button>
          </div>

          {/* Group 2: View Mode Switcher (Table vs Card) */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Chế độ xem dạng Bảng chi tiết"
            >
              <TableIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'card'
                  ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Chế độ xem dạng Thẻ trực quan"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Tổng Số Khách Hàng</span>
          <div className="text-2xl font-mono font-black text-slate-900 dark:text-white mt-1">
            {totalCustomers} <span className="text-xs font-normal text-slate-500">đối tác</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Tổng Dư Nợ Thị Trường</span>
          <div className="text-2xl font-mono font-black text-rose-600 dark:text-rose-400 mt-1">
            {totalDebt.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-500">đ</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-xs">
          <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold uppercase">Cảnh Báo Vượt Trần Nợ</span>
          <div className="text-2xl font-mono font-black text-amber-600 dark:text-amber-400 mt-1">
            {totalOverLimit} <span className="text-xs font-normal text-slate-500">đại lý chạm trần</span>
          </div>
        </div>
      </div>

      {/* 3. FILTER & SEARCH TOOLBAR */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center bg-white dark:bg-slate-900/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 md:max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm theo tên khách hàng, mã KH, số điện thoại, địa chỉ..."
            className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Debt Filter Dropdown & Tier Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={debtStatusFilter}
            onChange={(e) => {
              setDebtStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 font-semibold focus:outline-none"
          >
            <option value="all">Tất cả trạng thái nợ</option>
            <option value="has_debt">⚠️ Đang còn nợ (&gt;0đ)</option>
            <option value="zero_debt">✅ Không có dư nợ (0đ)</option>
          </select>

          {/* Tier Segmented Filter Buttons */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 p-0.5 border border-slate-200 dark:border-slate-700/60 overflow-x-auto">
            {[
              { id: 'all', label: 'Tất cả hạng' },
              { id: 'kim_cuong', label: 'Kim Cương' },
              { id: 'vang', label: 'Vàng' },
              { id: 'bac', label: 'Bạc' },
              { id: 'dong', label: 'Đồng' },
              { id: 'over_limit', label: '⚠️ Vượt Trần' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTierFilter(t.id);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  tierFilter === t.id
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. MAIN DATA DISPLAY: TABLE VIEW */}
      {viewMode === 'table' ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-4">Khách Hàng & Mã KH</th>
                  <th className="p-4">Liên Hệ & Địa Chỉ</th>
                  <th className="p-4 text-center">Phân Hạng</th>
                  <th className="p-4 text-right">Hạn Mức Tín Dụng</th>
                  <th className="p-4 text-right">Dư Nợ Hiện Tại</th>
                  <th className="p-4 text-center">Tỷ Lệ Chạm Trần</th>
                  <th className="p-4 text-center">Thao Tác (CRUD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {paginatedCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 dark:text-slate-500">
                      Không tìm thấy khách hàng nào phù hợp với bộ lọc tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  paginatedCustomers.map((cust) => {
                    const isOverLimit = cust.creditLimit > 0 && cust.currentDebt > cust.creditLimit;
                    const usagePercent = cust.creditLimit > 0 ? (cust.currentDebt / cust.creditLimit) * 100 : 0;

                    return (
                      <tr key={cust.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        {/* Name & Code */}
                        <td className="p-4">
                          <div className="font-bold text-slate-900 dark:text-white text-sm">{cust.name}</div>
                          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                            Mã: {cust.code} • Hạn nợ: {cust.paymentTermDays} ngày
                          </div>
                        </td>

                        {/* Phone & Address */}
                        <td className="p-4">
                          <div className="font-mono text-slate-700 dark:text-slate-300">{cust.phone}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs">{cust.address}</div>
                        </td>

                        {/* Tier Badge */}
                        <td className="p-4 text-center">
                          {getTierBadge(cust.tier)}
                        </td>

                        {/* Credit Limit */}
                        <td className="p-4 text-right font-mono font-bold text-slate-900 dark:text-slate-200">
                          {cust.creditLimit.toLocaleString('vi-VN')} đ
                        </td>

                        {/* Current Debt */}
                        <td className="p-4 text-right font-mono font-bold">
                          <span className={isOverLimit ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'}>
                            {cust.currentDebt.toLocaleString('vi-VN')} đ
                          </span>
                        </td>

                        {/* Limit Progress */}
                        <td className="p-4">
                          <div className="w-32 mx-auto space-y-1">
                            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${
                                  usagePercent > 100 ? 'bg-rose-500' : usagePercent > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(100, usagePercent)}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-500">
                              <span>{usagePercent.toFixed(0)}%</span>
                              {isOverLimit && <span className="text-rose-500 font-bold">Vượt trần</span>}
                            </div>
                          </div>
                        </td>

                        {/* CRUD ACTION BUTTON GROUP */}
                        <td className="p-4 text-center">
                          <RowActionMenu
                            label="Thao tác"
                            items={[
                              {
                                id: `pay-${cust.id}`,
                                label: 'Ghi nhận thu nợ',
                                icon: Wallet,
                                variant: 'success',
                                onClick: () => handleOpenDebtPayment(cust),
                              },
                              {
                                id: `edit-${cust.id}`,
                                label: 'Chỉnh sửa thông tin',
                                icon: Edit2,
                                variant: 'indigo',
                                onClick: () => handleOpenEditCustomer(cust),
                              },
                              {
                                id: `delete-${cust.id}`,
                                label: 'Xóa khách hàng',
                                icon: Trash2,
                                variant: 'danger',
                                divider: true,
                                onClick: () => setDeletingCust(cust),
                              },
                            ]}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={totalCustomerItems}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            pageSizeOptions={[6, 12, 24, 48]}
          />
        </div>
      ) : (
        /* 5. MAIN DATA DISPLAY: CARD GRID VIEW */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedCustomers.length === 0 ? (
              <div className="col-span-full p-8 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                Không tìm thấy khách hàng nào phù hợp với bộ lọc tìm kiếm.
              </div>
            ) : (
              paginatedCustomers.map((cust) => {
                const isOverLimit = cust.creditLimit > 0 && cust.currentDebt > cust.creditLimit;
                const usagePercent = cust.creditLimit > 0 ? (cust.currentDebt / cust.creditLimit) * 100 : 0;

                return (
                  <div
                    key={cust.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm space-y-3 flex flex-col justify-between transition-colors"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 uppercase font-bold">{cust.code}</span>
                          <h3 className="font-bold text-slate-900 dark:text-white text-base mt-0.5">{cust.name}</h3>
                        </div>
                        {getTierBadge(cust.tier)}
                      </div>

                      <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-indigo-500" />
                          <span className="font-mono font-medium">{cust.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{cust.address}</span>
                        </div>
                      </div>
                    </div>

                    {/* Credit Status Box */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Hạn Mức Trần:</span>
                        <strong className="text-slate-900 dark:text-white font-mono">{cust.creditLimit.toLocaleString('vi-VN')} đ</strong>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Dư Nợ Hiện Tại:</span>
                        <strong className={`font-mono font-bold ${isOverLimit ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {cust.currentDebt.toLocaleString('vi-VN')} đ
                        </strong>
                      </div>

                      {/* Progress bar */}
                      {cust.creditLimit > 0 && (
                        <div className="space-y-1">
                          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                usagePercent > 100 ? 'bg-rose-500' : usagePercent > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, usagePercent)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>Đã chạm trần: {usagePercent.toFixed(0)}%</span>
                            {isOverLimit && <span className="text-rose-500 font-bold">Vượt hạn mức nợ!</span>}
                          </div>
                        </div>
                      )}

                      {/* Card Actions Group */}
                      <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                        <span className="text-xs text-slate-500 font-medium">Thao tác hồ sơ:</span>
                        <RowActionMenu
                          label="Thao tác"
                          items={[
                            {
                              id: `pay-${cust.id}`,
                              label: 'Ghi nhận thu nợ',
                              icon: Wallet,
                              variant: 'success',
                              onClick: () => handleOpenDebtPayment(cust),
                            },
                            {
                              id: `edit-${cust.id}`,
                              label: 'Chỉnh sửa thông tin',
                              icon: Edit2,
                              variant: 'indigo',
                              onClick: () => handleOpenEditCustomer(cust),
                            },
                            {
                              id: `delete-${cust.id}`,
                              label: 'Xóa khách hàng',
                              icon: Trash2,
                              variant: 'danger',
                              divider: true,
                              onClick: () => setDeletingCust(cust),
                            },
                          ]}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Card Grid Pagination */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden">
            <Pagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={totalCustomerItems}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              pageSizeOptions={[6, 12, 24, 48]}
            />
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT CUSTOMER (CRUD) ================= */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                {editingCust ? `Cập Nhật Khách Hàng: ${editingCust.name}` : 'Thêm Khách Hàng / Đại Lý Mới'}
              </h3>
              <button
                onClick={() => setIsCustomerModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Mã Khách Hàng</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Phân Hạng Tín Dụng</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value as CustomerTier })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
                  >
                    <option value="kim_cuong">Hạng Kim Cương</option>
                    <option value="vang">Hạng Vàng</option>
                    <option value="bac">Hạng Bạc</option>
                    <option value="dong">Hạng Đồng</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Tên Đại Lý / Khách Hàng *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Công ty TNHH Thương Mại Minh Phát..."
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Số Điện Thoại</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0912 345 678"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Thời Hạn Nợ (Số ngày)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.paymentTermDays}
                    onChange={(e) => setFormData({ ...formData, paymentTermDays: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Địa Chỉ Giao Hàng & Trụ Sở</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Số nhà, đường, phường, quận/huyện, tỉnh thành..."
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    Hạn Mức Tín Dụng Trần (Credit Limit)
                  </label>
                  <span className="text-[10px] text-indigo-700 dark:text-indigo-400">Chặn xuất đơn khi vượt trần</span>
                </div>
                <MoneyInput
                  value={formData.creditLimit}
                  onChange={(val) => setFormData({ ...formData, creditLimit: val })}
                  placeholder="0"
                  suffix="đ"
                  className="w-full rounded-xl bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-500/50 px-3 py-2 text-sm font-mono font-bold text-indigo-700 dark:text-indigo-300"
                />
                <div className="text-[10px] text-slate-500">Nhập 0 nếu chỉ bán tiền mặt, không cấp hạn mức nợ gối đầu.</div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md active:scale-95 transition-all"
                >
                  {editingCust ? 'Lưu Thay Đổi' : 'Tạo Khách Hàng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: QUICK DEBT PAYMENT ================= */}
      {debtModalCust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Phiếu Thu Công Nợ Đại Lý
              </h3>
              <button
                onClick={() => setDebtModalCust(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1">
              <div>Khách hàng: <strong className="text-slate-900 dark:text-white">{debtModalCust.name}</strong> ({debtModalCust.code})</div>
              <div>Dư nợ hiện tại: <strong className="font-mono text-rose-600 dark:text-rose-400 font-bold">{debtModalCust.currentDebt.toLocaleString('vi-VN')} đ</strong></div>
            </div>

            <form onSubmit={handleSubmitDebtPayment} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Số Tiền Thu Nợ (VNĐ) *</label>
                <MoneyInput
                  required
                  value={payAmount}
                  onChange={(val) => setPayAmount(val)}
                  placeholder="0"
                  suffix="đ"
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-emerald-300 dark:border-emerald-500/50 px-3 py-2.5 text-base font-mono font-black text-emerald-600 dark:text-emerald-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Phương Thức Thanh Toán</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayMethod('vietqr')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      payMethod === 'vietqr'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Chuyển khoản VietQR (0đ)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayMethod('cash')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      payMethod === 'cash'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Thu Tiền Mặt
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Nội Dung / Ghi Chú</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setDebtModalCust(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md active:scale-95 transition-all"
                >
                  Xác Nhận Thu Nợ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE CUSTOMER CONFIRMATION ================= */}
      {deletingCust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-2.5 rounded-full bg-rose-100 dark:bg-rose-900/30">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-base">Xác Nhận Xóa Khách Hàng</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Hành động này sẽ xóa đối tác khỏi danh bạ</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1.5">
              <div>Đại lý: <strong className="text-slate-900 dark:text-white">{deletingCust.name}</strong></div>
              <div>Mã khách hàng: <strong className="font-mono text-indigo-600 dark:text-indigo-400">{deletingCust.code}</strong></div>
              <div>Dư nợ hiện tại: <strong className="font-mono text-rose-600 dark:text-rose-400">{deletingCust.currentDebt.toLocaleString('vi-VN')} đ</strong></div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingCust(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

