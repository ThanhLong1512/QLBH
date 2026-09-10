"use client";
import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { X, Send, ShieldCheck, ShieldAlert, Clock, AlertTriangle, CheckCircle2, UserCheck, MessageSquare } from 'lucide-react';

interface Props {
  requestId: string | null;
  onClose: () => void;
}

export const CreditApprovalDrawer: React.FC<Props> = ({ requestId, onClose }) => {
  const { approvalRequests, resolveCreditApproval, addApprovalMessage, role } = useERP();
  const [replyText, setReplyText] = useState('');
  const [decisionNote, setDecisionNote] = useState('');

  if (!requestId) return null;

  const request = approvalRequests.find(r => r.id === requestId);
  if (!request) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    addApprovalMessage(request.id, replyText.trim());
    setReplyText('');
  };

  const handleApprove = () => {
    resolveCreditApproval(request.id, true, decisionNote);
    onClose();
  };

  const handleReject = () => {
    resolveCreditApproval(request.id, false, decisionNote);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl text-slate-800 dark:text-slate-100">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              request.status === 'approved'
                ? 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30'
                : request.status === 'rejected'
                ? 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30'
                : 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30'
            }`}>
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Thẩm Định & Duyệt Nợ Đơn Hàng</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  request.status === 'approved'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40'
                    : request.status === 'rejected'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40'
                }`}>
                  {request.status === 'approved' ? 'Đã duyệt' : request.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{request.orderCode} • {request.requestedAt}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Overview Metric strip */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Khách hàng yêu cầu:</span>
              <div className="text-sm font-bold text-slate-900 dark:text-white">{request.customerName}</div>
              <div className="text-xs text-indigo-600 dark:text-indigo-400 font-mono">SĐT: {request.customerPhone}</div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 dark:text-slate-400">Người đề xuất:</span>
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">{request.requestedBy}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Hạn Mức Tín Dụng</span>
              <div className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                {request.creditLimit.toLocaleString('vi-VN')} đ
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Dư Nợ Hiện Tại</span>
              <div className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                {request.currentDebt.toLocaleString('vi-VN')} đ
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 shadow-xs">
              <span className="text-[10px] text-rose-700 dark:text-rose-300 uppercase font-semibold">Vượt Trần Dự Kiến</span>
              <div className="text-xs font-mono font-black text-rose-600 dark:text-rose-400 mt-0.5">
                +{request.excessAmount.toLocaleString('vi-VN')} đ
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs">
            <span className="font-semibold text-indigo-700 dark:text-indigo-300">Lý do trình duyệt: </span>
            <span className="text-slate-700 dark:text-slate-300">{request.reason}</span>
          </div>
        </div>

        {/* Chat Timeline */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <MessageSquare className="h-4 w-4" /> Trao Đổi Thẩm Định Nội Bộ
          </div>

          {request.messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                msg.role === 'Admin' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{msg.sender}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">({msg.timestamp})</span>
              </div>
              <div
                className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                  msg.role === 'Admin'
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-none shadow-xs'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex gap-2">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Nhập phản hồi ý kiến / yêu cầu bổ sung chứng từ..."
            className="flex-1 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

        {/* Manager Decision Action Bar */}
        {request.status === 'pending' && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
            <input
              type="text"
              value={decisionNote}
              onChange={(e) => setDecisionNote(e.target.value)}
              placeholder="Ghi chú điều kiện phê duyệt (Ví dụ: Cam kết thanh toán trước thứ Hai)..."
              className="w-full bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleReject}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-600/20 dark:hover:bg-rose-600/30 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 text-xs font-bold transition-all active:scale-95"
              >
                <ShieldAlert className="h-4 w-4" />
                Từ Chối Cấp Nợ
              </button>
              <button
                type="button"
                onClick={handleApprove}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-900/20 transition-all active:scale-95"
              >
                <ShieldCheck className="h-4 w-4" />
                Phê Duyệt Đơn 1 Lần
              </button>
            </div>
          </div>
        )}

        {request.status !== 'pending' && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Đã quyết định bởi: <strong className="text-slate-900 dark:text-white">{request.resolvedBy}</strong> lúc {request.resolvedAt}
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Đã đóng hồ sơ
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

