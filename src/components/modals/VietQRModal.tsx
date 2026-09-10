"use client";
import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { X, Copy, Check, QrCode, Building2, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export const VietQRModal: React.FC = () => {
  const { vietQrModal, closeVietQrModal, bankConfig, showToast } = useERP();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  if (!vietQrModal.isOpen) return null;

  const { amount, orderCode, customerName, onSuccess } = vietQrModal;
  const qrUrl = `https://img.vietqr.io/image/${bankConfig.bankId}-${bankConfig.accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(orderCode)}`;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    showToast(`Đã sao chép ${field}: ${text}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSimulatePaymentReceived = () => {
    setIsConfirmed(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    showToast(`🎉 Webhook VietQR: Đã nhận thành công ${amount.toLocaleString('vi-VN')} đ cho đơn ${orderCode}`);

    setTimeout(() => {
      setIsConfirmed(false);
      if (onSuccess) onSuccess();
      closeVietQrModal();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                Thanh Toán VietQR Tự Động 0đ
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                  Napas 247
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Quét mã bằng mọi app ngân hàng & ví điện tử tại Việt Nam</p>
            </div>
          </div>
          <button
            onClick={closeVietQrModal}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* QR Image Box */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 dark:bg-white text-slate-900 shadow-inner border border-slate-200 dark:border-transparent">
            <div className="relative group">
              <img
                src={qrUrl}
                alt={`VietQR ${orderCode}`}
                className="w-56 h-auto object-contain transition-transform duration-200 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="text-center mt-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  Quét để chuyển khoản chính xác 100%
                </span>
              </div>
            </div>
          </div>

          {/* Amount Badge */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50">
            <div>
              <span className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">Số tiền thanh toán:</span>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono tracking-tight">
                {amount.toLocaleString('vi-VN')} <span className="text-sm font-semibold">VNĐ</span>
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(amount.toString(), 'Số tiền')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-600/30 hover:bg-indigo-200 dark:hover:bg-indigo-600/50 text-indigo-700 dark:text-indigo-200 text-xs font-medium border border-indigo-300 dark:border-indigo-500/40 transition-colors"
            >
              {copiedField === 'Số tiền' ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              Sao chép
            </button>
          </div>

          {/* Bank details list */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-slate-400" /> Ngân hàng nhận:
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">MB Bank (Ngân Hàng Quân Đội)</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">Số tài khoản:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{bankConfig.accountNo}</span>
                <button
                  onClick={() => copyToClipboard(bankConfig.accountNo, 'Số tài khoản')}
                  className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                  title="Sao chép số tài khoản"
                >
                  {copiedField === 'Số tài khoản' ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">Chủ tài khoản:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase">{bankConfig.accountName}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">Nội dung CK:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">{orderCode}</span>
                <button
                  onClick={() => copyToClipboard(orderCode, 'Nội dung CK')}
                  className="text-slate-400 hover:text-amber-600 dark:hover:text-amber-400"
                  title="Sao chép nội dung"
                >
                  {copiedField === 'Nội dung CK' ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {customerName && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/30">
                <span className="text-slate-500">Khách hàng:</span>
                <span className="text-slate-700 dark:text-slate-400 font-medium">{customerName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-950/70">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Đang lắng nghe biến động số dư...
          </div>
          <div className="flex gap-2">
            <button
              onClick={closeVietQrModal}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              Đóng
            </button>
            <button
              onClick={handleSimulatePaymentReceived}
              disabled={isConfirmed}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-900/20 transition-all active:scale-95"
            >
              <CheckCircle2 className="h-4 w-4" />
              {isConfirmed ? 'Đã xác nhận!' : 'Xác Nhận Đã Nhận Tiền (Test Webhook)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

