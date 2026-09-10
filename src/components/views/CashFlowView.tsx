"use client";
import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Pagination } from '../common/Pagination';
import { CashTransaction } from '../../types/erp';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  X,
  Download,
  Calendar,
  User,
  FileText,
  Building2,
  CreditCard,
  QrCode,
  Printer,
  DollarSign,
  Landmark,
  CheckCircle2
} from 'lucide-react';

export const CashFlowView: React.FC = () => {
  const {
    transactions,
    addTransaction,
    customers,
    suppliers,
    employees,
    currentShift,
    canExportExcel,
    showToast
  } = useERP();

  const [filterType, setFilterType] = useState<'all' | 'thu' | 'chi'>('all');
  const [filterFund, setFilterFund] = useState<'all' | 'cash' | 'bank'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [printTransaction, setPrintTransaction] = useState<CashTransaction | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Form states
  const [type, setType] = useState<'thu' | 'chi'>('thu');
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState('Bán hàng');
  const [fundType, setFundType] = useState<'cash' | 'bank'>('cash');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer' | 'vietqr'>('cash');
  const [partnerType, setPartnerType] = useState<'customer' | 'supplier' | 'employee' | 'other'>('customer');
  const [partnerId, setPartnerId] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [person, setPerson] = useState('Kế toán / Thu ngân');
  const [referenceCode, setReferenceCode] = useState('');
  const [description, setDescription] = useState('');

  // Extract unique categories for filter
  const categoriesList = ['all', ...Array.from(new Set(transactions.map((t) => t.category)))];

  // Filtered flows with search, fund, and category filters
  const filteredFlows = transactions.filter((f) => {
    const matchType = filterType === 'all' || f.type === filterType;
    const matchFund = filterFund === 'all' || (f.fundType || 'cash') === filterFund;
    const matchCategory = selectedCategory === 'all' || f.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      f.code.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q) ||
      f.person.toLowerCase().includes(q) ||
      (f.partnerName && f.partnerName.toLowerCase().includes(q)) ||
      (f.referenceCode && f.referenceCode.toLowerCase().includes(q)) ||
      f.category.toLowerCase().includes(q);

    return matchType && matchFund && matchCategory && matchSearch;
  });

  // Global metrics
  const totalIncome = transactions.filter((f) => f.type === 'thu').reduce((s, f) => s + f.amount, 0);
  const totalExpense = transactions.filter((f) => f.type === 'chi').reduce((s, f) => s + f.amount, 0);
  const netCash = totalIncome - totalExpense;

  const cashIncome = transactions.filter((f) => f.type === 'thu' && (f.fundType || 'cash') === 'cash').reduce((s, f) => s + f.amount, 0);
  const cashExpense = transactions.filter((f) => f.type === 'chi' && (f.fundType || 'cash') === 'cash').reduce((s, f) => s + f.amount, 0);
  const netCashFund = cashIncome - cashExpense;

  const bankIncome = transactions.filter((f) => f.type === 'thu' && f.fundType === 'bank').reduce((s, f) => s + f.amount, 0);
  const bankExpense = transactions.filter((f) => f.type === 'chi' && f.fundType === 'bank').reduce((s, f) => s + f.amount, 0);
  const netBankFund = bankIncome - bankExpense;

  // Pagination slicing
  const totalItems = filteredFlows.length;
  const paginatedFlows = filteredFlows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePartnerSelect = (pId: string) => {
    setPartnerId(pId);
    if (partnerType === 'customer') {
      const c = customers.find(item => item.id === pId);
      if (c) {
        setPartnerName(c.name);
        if (type === 'thu' && !description) {
          setDescription(`Thu nợ khách hàng ${c.name} (${c.phone})`);
        }
      }
    } else if (partnerType === 'supplier') {
      const s = suppliers.find(item => item.id === pId);
      if (s) {
        setPartnerName(s.name);
        if (type === 'chi' && !description) {
          setDescription(`Thanh toán công nợ nhà cung cấp ${s.name}`);
        }
      }
    } else if (partnerType === 'employee') {
      const emp = employees.find(item => item.id === pId);
      if (emp) {
        setPartnerName(emp.name);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      showToast('⚠️ Vui lòng nhập số tiền hợp lệ (> 0 VNĐ)!');
      return;
    }

    addTransaction({
      type,
      amount,
      category,
      date: new Date().toLocaleString('vi-VN'),
      person,
      description,
      shiftId: currentShift?.id,
      fundType,
      partnerType,
      partnerId: partnerId || undefined,
      partnerName: partnerName || undefined,
      referenceCode: referenceCode.trim() || undefined,
      paymentMethod
    });

    showToast(`✅ Đã lập phiếu ${type === 'thu' ? 'Thu' : 'Chi'} ${amount.toLocaleString('vi-VN')} đ thành công!`);
    setShowModal(false);
    // Reset form
    setAmount(0);
    setDescription('');
    setReferenceCode('');
    setPartnerId('');
    setPartnerName('');
  };

  const exportCashFlow = () => {
    if (!canExportExcel) {
      showToast('🔒 Bạn không có quyền xuất dữ liệu! Chỉ dành cho Quản Trị Viên.');
      return;
    }
    const headers = [
      'Mã Phiếu',
      'Ngày Giờ',
      'Loại Nghiệp Vụ',
      'Quỹ Tiền',
      'Phương Thức',
      'Đối Tượng',
      'Danh Mục',
      'Diễn Giải',
      'Số Tiền (VNĐ)',
      'Người Lập',
      'Mã Tham Chiếu'
    ];
    const rows = filteredFlows.map((f) => [
      f.code,
      `"${f.date}"`,
      f.type === 'thu' ? 'Phiếu Thu' : 'Phiếu Chi',
      (f.fundType || 'cash') === 'cash' ? 'Tiền Mặt' : 'Tài Khoản NH',
      f.paymentMethod || 'Tiền mặt',
      `"${f.partnerName || ''}"`,
      `"${f.category}"`,
      `"${f.description.replace(/"/g, '""')}"`,
      f.amount,
      `"${f.person}"`,
      f.referenceCode || ''
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `So_Quy_Thu_Chi_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📥 Đã xuất sổ quỹ thu chi ra file CSV thành công!');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200 text-slate-800 dark:text-slate-100">
      {/* HEADER & ACTION BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Quản Lý Thu Chi & Sổ Quỹ Tiền Tệ
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Giám sát dòng tiền mặt tại két, tài khoản ngân hàng và công nợ đối tác tự động
          </p>
        </div>

        <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200 dark:border-slate-700 shadow-xs">
          <button
            onClick={() => {
              setType('thu');
              setCategory('Thu nợ khách hàng');
              setShowModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
          >
            <ArrowDownLeft className="h-4 w-4" />
            <span>+ Lập Phiếu Thu</span>
          </button>

          <button
            onClick={() => {
              setType('chi');
              setCategory('Nhập hàng nhà cung cấp');
              setShowModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95 ml-1.5"
          >
            <ArrowUpRight className="h-4 w-4" />
            <span>- Lập Phiếu Chi</span>
          </button>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-2" />

          <button
            onClick={exportCashFlow}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 text-xs font-semibold transition-all"
            title="Xuất file Excel/CSV"
          >
            <Download className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* 4 METRIC STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TỔNG QUỸ TIỀN MẶT */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Quỹ Tiền Mặt (Két)</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-mono font-black text-slate-900 dark:text-white mt-2">
            {netCashFund.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-400">đ</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Thu: +{cashIncome.toLocaleString('vi-VN')} | Chi: -{cashExpense.toLocaleString('vi-VN')}
          </div>
        </div>

        {/* TỔNG TIỀN GỬI NGÂN HÀNG */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">Tài Khoản Ngân Hàng</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Landmark className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-mono font-black text-blue-600 dark:text-blue-400 mt-2">
            {netBankFund.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-400">đ</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Chuyển khoản / VietQR qua ngân hàng
          </div>
        </div>

        {/* TỔNG THU & TỔNG CHI */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Tổng Thu Luỹ Kế</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-mono font-black text-emerald-600 dark:text-emerald-400 mt-2">
            +{totalIncome.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-400">đ</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Tổng chi: -{totalExpense.toLocaleString('vi-VN')} đ
          </div>
        </div>

        {/* TỒN QUỸ RÒNG TỔNG HỢP */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Tồn Quỹ Toàn Hệ Thống</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-mono font-black mt-2 ${netCash >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {netCash.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-400">đ</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Số dư lưu động khả dụng tức thời
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
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
            placeholder="Tìm theo mã phiếu, người nộp/nhận, diễn giải, tham chiếu..."
            className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filter Selects */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Fund Filter */}
          <select
            value={filterFund}
            onChange={(e) => {
              setFilterFund(e.target.value as any);
              setCurrentPage(1);
            }}
            className="rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 font-semibold focus:outline-none"
          >
            <option value="all">Tất cả nguồn quỹ</option>
            <option value="cash">💵 Tiền mặt tại két</option>
            <option value="bank">🏛️ Tài khoản ngân hàng</option>
          </select>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value as any);
              setCurrentPage(1);
            }}
            className="rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 font-semibold focus:outline-none"
          >
            <option value="all">Thu & Chi</option>
            <option value="thu">Chỉ Phiếu Thu (+)</option>
            <option value="chi">Chỉ Phiếu Chi (-)</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 font-semibold focus:outline-none max-w-[150px] truncate"
          >
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'Tất cả danh mục' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE & LIST VIEW CONTAINER */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden">
        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-4">Mã Phiếu</th>
                <th className="p-4">Ngày Giờ</th>
                <th className="p-4">Loại & Nguồn Quỹ</th>
                <th className="p-4">Đối Tượng Nộp/Nhận</th>
                <th className="p-4">Danh Mục & Diễn Giải</th>
                <th className="p-4 text-right">Số Tiền (VNĐ)</th>
                <th className="p-4">Người Lập</th>
                <th className="p-4 text-center">Chứng Từ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedFlows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 dark:text-slate-500">
                    Không tìm thấy phiếu thu/chi nào phù hợp.
                  </td>
                </tr>
              ) : (
                paginatedFlows.map((t) => {
                  const isThu = t.type === 'thu';
                  const isBank = t.fundType === 'bank';

                  return (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">{t.code}</div>
                        {t.referenceCode && (
                          <div className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400">
                            Ref: {t.referenceCode}
                          </div>
                        )}
                      </td>

                      <td className="p-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {t.date}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isThu
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                            }`}
                          >
                            {isThu ? 'Thu Tiền' : 'Chi Tiền'}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {isBank ? '🏛️ Ngân hàng' : '💵 Tiền mặt'}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        {t.partnerName ? (
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">{t.partnerName}</div>
                            <div className="text-[10px] text-slate-400 capitalize">
                              {t.partnerType === 'customer'
                                ? 'Khách hàng'
                                : t.partnerType === 'supplier'
                                ? 'Nhà cung cấp'
                                : t.partnerType === 'employee'
                                ? 'Nhân viên'
                                : 'Khác'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Vãng lai / Nội bộ</span>
                        )}
                      </td>

                      <td className="p-4 max-w-xs">
                        <div className="font-semibold text-indigo-600 dark:text-indigo-400 text-[11px]">
                          {t.category}
                        </div>
                        <div className="text-slate-700 dark:text-slate-300 truncate mt-0.5">
                          {t.description}
                        </div>
                      </td>

                      <td className="p-4 text-right font-mono">
                        <span
                          className={`text-sm font-bold ${
                            isThu ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isThu ? '+' : '-'}{t.amount.toLocaleString('vi-VN')} đ
                        </span>
                      </td>

                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        {t.person}
                      </td>

                      <td className="p-4 text-center">
                        <button
                          onClick={() => setPrintTransaction(t)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                          title="In phiếu Thu/Chi"
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

        {/* MOBILE CARD VIEW */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {paginatedFlows.length === 0 ? (
            <div className="p-6 text-center text-slate-400 dark:text-slate-500">
              Không tìm thấy phiếu nào.
            </div>
          ) : (
            paginatedFlows.map((t) => {
              const isThu = t.type === 'thu';
              return (
                <div key={t.id} className="p-4 space-y-2.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                        {t.code}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{t.date}</div>
                    </div>
                    <span
                      className={`text-sm font-mono font-bold ${
                        isThu ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isThu ? '+' : '-'}{t.amount.toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">{t.category}</span>
                      <span className="text-slate-400">
                        {t.fundType === 'bank' ? '🏛️ Ngân hàng' : '💵 Tiền mặt'}
                      </span>
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 font-medium">{t.description}</div>
                    {t.partnerName && (
                      <div className="text-slate-500 text-[11px]">
                        Đối tác: <strong>{t.partnerName}</strong>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => setPrintTransaction(t)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1"
                    >
                      <Printer className="h-3.5 w-3.5" /> In Phiếu
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* PAGINATION */}
        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          pageSizeOptions={[10, 20, 50]}
        />
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
              <div className="flex items-center gap-2">
                <div
                  className={`p-2 rounded-xl ${
                    type === 'thu'
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600'
                      : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600'
                  }`}
                >
                  {type === 'thu' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {type === 'thu' ? 'Lập Phiếu Thu Tiền' : 'Lập Phiếu Chi Tiền'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Ghi sổ quỹ dòng tiền và tự động cập nhật công nợ đối tác liên quan
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
              {/* Type Switcher */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Loại Nghiệp Vụ</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setType('thu');
                      setCategory('Thu nợ khách hàng');
                    }}
                    className={`py-2 rounded-xl font-bold border transition-all text-center ${
                      type === 'thu'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    + Phiếu Thu Tiền
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setType('chi');
                      setCategory('Nhập hàng nhà cung cấp');
                    }}
                    className={`py-2 rounded-xl font-bold border transition-all text-center ${
                      type === 'chi'
                        ? 'bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    - Phiếu Chi Tiền
                  </button>
                </div>
              </div>

              {/* Fund Selection */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Nguồn Quỹ & Hình Thức</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFundType('cash');
                      setPaymentMethod('cash');
                    }}
                    className={`py-2 px-3 rounded-xl font-medium border text-left flex items-center gap-2 transition-all ${
                      fundType === 'cash'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Wallet className="h-4 w-4" />
                    <span>Quỹ Tiền Mặt (Két)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFundType('bank');
                      setPaymentMethod('bank_transfer');
                    }}
                    className={`py-2 px-3 rounded-xl font-medium border text-left flex items-center gap-2 transition-all ${
                      fundType === 'bank'
                        ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Landmark className="h-4 w-4" />
                    <span>Tài Khoản Ngân Hàng</span>
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Số Tiền (VNĐ) *</label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="1000"
                  value={amount || ''}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-base font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              {/* Partner Type & Selector */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Đối Tượng Nộp / Nhận Tiền</label>
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {[
                    { id: 'customer', label: 'Khách hàng' },
                    { id: 'supplier', label: 'Nhà CC' },
                    { id: 'employee', label: 'Nhân viên' },
                    { id: 'other', label: 'Khác' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setPartnerType(p.id as any);
                        setPartnerId('');
                        setPartnerName('');
                      }}
                      className={`py-1 rounded-lg text-center font-medium transition-all ${
                        partnerType === p.id
                          ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {partnerType === 'customer' && (
                  <select
                    value={partnerId}
                    onChange={(e) => handlePartnerSelect(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
                  >
                    <option value="">-- Chọn khách hàng giảm công nợ --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} - Nợ hiện tại: {c.currentDebt.toLocaleString('vi-VN')} đ
                      </option>
                    ))}
                  </select>
                )}

                {partnerType === 'supplier' && (
                  <select
                    value={partnerId}
                    onChange={(e) => handlePartnerSelect(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
                  >
                    <option value="">-- Chọn nhà cung cấp thanh toán nợ --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} - Đang nợ NCC: {s.currentDebt.toLocaleString('vi-VN')} đ
                      </option>
                    ))}
                  </select>
                )}

                {partnerType === 'employee' && (
                  <select
                    value={partnerId}
                    onChange={(e) => handlePartnerSelect(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
                  >
                    <option value="">-- Chọn nhân viên --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.role})
                      </option>
                    ))}
                  </select>
                )}

                {partnerType === 'other' && (
                  <input
                    type="text"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder="Tên cá nhân / đơn vị nộp hoặc nhận tiền..."
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
                  />
                )}
              </div>

              {/* Category & Reference Code */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Danh Mục Thu/Chi</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
                  >
                    {type === 'thu' ? (
                      <>
                        <option value="Bán hàng">Bán hàng</option>
                        <option value="Thu nợ khách hàng">Thu nợ khách hàng</option>
                        <option value="Hoàn ứng nội bộ">Hoàn ứng nội bộ</option>
                        <option value="Thu dịch vụ kỹ thuật">Thu dịch vụ kỹ thuật</option>
                        <option value="Thu khác">Thu khác</option>
                      </>
                    ) : (
                      <>
                        <option value="Chi phí vận hành">Chi phí vận hành</option>
                        <option value="Nhập hàng nhà cung cấp">Nhập hàng nhà cung cấp</option>
                        <option value="Tiền điện / nước / mạng">Tiền điện / nước / mạng</option>
                        <option value="Lương & thưởng nhân sự">Lương & thưởng nhân sự</option>
                        <option value="Chi phí vận chuyển">Chi phí vận chuyển</option>
                        <option value="Chi khác">Chi khác</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Mã Tham Chiếu (Ref Code)</label>
                  <input
                    type="text"
                    value={referenceCode}
                    onChange={(e) => setReferenceCode(e.target.value)}
                    placeholder="VD: HD-2026-001, UNC-889"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Nội Dung Diễn Giải *</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="VD: Thu nợ đợt 1 theo hợp đồng cung cấp thiết bị..."
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md active:scale-95 transition-all"
                >
                  Xác Nhận Lập Phiếu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT RECEIPT MODAL */}
      {printTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white text-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-300 space-y-4 my-8">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-black text-base text-indigo-700 tracking-wide uppercase">
                  NEXUS ERP - {printTransaction.type === 'thu' ? 'PHIẾU THU TIỀN' : 'PHIẾU CHI TIỀN'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Hệ Thống Kế Toán & Quản Trị Tài Chính Doanh Nghiệp
                </p>
              </div>
              <button
                onClick={() => setPrintTransaction(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 print:hidden"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono">
                <div>
                  <span className="text-slate-500">Số Phiếu: </span>
                  <strong>{printTransaction.code}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Ngày Lập: </span>
                  <span>{printTransaction.date}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div>
                  <span className="text-slate-500">Họ và tên người {printTransaction.type === 'thu' ? 'nộp' : 'nhận'}: </span>
                  <strong>{printTransaction.partnerName || 'Vãng lai'}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Nguồn quỹ: </span>
                  <span>{printTransaction.fundType === 'bank' ? 'Tài khoản Ngân hàng' : 'Quỹ Tiền mặt (Két)'}</span>
                </div>
                <div>
                  <span className="text-slate-500">Hình thức thanh toán: </span>
                  <span className="font-medium capitalize">{printTransaction.paymentMethod || 'Tiền mặt'}</span>
                </div>
                <div>
                  <span className="text-slate-500">Lý do {printTransaction.type === 'thu' ? 'thu' : 'chi'}: </span>
                  <span>{printTransaction.description}</span>
                </div>
                {printTransaction.referenceCode && (
                  <div>
                    <span className="text-slate-500">Chứng từ gốc kèm theo: </span>
                    <strong className="font-mono">{printTransaction.referenceCode}</strong>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center bg-indigo-50 p-3 rounded-xl border border-indigo-200 font-mono">
                <span className="font-bold text-indigo-900">
                  Số Tiền Bằng Số:
                </span>
                <strong className="text-indigo-700 text-base font-black">
                  {printTransaction.amount.toLocaleString('vi-VN')} VNĐ
                </strong>
              </div>

              {/* Signatures */}
              <div className="pt-4 border-t border-slate-200 grid grid-cols-3 text-center text-[10px]">
                <div>
                  <p className="font-semibold text-slate-700">Người Lập Phiếu</p>
                  <p className="text-slate-400">(Ký, họ tên)</p>
                  <div className="h-12" />
                  <p className="font-medium text-slate-800">{printTransaction.person}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-700">Thủ Quỹ</p>
                  <p className="text-slate-400">(Ký, họ tên)</p>
                  <div className="h-12" />
                  <p className="font-medium text-slate-800">Thủ quỹ két</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-700">Người {printTransaction.type === 'thu' ? 'Nộp Tiền' : 'Nhận Tiền'}</p>
                  <p className="text-slate-400">(Ký, họ tên)</p>
                  <div className="h-12" />
                  <p className="font-medium text-slate-800">{printTransaction.partnerName || 'Khách hàng'}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 print:hidden">
              <button
                type="button"
                onClick={() => setPrintTransaction(null)}
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
                <span>In Phiếu (A5 / K80)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

