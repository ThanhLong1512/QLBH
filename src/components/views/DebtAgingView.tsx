"use client";
import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Customer } from '../../types/erp';
import { Pagination } from '../common/Pagination';
import { RowActionMenu } from '../common/RowActionMenu';
import {
  TrendingDown,
  AlertCircle,
  Clock,
  Phone,
  MessageCircle,
  DollarSign,
  Download,
  Search,
  CheckCircle2,
  X,
  CreditCard,
  Banknote,
  Send,
  Wallet,
  Filter,
  User
} from 'lucide-react';

export const DebtAgingView: React.FC = () => {
  const { customers, recordCustomerPayment, canExportExcel, showToast } = useERP();
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'over90' | 'days61to90' | 'within60'>('all');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [collectModalCust, setCollectModalCust] = useState<Customer | null>(null);
  const [collectAmount, setCollectAmount] = useState<number>(0);
  const [collectMethod, setCollectMethod] = useState<'cash' | 'vietqr'>('vietqr');
  const [collectNotes, setCollectNotes] = useState('');

  // Calculate Aging Aggregates
  const totalWithin30 = customers.reduce((sum, c) => sum + c.debtAging.within30, 0);
  const totalDays31to60 = customers.reduce((sum, c) => sum + c.debtAging.days31to60, 0);
  const totalDays61to90 = customers.reduce((sum, c) => sum + c.debtAging.days61to90, 0);
  const totalOver90 = customers.reduce((sum, c) => sum + c.debtAging.over90, 0);
  const grandTotalDebt = totalWithin30 + totalDays31to60 + totalDays61to90 + totalOver90;

  // Filter customers with debt and risk tier
  const debtCustomers = customers
    .filter((c) => c.currentDebt > 0)
    .filter((c) => {
      if (riskFilter === 'over90') return c.debtAging.over90 > 0;
      if (riskFilter === 'days61to90') return c.debtAging.days61to90 > 0;
      if (riskFilter === 'within60') return c.debtAging.within30 > 0 || c.debtAging.days31to60 > 0;
      return true;
    })
    .filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery)
    );

  // Pagination
  const totalItems = debtCustomers.length;
  const paginatedCustomers = debtCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSendReminder = (cust: Customer) => {
    const text = `Kính gửi ${cust.name}, NEXUS ERP xin thông báo quý khách có dư nợ công nợ tổng cộng: ${cust.currentDebt.toLocaleString('vi-VN')} đ (trong đó có nợ quá hạn). Quý khách vui lòng kiểm tra và hỗ trợ đối soát thanh toán. Xin cảm ơn!`;
    navigator.clipboard.writeText(text);
    showToast(`📲 Đã tạo lời nhắc nợ gửi Zalo/SMS cho ${cust.name}: "Đã sao chép nội dung vào Clipboard"`);
  };

  const handleOpenCollectModal = (cust: Customer) => {
    setCollectModalCust(cust);
    setCollectAmount(cust.currentDebt);
    setCollectNotes('Thanh toán công nợ theo đợt');
  };

  const handleConfirmCollect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectModalCust || collectAmount <= 0) return;

    recordCustomerPayment(
      collectModalCust.id,
      collectAmount,
      collectMethod === 'vietqr' ? 'Chuyển khoản VietQR' : 'Tiền mặt',
      collectNotes
    );
    showToast(`💰 Đã ghi nhận thu nợ ${collectAmount.toLocaleString('vi-VN')}đ từ ${collectModalCust.name}`);
    setCollectModalCust(null);
  };

  const exportAgingToExcel = () => {
    if (!canExportExcel) {
      showToast('🔒 Chỉ Quản Trị Viên mới có quyền xuất file Excel báo cáo tuổi nợ!');
      return;
    }
    const headers = ['Mã KH', 'Tên Đại Lý', 'SĐT', 'Hạn Mức', 'Tổng Dư Nợ', '0-30 Ngày (Trong Hạn)', '31-60 Ngày (Nhẹ)', '61-90 Ngày (Nguy Cơ)', '> 90 Ngày (Nợ Xấu)'];
    const rows = debtCustomers.map((c) => [
      c.code,
      `"${c.name}"`,
      c.phone,
      c.creditLimit,
      c.currentDebt,
      c.debtAging.within30,
      c.debtAging.days31to60,
      c.debtAging.days61to90,
      c.debtAging.over90
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NEXUS_Bao_Cao_Tuoi_No_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📥 Đã xuất báo cáo phân tích tuổi nợ thành công!');
  };

  return (
    <div className="p-6 space-y-6 w-full animate-in fade-in duration-200 text-slate-800 dark:text-slate-100">
      {/* Header & Grouped Action Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Báo Cáo Phân Tích Tuổi Nợ (Debt Aging Report)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Quản trị rủi ro tín dụng B2B/B2C, khoanh vùng nợ xấu & tự động nhắc nợ
          </p>
        </div>

        {/* Grouped Export Button */}
        {canExportExcel && (
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 shadow-xs">
            <button
              onClick={exportAgingToExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all active:scale-95"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Xuất Báo Cáo Excel</span>
            </button>
          </div>
        )}
      </div>

      {/* 4 Aging KPI Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tier 1: 0 - 30 days */}
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-950/20 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Trong Hạn (0 - 30 Ngày)
            </span>
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-mono font-black text-slate-900 dark:text-white">
              {totalWithin30.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-500">đ</span>
            </div>
            <div className="mt-2 text-xs text-emerald-700 dark:text-emerald-400">
              Chiếm {grandTotalDebt > 0 ? ((totalWithin30 / grandTotalDebt) * 100).toFixed(1) : 0}% tổng dư nợ
            </div>
          </div>
        </div>

        {/* Tier 2: 31 - 60 days */}
        <div className="rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/70 dark:bg-amber-950/20 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Quá Hạn Nhẹ (31 - 60 Ngày)
            </span>
            <span className="h-3 w-3 rounded-full bg-amber-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-mono font-black text-amber-800 dark:text-amber-300">
              {totalDays31to60.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-500">đ</span>
            </div>
            <div className="mt-2 text-xs text-amber-700 dark:text-amber-400">
              Chiếm {grandTotalDebt > 0 ? ((totalDays31to60 / grandTotalDebt) * 100).toFixed(1) : 0}% tổng dư nợ
            </div>
          </div>
        </div>

        {/* Tier 3: 61 - 90 days */}
        <div className="rounded-2xl border border-orange-200 dark:border-orange-500/30 bg-orange-50/70 dark:bg-orange-950/20 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider">
              Cảnh Báo (61 - 90 Ngày)
            </span>
            <span className="h-3 w-3 rounded-full bg-orange-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-mono font-black text-orange-800 dark:text-orange-300">
              {totalDays61to90.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-500">đ</span>
            </div>
            <div className="mt-2 text-xs text-orange-700 dark:text-orange-400">
              Chiếm {grandTotalDebt > 0 ? ((totalDays61to90 / grandTotalDebt) * 100).toFixed(1) : 0}% tổng dư nợ
            </div>
          </div>
        </div>

        {/* Tier 4: > 90 days */}
        <div className="rounded-2xl border border-rose-200 dark:border-rose-500/30 bg-rose-50/70 dark:bg-rose-950/20 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
              Nợ Xấu Khó Đòi (&gt; 90 Ngày)
            </span>
            <span className="h-3 w-3 rounded-full bg-rose-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-mono font-black text-rose-700 dark:text-rose-400">
              {totalOver90.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-500">đ</span>
            </div>
            <div className="mt-2 text-xs text-rose-700 dark:text-rose-400 font-bold">
              Chiếm {grandTotalDebt > 0 ? ((totalOver90 / grandTotalDebt) * 100).toFixed(1) : 0}% (Cần xử lý)
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-white dark:bg-slate-900/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm theo tên đại lý, mã KH, số điện thoại..."
            className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Risk Filter Segmented */}
        <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => {
              setRiskFilter('all');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              riskFilter === 'all'
                ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Tất cả nợ
          </button>
          <button
            onClick={() => {
              setRiskFilter('over90');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              riskFilter === 'over90'
                ? 'bg-white dark:bg-rose-600 text-rose-700 dark:text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Nợ xấu (&gt; 90 ngày)
          </button>
          <button
            onClick={() => {
              setRiskFilter('days61to90');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              riskFilter === 'days61to90'
                ? 'bg-white dark:bg-orange-600 text-orange-700 dark:text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Cảnh báo (61-90 ngày)
          </button>
        </div>
      </div>

      {/* Debt Aging Table & Mobile Cards */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden">
        {/* DESKTOP TABLE VIEW */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-4">Khách Hàng & Liên Hệ</th>
                <th className="p-4 text-right">Hạn Mức</th>
                <th className="p-4 text-right">Tổng Dư Nợ</th>
                <th className="p-4 text-right">0 - 30 Ngày</th>
                <th className="p-4 text-right">31 - 60 Ngày</th>
                <th className="p-4 text-right">61 - 90 Ngày</th>
                <th className="p-4 text-right">&gt; 90 Ngày (Xấu)</th>
                <th className="p-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 dark:text-slate-500">
                    Không có khách hàng nào có dư nợ cần theo dõi.
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">{cust.name}</div>
                      <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                        {cust.code} • {cust.phone}
                      </div>
                    </td>

                    <td className="p-4 text-right font-mono text-slate-600 dark:text-slate-300">
                      {cust.creditLimit.toLocaleString('vi-VN')} đ
                    </td>

                    <td className="p-4 text-right font-mono font-black text-rose-600 dark:text-rose-400 text-sm">
                      {cust.currentDebt.toLocaleString('vi-VN')} đ
                    </td>

                    <td className="p-4 text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      {cust.debtAging.within30 > 0 ? `${cust.debtAging.within30.toLocaleString('vi-VN')} đ` : '-'}
                    </td>

                    <td className="p-4 text-right font-mono text-amber-600 dark:text-amber-400 font-semibold">
                      {cust.debtAging.days31to60 > 0 ? `${cust.debtAging.days31to60.toLocaleString('vi-VN')} đ` : '-'}
                    </td>

                    <td className="p-4 text-right font-mono text-orange-600 dark:text-orange-400 font-semibold">
                      {cust.debtAging.days61to90 > 0 ? `${cust.debtAging.days61to90.toLocaleString('vi-VN')} đ` : '-'}
                    </td>

                    <td className="p-4 text-right font-mono text-rose-600 dark:text-rose-400 font-bold">
                      {cust.debtAging.over90 > 0 ? `${cust.debtAging.over90.toLocaleString('vi-VN')} đ` : '-'}
                    </td>

                    {/* Grouped Action Buttons */}
                    <td className="p-4 text-center">
                      <RowActionMenu
                        label="Thao tác"
                        items={[
                          {
                            id: `collect-${cust.id}`,
                            label: 'Ghi nhận thu nợ',
                            icon: Wallet,
                            variant: 'success',
                            onClick: () => handleOpenCollectModal(cust),
                          },
                          {
                            id: `remind-${cust.id}`,
                            label: 'Gửi SMS/Zalo nhắc nợ',
                            icon: Send,
                            variant: 'indigo',
                            onClick: () => handleSendReminder(cust),
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARD VIEW */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {paginatedCustomers.length === 0 ? (
            <div className="p-6 text-center text-slate-400 dark:text-slate-500">
              Không có khách hàng nào có dư nợ cần theo dõi.
            </div>
          ) : (
            paginatedCustomers.map((cust) => (
              <div key={cust.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{cust.name}</h3>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                      {cust.code} • {cust.phone}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Tổng Dư Nợ</span>
                    <div className="font-mono font-black text-rose-600 dark:text-rose-400 text-sm">
                      {cust.currentDebt.toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                </div>

                {/* Aging Breakdown Chips */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30">
                    <div className="text-[10px] text-emerald-700 dark:text-emerald-400">0 - 30 ngày:</div>
                    <div className="font-bold text-emerald-800 dark:text-emerald-300">
                      {cust.debtAging.within30 > 0 ? `${cust.debtAging.within30.toLocaleString('vi-VN')} đ` : '-'}
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30">
                    <div className="text-[10px] text-amber-700 dark:text-amber-400">31 - 60 ngày:</div>
                    <div className="font-bold text-amber-800 dark:text-amber-300">
                      {cust.debtAging.days31to60 > 0 ? `${cust.debtAging.days31to60.toLocaleString('vi-VN')} đ` : '-'}
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/30">
                    <div className="text-[10px] text-orange-700 dark:text-orange-400">61 - 90 ngày:</div>
                    <div className="font-bold text-orange-800 dark:text-orange-300">
                      {cust.debtAging.days61to90 > 0 ? `${cust.debtAging.days61to90.toLocaleString('vi-VN')} đ` : '-'}
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/30">
                    <div className="text-[10px] text-rose-700 dark:text-rose-400">&gt; 90 ngày (Xấu):</div>
                    <div className="font-bold text-rose-800 dark:text-rose-300">
                      {cust.debtAging.over90 > 0 ? `${cust.debtAging.over90.toLocaleString('vi-VN')} đ` : '-'}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800/60">
                  <RowActionMenu
                    label="Thao tác thu/nhắc nợ"
                    items={[
                      {
                        id: `collect-mob-${cust.id}`,
                        label: 'Ghi nhận thu nợ',
                        icon: Wallet,
                        variant: 'success',
                        onClick: () => handleOpenCollectModal(cust),
                      },
                      {
                        id: `remind-mob-${cust.id}`,
                        label: 'Gửi SMS/Zalo nhắc nợ',
                        icon: Send,
                        variant: 'indigo',
                        onClick: () => handleSendReminder(cust),
                      },
                    ]}
                  />
                </div>
              </div>
            ))
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

      {/* Collect Modal */}
      {collectModalCust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Phiếu Thu Công Nợ Tuổi Nợ
              </h3>
              <button
                onClick={() => setCollectModalCust(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
              <div>Khách hàng: <strong className="text-slate-900 dark:text-white">{collectModalCust.name}</strong></div>
              <div>Tổng nợ cần thanh toán: <strong className="font-mono text-rose-600 dark:text-rose-400">{collectModalCust.currentDebt.toLocaleString('vi-VN')} đ</strong></div>
            </div>

            <form onSubmit={handleConfirmCollect} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Số Tiền Thu (VNĐ) *</label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="1000"
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Phương Thức Thanh Toán</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCollectMethod('vietqr')}
                    className={`p-2.5 rounded-xl border text-xs font-bold ${
                      collectMethod === 'vietqr'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Chuyển Khoản VietQR
                  </button>
                  <button
                    type="button"
                    onClick={() => setCollectMethod('cash')}
                    className={`p-2.5 rounded-xl border text-xs font-bold ${
                      collectMethod === 'cash'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Tiền Mặt
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Ghi Chú Thu Nợ</label>
                <input
                  type="text"
                  value={collectNotes}
                  onChange={(e) => setCollectNotes(e.target.value)}
                  placeholder="VD: Khách chuyển khoản Techcombank đợt 1..."
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCollectModalCust(null)}
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
    </div>
  );
};

