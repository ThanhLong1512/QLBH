"use client";
import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import { Supplier } from '../../types/erp';
import { Pagination } from '../common/Pagination';
import {
  Truck,
  Building2,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Download,
  Phone,
  Mail,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  ArrowUpRight,
  X,
  Building,
  FileText
} from 'lucide-react';

export const SupplierView: React.FC = () => {
  const {
    suppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    recordSupplierPayment,
    canExportExcel,
    showToast
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [debtFilter, setDebtFilter] = useState<'all' | 'has_debt' | 'zero_debt'>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Supplier CRUD Modal
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Payment Modal
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedSupplierForPay, setSelectedSupplierForPay] = useState<Supplier | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'bank_transfer' | 'cash'>('bank_transfer');
  const [payNotes, setPayNotes] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    taxId: '',
    category: 'Điện Máy',
    paymentTermsDays: 30,
    bankName: 'Vietcombank',
    bankAccount: '',
    bankAccountName: '',
    status: 'active' as 'active' | 'inactive',
    notes: ''
  });

  // Extract unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(suppliers.map(s => s.category))).filter(Boolean);
  }, [suppliers]);

  // Filtered suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(sup => {
      const matchSearch =
        sup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sup.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sup.phone.includes(searchQuery) ||
        sup.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sup.taxId && sup.taxId.includes(searchQuery));

      const matchCategory = categoryFilter === 'all' || sup.category === categoryFilter;

      let matchDebt = true;
      if (debtFilter === 'has_debt') matchDebt = sup.currentDebt > 0;
      if (debtFilter === 'zero_debt') matchDebt = sup.currentDebt === 0;

      return matchSearch && matchCategory && matchDebt;
    });
  }, [suppliers, searchQuery, categoryFilter, debtFilter]);

  // Paginated suppliers
  const paginatedSuppliers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSuppliers.slice(start, start + pageSize);
  }, [filteredSuppliers, currentPage, pageSize]);

  // Statistics
  const stats = useMemo(() => {
    const total = suppliers.length;
    const totalDebt = suppliers.reduce((sum, s) => sum + s.currentDebt, 0);
    const withDebtCount = suppliers.filter(s => s.currentDebt > 0).length;
    const totalPurchased = suppliers.reduce((sum, s) => sum + s.totalPurchased, 0);
    return { total, totalDebt, withDebtCount, totalPurchased };
  }, [suppliers]);

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setFormData({
      code: `NCC-${String(suppliers.length + 1).padStart(3, '0')}`,
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      taxId: '',
      category: categories[0] || 'Điện Máy',
      paymentTermsDays: 30,
      bankName: 'Vietcombank - CN TP.HCM',
      bankAccount: '',
      bankAccountName: '',
      status: 'active',
      notes: ''
    });
    setIsSupplierModalOpen(true);
  };

  const handleOpenEdit = (sup: Supplier) => {
    setEditingSupplier(sup);
    setFormData({
      code: sup.code,
      name: sup.name,
      contactPerson: sup.contactPerson,
      phone: sup.phone,
      email: sup.email,
      address: sup.address,
      taxId: sup.taxId,
      category: sup.category,
      paymentTermsDays: sup.paymentTermsDays,
      bankName: sup.bankName || '',
      bankAccount: sup.bankAccount || '',
      bankAccountName: sup.bankAccountName || '',
      status: sup.status,
      notes: sup.notes || ''
    });
    setIsSupplierModalOpen(true);
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      showToast('⚠️ Vui lòng nhập đầy đủ tên và mã nhà cung cấp');
      return;
    }

    const payload: Supplier = {
      id: editingSupplier ? editingSupplier.id : `sup-${Date.now()}`,
      code: formData.code.toUpperCase(),
      name: formData.name.trim(),
      contactPerson: formData.contactPerson.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      taxId: formData.taxId.trim(),
      category: formData.category,
      currentDebt: editingSupplier ? editingSupplier.currentDebt : 0,
      paymentTermsDays: Number(formData.paymentTermsDays) || 30,
      totalPurchased: editingSupplier ? editingSupplier.totalPurchased : 0,
      bankName: formData.bankName,
      bankAccount: formData.bankAccount,
      bankAccountName: formData.bankAccountName,
      status: formData.status,
      notes: formData.notes.trim()
    };

    if (editingSupplier) {
      updateSupplier(payload);
    } else {
      addSupplier(payload);
    }
    setIsSupplierModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa nhà cung cấp "${name}"?`)) {
      deleteSupplier(id);
    }
  };

  const handleOpenPay = (sup: Supplier) => {
    setSelectedSupplierForPay(sup);
    setPayAmount(sup.currentDebt);
    setPayMethod('bank_transfer');
    setPayNotes(`Thanh toán tiền hàng cho ${sup.name}`);
    setIsPayModalOpen(true);
  };

  const handleConfirmPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierForPay) return;
    if (payAmount <= 0) {
      showToast('⚠️ Số tiền thanh toán phải lớn hơn 0');
      return;
    }

    recordSupplierPayment(selectedSupplierForPay.id, payAmount, payMethod, payNotes);
    setIsPayModalOpen(false);
  };

  const exportExcel = () => {
    const csvContent = [
      ['Mã NCC', 'Tên Nhà Cung Cấp', 'Người Liên Hệ', 'Số Điện Thoại', 'Email', 'MST', 'Ngành Hàng', 'Công Nợ Phải Trả', 'Hạn Nợ (Ngày)', 'Tổng Mua Lũy Kế', 'Ngân Hàng', 'Số TK'].join(','),
      ...suppliers.map(s =>
        [
          `"${s.code}"`,
          `"${s.name}"`,
          `"${s.contactPerson}"`,
          `"${s.phone}"`,
          `"${s.email}"`,
          `"${s.taxId}"`,
          `"${s.category}"`,
          s.currentDebt,
          s.paymentTermsDays,
          s.totalPurchased,
          `"${s.bankName || ''}"`,
          `"${s.bankAccount || ''}"`
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Danh_Sach_Nha_Cung_Cap_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast('📥 Đã xuất file danh sách nhà cung cấp thành công!');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Quản Lý Nhà Cung Cấp & Công Nợ Mua Hàng
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Theo dõi nhà phân phối, hợp đồng nguyên tắc, công nợ gối đầu phải trả & lập phiếu chi đối soát
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {canExportExcel && (
            <button
              id="export-suppliers-btn"
              onClick={exportExcel}
              className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              Xuất Danh Sách
            </button>
          )}

          <button
            id="create-supplier-btn"
            onClick={handleOpenAdd}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Thêm Nhà Cung Cấp Mới
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Tổng Nhà Cung Cấp</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</span>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{categories.length} nhóm hàng</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Tổng Nợ Phải Trả NCC</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {stats.totalDebt.toLocaleString('vi-VN')} đ
            </span>
            <span className="text-xs text-rose-600 bg-rose-500/10 px-1.5 py-0.5 rounded font-medium">
              {stats.withDebtCount} NCC đang nợ
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">NCC Đã Tất Toán Nợ</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.total - stats.withDebtCount}
            </span>
            <span className="text-xs text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">0đ công nợ</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Tổng Mua Hàng Lũy Kế</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {(stats.totalPurchased / 1000000000).toFixed(2)} tỷ đ
            </span>
            <span className="text-[10px] text-slate-400">Doanh số nhập</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, mã NCC, SĐT, mã số thuế hoặc người liên hệ..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Ngành hàng:</span>
          </div>
          <select
            value={categoryFilter}
            onChange={e => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">Tất cả ngành hàng ({suppliers.length})</option>
            {categories.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={debtFilter}
            onChange={e => {
              setDebtFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">Tất cả trạng thái nợ</option>
            <option value="has_debt">Đang có công nợ ({stats.withDebtCount})</option>
            <option value="zero_debt">Không còn nợ</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold">
                <th className="py-3 px-4">Nhà Cung Cấp & Mã</th>
                <th className="py-3 px-4">Người Đại Diện & SĐT</th>
                <th className="py-3 px-4">Địa Chỉ & MST</th>
                <th className="py-3 px-4 text-right">Công Nợ Phải Trả</th>
                <th className="py-3 px-4 text-center">Hạn Nợ Gối Đầu</th>
                <th className="py-3 px-4 text-right">Tổng Mua Lũy Kế</th>
                <th className="py-3 px-4">Tài Khoản Ngân Hàng</th>
                <th className="py-3 px-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {paginatedSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Building2 className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    Không tìm thấy nhà cung cấp nào phù hợp
                  </td>
                </tr>
              ) : (
                paginatedSuppliers.map(sup => {
                  const hasDebt = sup.currentDebt > 0;

                  return (
                    <tr
                      key={sup.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Name & Code */}
                      <td className="py-3 px-4">
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white block group-hover:text-indigo-600 transition-colors">
                            {sup.name}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                              {sup.code}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {sup.category}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Person & Phone */}
                      <td className="py-3 px-4">
                        <div className="text-[11px] space-y-0.5">
                          <span className="font-medium text-slate-800 dark:text-slate-200 block">
                            {sup.contactPerson}
                          </span>
                          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[10px]">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {sup.phone}
                          </span>
                        </div>
                      </td>

                      {/* Address & Tax ID */}
                      <td className="py-3 px-4">
                        <div className="text-[11px] max-w-xs space-y-0.5">
                          <span className="text-slate-600 dark:text-slate-300 block truncate" title={sup.address}>
                            {sup.address}
                          </span>
                          {sup.taxId && (
                            <span className="font-mono text-[10px] text-slate-400 block">
                              MST: {sup.taxId}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Current Debt */}
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`font-bold text-xs inline-block px-2 py-0.5 rounded-full ${
                            hasDebt
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {sup.currentDebt.toLocaleString('vi-VN')} đ
                        </span>
                      </td>

                      {/* Payment Terms */}
                      <td className="py-3 px-4 text-center">
                        <span className="text-slate-600 dark:text-slate-300 font-medium text-[11px]">
                          {sup.paymentTermsDays} ngày
                        </span>
                      </td>

                      {/* Total Purchased */}
                      <td className="py-3 px-4 text-right">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                          {sup.totalPurchased.toLocaleString('vi-VN')} đ
                        </span>
                      </td>

                      {/* Bank Info */}
                      <td className="py-3 px-4">
                        {sup.bankAccount ? (
                          <div className="text-[10px] space-y-0.5">
                            <span className="font-medium text-slate-800 dark:text-slate-200 block">
                              {sup.bankName}
                            </span>
                            <span className="font-mono text-indigo-600 dark:text-indigo-400 block">
                              STK: {sup.bankAccount}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[10px]">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {hasDebt && (
                            <button
                              id={`pay-supplier-${sup.id}`}
                              onClick={() => handleOpenPay(sup)}
                              title="Chi trả công nợ cho NCC"
                              className="px-2 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-colors"
                            >
                              Trả Nợ
                            </button>
                          )}
                          <button
                            id={`edit-supplier-${sup.id}`}
                            onClick={() => handleOpenEdit(sup)}
                            title="Sửa thông tin NCC"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`delete-supplier-${sup.id}`}
                            onClick={() => handleDelete(sup.id, sup.name)}
                            title="Xóa NCC"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredSuppliers.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemName="nhà cung cấp"
          className="border-t border-slate-200 dark:border-slate-800"
        />
      </div>

      {/* Add / Edit Supplier Modal */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-6 py-4 backdrop-blur">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                {editingSupplier ? 'Chỉnh Sửa Nhà Cung Cấp' : 'Thêm Nhà Cung Cấp Mới'}
              </h3>
              <button
                onClick={() => setIsSupplierModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mã Nhà Cung Cấp *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono uppercase"
                    placeholder="VD: NCC-006"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ngành Hàng Cung Ứng *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    placeholder="VD: Điện Máy, Hóa Mỹ Phẩm..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tên Doanh Nghiệp / Nhà Cung Cấp *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  placeholder="VD: Công Ty TNHH Phân Phối Điện Tử ABC"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Người Liên Hệ / Đại Diện *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    placeholder="VD: Nguyễn Văn A (Kinh Doanh)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Số Điện Thoại Hotline *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    placeholder="VD: 028.3821.1111"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Đặt Hàng
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    placeholder="VD: b2b@supplier.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Địa Chỉ Trụ Sở / Kho Hàng
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    placeholder="VD: Tầng 12, Tòa nhà Bitexco, Q.1, TP.HCM"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mã Số Thuế (MST)
                  </label>
                  <input
                    type="text"
                    value={formData.taxId}
                    onChange={e => setFormData({ ...formData, taxId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                    placeholder="VD: 0301111928"
                  />
                </div>
              </div>

              {/* Payment terms & Bank */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  Kỳ Hạn Công Nợ & Thông Tin Ngân Hàng
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Kỳ Hạn Nợ Gối Đầu (Ngày)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.paymentTermsDays}
                      onChange={e => setFormData({ ...formData, paymentTermsDays: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Ngân Hàng & Chi Nhánh
                    </label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      placeholder="VD: Vietcombank - CN TP.HCM"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Số Tài Khoản Nhận Tiền
                    </label>
                    <input
                      type="text"
                      value={formData.bankAccount}
                      onChange={e => setFormData({ ...formData, bankAccount: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-indigo-600"
                      placeholder="VD: 0071000889988"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ghi Chú Hợp Đồng / Điều Khoản Cung Ứng
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  placeholder="Ghi chú chiết khấu, ngày đối soát hàng tháng..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                >
                  {editingSupplier ? 'Cập Nhật NCC' : 'Lưu Nhà Cung Cấp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Debt Modal */}
      {isPayModalOpen && selectedSupplierForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Chi Trả Tiền Hàng Cho Nhà Cung Cấp
              </h3>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5 text-xs">
              <p className="font-semibold text-slate-900 dark:text-white">
                {selectedSupplierForPay.name}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Nợ hiện tại phải trả:</span>
                <span className="font-bold text-rose-600 text-sm">
                  {selectedSupplierForPay.currentDebt.toLocaleString('vi-VN')} đ
                </span>
              </div>
              {selectedSupplierForPay.bankAccount && (
                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span>Chuyển khoản đến: {selectedSupplierForPay.bankName} - STK: </span>
                  <span className="font-mono font-bold text-indigo-600">{selectedSupplierForPay.bankAccount}</span>
                </div>
              )}
            </div>

            <form onSubmit={handleConfirmPay} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Số Tiền Chi Trả (VNĐ) *
                </label>
                <input
                  type="number"
                  required
                  min={1000}
                  max={selectedSupplierForPay.currentDebt}
                  value={payAmount}
                  onChange={e => setPayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-bold text-emerald-600 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phương Thức Chi Tiền
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center justify-center p-2.5 rounded-lg border cursor-pointer text-xs font-medium ${
                      payMethod === 'bank_transfer'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payMethod"
                      value="bank_transfer"
                      checked={payMethod === 'bank_transfer'}
                      onChange={() => setPayMethod('bank_transfer')}
                      className="sr-only"
                    />
                    Chuyển Khoản Ngân Hàng
                  </label>

                  <label
                    className={`flex items-center justify-center p-2.5 rounded-lg border cursor-pointer text-xs font-medium ${
                      payMethod === 'cash'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payMethod"
                      value="cash"
                      checked={payMethod === 'cash'}
                      onChange={() => setPayMethod('cash')}
                      className="sr-only"
                    />
                    Tiền Mặt Tại Quỹ
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nội Dung Chi / Ghi Chú
                </label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={e => setPayNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  placeholder="Ghi chú phiếu chi..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Xác Nhận Chi Trả
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

