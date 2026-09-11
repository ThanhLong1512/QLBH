"use client";
import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Pagination } from '../common/Pagination';
import {
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  Search
} from 'lucide-react';

export const ApprovalsBoardView: React.FC<{ onOpenDrawer: (id: string) => void }> = ({ onOpenDrawer }) => {
  const { approvalRequests } = useERP();
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const filteredRequests = approvalRequests.filter((r) => {
    if (filter === 'pending' && r.status !== 'pending') return false;
    if (filter === 'resolved' && r.status === 'pending') return false;
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.orderCode.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.customerPhone.includes(q) ||
        r.requestedBy.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filteredRequests.length / pageSize) || 1;
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleFilterChange = (t: 'all' | 'pending' | 'resolved') => {
    setFilter(t);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  return (
    <div className="p-6 space-y-6 w-full animate-in fade-in duration-200 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Hội Đồng Thẩm Định & Thảo Luận Duyệt Nợ Đơn Hàng
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Kênh thảo luận nội bộ thời gian thực giữa Thu Ngân & Ban Lãnh Đạo về cấp tín dụng vượt trần
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5 text-xs font-semibold">
          {(['all', 'pending', 'resolved'] as const).map((t) => (
            <button
              key={t}
              onClick={() => handleFilterChange(t)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === t
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t === 'all' ? 'Tất cả' : t === 'pending' ? 'Chờ Duyệt' : 'Đã Giải Quyết'}
            </button>
          ))}
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-white dark:bg-slate-900/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Tìm theo mã đơn, khách hàng, số điện thoại, người gửi..."
            className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 text-right">
          Tổng cộng: <strong className="text-slate-900 dark:text-white">{filteredRequests.length}</strong> yêu cầu
        </div>
      </div>

      {/* Requests Grid */}
      {paginatedRequests.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-slate-400 dark:text-slate-500">
          Không có yêu cầu duyệt hạn mức nào phù hợp với điều kiện tìm kiếm.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedRequests.map((req) => (
            <div
              key={req.id}
              onClick={() => onOpenDrawer(req.id)}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-md p-5 shadow-xs cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300">
                    {req.orderCode}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      req.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                        : req.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 animate-pulse'
                    }`}
                  >
                    {req.status === 'approved' ? 'Đã duyệt' : req.status === 'rejected' ? 'Bác bỏ' : 'Đang chờ duyệt'}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{req.customerName}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">SĐT: {req.customerPhone}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Hạn mức cho phép:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{req.creditLimit.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Dư nợ hiện tại:</span>
                    <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold">{req.currentDebt.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex justify-between text-rose-600 dark:text-rose-400 font-semibold pt-1 border-t border-slate-200 dark:border-slate-800">
                    <span>Vượt trần yêu cầu:</span>
                    <span className="font-mono font-bold">+{req.excessAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 italic bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/60">
                  &ldquo;{req.reason}&rdquo;
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  {req.messages.length} tin nhắn trao đổi
                </span>
                <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold group-hover:translate-x-1 transition-transform">
                  Mở thảo luận <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={filteredRequests.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />
    </div>
  );
};

