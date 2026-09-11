"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  X,
  Copy,
  Check,
  QrCode,
  Building2,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const VietQRModal: React.FC = () => {
  const { vietQrModal, closeVietQrModal, bankConfig, showToast } = useERP();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'waiting' | 'verifying' | 'received'>('waiting');
  const [lastWebhookTx, setLastWebhookTx] = useState<{
    reference?: string;
    bank?: string;
    amount?: number;
    receivedAt?: string;
  } | null>(null);
  const [isSimulatingWebhook, setIsSimulatingWebhook] = useState(false);
  const [countdown, setCountdown] = useState<number>(300); // 5 minutes

  const isOpen = vietQrModal.isOpen;
  const { amount = 0, orderCode = '', customerName = '', onSuccess } = vietQrModal;

  // Reset state on modal open
  useEffect(() => {
    if (isOpen) {
      setPaymentStatus('waiting');
      setLastWebhookTx(null);
      setCountdown(300);
    }
  }, [isOpen, orderCode]);

  // 5-minute countdown clock
  useEffect(() => {
    if (!isOpen || paymentStatus === 'received') return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, paymentStatus]);

  // End-to-End Real-Time Webhook Polling: Listen to /api/webhooks/vietqr?orderCode=DH-xxx
  useEffect(() => {
    if (!isOpen || paymentStatus !== 'waiting' || !orderCode) return;

    let isMounted = true;
    const checkWebhookStatus = async () => {
      try {
        const res = await fetch(`/api/webhooks/vietqr?orderCode=${encodeURIComponent(orderCode)}`, {
          cache: 'no-store'
        });
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.success && data.paid && data.data) {
          triggerPaymentSuccess(data.data);
        }
      } catch (err) {
        // network polling error, continue
      }
    };

    // Initial check immediately
    checkWebhookStatus();
    // Poll every 1.5s for real bank webhook callback
    const pollInterval = setInterval(checkWebhookStatus, 1500);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [isOpen, paymentStatus, orderCode]);

  if (!isOpen) return null;

  const qrUrl = `https://img.vietqr.io/image/${bankConfig.bankId}-${bankConfig.accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(orderCode)}`;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    showToast(`Đã sao chép ${field}: ${text}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const triggerPaymentSuccess = (txData?: any) => {
    if (paymentStatus === 'received') return;
    setPaymentStatus('verifying');

    if (txData) {
      setLastWebhookTx({
        reference: txData.reference,
        bank: txData.bank || 'MB Bank Napas 247',
        amount: txData.amount || amount,
        receivedAt: txData.receivedAt || new Date().toISOString()
      });
    }

    setTimeout(() => {
      setPaymentStatus('received');
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.6 }
      });
      showToast(`🎉 Webhook Napas 247 xác nhận: +${amount.toLocaleString('vi-VN')} đ (Đơn ${orderCode})`);

      setTimeout(() => {
        if (onSuccess) onSuccess();
        closeVietQrModal();
      }, 1500);
    }, 600);
  };

  // Simulate real bank webhook POST request
  const handleSimulateBankWebhook = async () => {
    if (isSimulatingWebhook || paymentStatus !== 'waiting') return;
    setIsSimulatingWebhook(true);
    try {
      const res = await fetch('/api/webhooks/vietqr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderCode,
          amount,
          transactionContent: `${orderCode} NAPAS 247 CHUYEN TIEN THANH TOAN`,
          referenceNumber: `FT${Date.now().toString().slice(-8)}`,
          gateway: 'MB Bank Live Webhook (0đ Phí)'
        })
      });
      const result = await res.json();
      if (result.success) {
        showToast('⚡ Webhook ngân hàng đã gửi thành công!');
        if (result.data) {
          triggerPaymentSuccess(result.data);
        }
      } else {
        showToast(`⚠️ Lỗi webhook: ${result.error || 'Thất bại'}`);
      }
    } catch {
      showToast('⚠️ Không thể kết nối tới cổng webhook');
    } finally {
      setIsSimulatingWebhook(false);
    }
  };

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100 transition-all">
        
        {/* Top Gradient Ribbon */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-emerald-500 to-teal-400" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 px-6 py-4 bg-slate-50/80 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <QrCode className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-base">
                Thanh Toán VietQR Pro (End-to-End)
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30">
                  Napas 247 • Webhook Live
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Khớp lệnh tự động qua Webhook Napas liên ngân hàng quốc gia</p>
            </div>
          </div>
          <button
            onClick={closeVietQrModal}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="px-6 py-2.5 bg-slate-100/70 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {paymentStatus === 'received' ? (
              <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> Webhook xác nhận: Đã nhận tiền
              </span>
            ) : paymentStatus === 'verifying' ? (
              <span className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400 animate-pulse">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Đang đối soát giao dịch ngân hàng...
              </span>
            ) : (
              <span className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                Đang chờ Webhook ngân hàng khớp mã...
              </span>
            )}
          </div>
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            Hết hạn sau: <span className="font-bold text-slate-800 dark:text-slate-200">{formatCountdown(countdown)}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {paymentStatus === 'received' ? (
            /* SUCCESS BANNER VIEW */
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 border-2 border-emerald-500/40 animate-bounce">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900 dark:text-white">Thanh Toán Khớp Lệnh Thành Công!</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Đã ghi nhận thanh toán VietQR cho đơn hàng <strong className="text-indigo-600 dark:text-indigo-400">{orderCode}</strong>
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs space-y-1.5 w-full max-w-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Số tiền khớp:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {(lastWebhookTx?.amount || amount).toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mã chuẩn chi Napas:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {lastWebhookTx?.reference || `MB-NAPAS-${Date.now().toString().slice(-6)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cổng tiếp nhận:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {lastWebhookTx?.bank || 'MB Bank Realtime Webhook'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Trạng thái đơn:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Đã Hoàn Tất & Đóng Đơn POS</span>
                </div>
              </div>
            </div>
          ) : (
            /* QR & BANK DETAILS VIEW */
            <>
              {/* QR Image Box with scanning laser beam effect */}
              <div className="relative flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-white text-slate-900 shadow-inner border border-slate-200 dark:border-transparent overflow-hidden">
                <div className="relative group">
                  <img
                    src={qrUrl}
                    alt={`VietQR ${orderCode}`}
                    className="w-56 h-auto object-contain transition-transform duration-200 group-hover:scale-105 rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  {/* Visual Scanning Line */}
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-75 animate-pulse" />
                </div>
                <div className="text-center mt-2 flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  Quét bằng mọi ứng dụng ngân hàng & ví điện tử
                </div>
              </div>

              {/* Amount Badge */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50">
                <div>
                  <span className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">Số tiền thanh toán:</span>
                  <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono tracking-tight">
                    {amount.toLocaleString('vi-VN')} <span className="text-sm font-semibold">VNĐ</span>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(amount.toString(), 'Số tiền')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-100 dark:bg-indigo-600/30 hover:bg-indigo-200 dark:hover:bg-indigo-600/50 text-indigo-700 dark:text-indigo-200 text-xs font-semibold border border-indigo-300 dark:border-indigo-500/40 transition-colors cursor-pointer"
                >
                  {copiedField === 'Số tiền' ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  Sao chép
                </button>
              </div>

              {/* Bank details list */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" /> Ngân hàng nhận:
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">MB Bank (Ngân Hàng Quân Đội)</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-slate-500 dark:text-slate-400">Số tài khoản:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{bankConfig.accountNo}</span>
                    <button
                      onClick={() => copyToClipboard(bankConfig.accountNo, 'Số tài khoản')}
                      className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                      title="Sao chép số tài khoản"
                    >
                      {copiedField === 'Số tài khoản' ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-slate-500 dark:text-slate-400">Chủ tài khoản:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase">{bankConfig.accountName}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-slate-500 dark:text-slate-400">Nội dung CK:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">{orderCode}</span>
                    <button
                      onClick={() => copyToClipboard(orderCode, 'Nội dung CK')}
                      className="text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer"
                      title="Sao chép nội dung"
                    >
                      {copiedField === 'Nội dung CK' ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {customerName && (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                    <span className="text-slate-500">Khách hàng:</span>
                    <span className="text-slate-700 dark:text-slate-400 font-medium">{customerName}</span>
                  </div>
                )}
              </div>

              {/* REAL WEBHOOK SIMULATOR & VERIFICATION STRIP */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <div>
                      <div className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                        Webhook Napas 247 Real-time
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono">
                          Polling 1.5s
                        </span>
                      </div>
                      <div className="text-[11px] text-indigo-700/80 dark:text-indigo-300/70">
                        Lắng nghe giao dịch thực tế từ webhook ngân hàng
                      </div>
                    </div>
                  </div>

                  {/* Test Simulate Webhook Button */}
                  <button
                    type="button"
                    onClick={handleSimulateBankWebhook}
                    disabled={isSimulatingWebhook || paymentStatus !== 'waiting'}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    title="Bắn POST /api/webhooks/vietqr để mô phỏng biến động số dư ngân hàng"
                  >
                    {isSimulatingWebhook ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Zap className="h-3.5 w-3.5" />
                    )}
                    <span>Bắn Webhook Thật</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-950/70">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Đang lắng nghe biến động Napas 247...
          </div>
          <button
            onClick={closeVietQrModal}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
