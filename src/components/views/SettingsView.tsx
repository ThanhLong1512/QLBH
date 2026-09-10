"use client";
import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Settings,
  QrCode,
  Lock,
  Radio,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Send,
  HelpCircle
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    bankConfig,
    setBankConfig,
    managerPin,
    setManagerPin,
    telegramConfig,
    setTelegramConfig,
    resetAllData,
    showToast
  } = useERP();

  // Local form state
  const [bankId, setBankId] = useState(bankConfig.bankId);
  const [accountNumber, setAccountNumber] = useState(bankConfig.accountNo);
  const [accountName, setAccountName] = useState(bankConfig.accountName);

  const [pin, setPin] = useState(managerPin);

  const [botToken, setBotToken] = useState(telegramConfig.botToken);
  const [chatId, setChatId] = useState(telegramConfig.chatId);
  const [telegramEnabled, setTelegramEnabled] = useState(telegramConfig.enabled);

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    setBankConfig({ bankId, accountNo: accountNumber, accountName });
    showToast('✅ Đã lưu cấu hình tài khoản VietQR 0đ!');
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) {
      showToast('⚠️ Mã PIN Quản Lý tối thiểu 4 chữ số!');
      return;
    }
    setManagerPin(pin);
    showToast('✅ Đã cập nhật mã PIN chống bán lỗ mới!');
  };

  const handleSaveTelegram = (e: React.FormEvent) => {
    e.preventDefault();
    setTelegramConfig({ botToken, chatId, enabled: telegramEnabled });
    showToast('✅ Đã lưu cấu hình kênh Telegram Dispatch 0đ!');
  };

  const handleTestTelegram = () => {
    showToast('🔔 [Test Alert] Đã gửi thông báo thử nghiệm thành công tới Telegram của Ban Lãnh Đạo!');
  };

  const banks = [
    { code: 'MB', name: 'MBBank (Ngân hàng Quân Đội)' },
    { code: 'VCB', name: 'Vietcombank (Ngoại thương Việt Nam)' },
    { code: 'ACB', name: 'ACB (Á Châu)' },
    { code: 'TCB', name: 'Techcombank (Kỹ Thương)' },
    { code: 'VPB', name: 'VPBank (Việt Nam Thịnh Vượng)' },
    { code: 'BIDV', name: 'BIDV (Đầu tư & Phát triển)' }
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 max-w-5xl mx-auto animate-in fade-in duration-200 text-slate-800 dark:text-slate-100">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Cấu Hình Hệ Thống & Cổng Thanh Toán 0đ
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Thiết lập cổng VietQR động chuẩn NAPAS 247, mã PIN bảo mật & kênh cảnh báo Telegram
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. VIETQR ZERO-COST CONFIGURATION */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
            <QrCode className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Cổng VietQR Chuẩn Quốc Gia (NAPAS 247)
          </div>

          <form onSubmit={handleSaveBank} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-700 dark:text-slate-300 font-semibold">Ngân hàng thụ hưởng:</label>
              <select
                value={bankId}
                onChange={(e) => setBankId(e.target.value)}
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                {banks.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.code} - {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 dark:text-slate-300 font-semibold">Số tài khoản ngân hàng:</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 dark:text-slate-300 font-semibold">Tên chủ tài khoản (In hoa không dấu):</label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 text-[11px] text-slate-700 dark:text-slate-300">
              💡 <strong>Cơ chế 0đ:</strong> Hệ thống tự động sinh ảnh QR theo chuẩn VietQR NAPAS (img.vietqr.io), tiền về thẳng tài khoản doanh nghiệp ngay lập tức, 100% miễn phí giao dịch, không cần trung gian thanh toán.
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all active:scale-98"
            >
              Lưu Thông Tin VietQR
            </button>
          </form>
        </div>

        {/* 2. MANAGER PIN CODE (ANTI-LOSS FRAUD SHIELD) */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
            <Lock className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            Mã PIN Quản Lý (Khóa Chống Bán Lỗ & Gian Lận)
          </div>

          <form onSubmit={handleSavePin} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-700 dark:text-slate-300 font-semibold">Mã PIN Quản Lý Hiện Tại:</label>
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Ví dụ: 8888"
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-center text-lg font-mono font-black tracking-widest text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
              <div className="font-bold text-rose-700 dark:text-rose-300">Cơ Chế Khóa Tự Động (Anti-Loss):</div>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Khóa đơn nếu Thu Ngân chỉnh giá bán thấp hơn giá vốn sản phẩm.</li>
                <li>Khóa đơn nếu áp dụng mức chiết khấu &gt; 10%.</li>
                <li>Cần nhập đúng mã PIN này mới cho phép mở khóa in hóa đơn.</li>
              </ul>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all active:scale-98"
            >
              Cập Nhật Mã PIN Mới
            </button>
          </form>
        </div>

        {/* 3. TELEGRAM ALERT DISPATCHER (0-COST RUNTIME) */}
        <div className="md:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <Radio className="h-4 w-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              Kênh Cảnh Báo Telegram Dispatch (Miễn Phí Vận Hành 100%)
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={telegramEnabled}
                onChange={(e) => setTelegramEnabled(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-0"
              />
              <span className="text-slate-700 dark:text-slate-300 font-semibold">Kích hoạt thông báo tự động</span>
            </label>
          </div>

          <form onSubmit={handleSaveTelegram} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300 font-semibold">Telegram Bot Token:</label>
                <input
                  type="text"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  placeholder="Ví dụ: 789123456:AAFlkjasdf..."
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300 font-semibold">Chat ID Nhóm Lãnh Đạo / Kế Toán:</label>
                <input
                  type="text"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  placeholder="Ví dụ: -100123456789"
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleTestTelegram}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              >
                <Send className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Bắn Tin Nhắn Test Thử</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-98"
              >
                Lưu Cấu Hình Telegram
              </button>
            </div>
          </form>
        </div>

        {/* 4. SYSTEM FACTORY RESET */}
        <div className="md:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Khôi Phục Dữ Liệu Ban Đầu (Demo Reset)</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Xóa sạch cache localStorage và nạp lại toàn bộ dữ liệu mẫu doanh nghiệp chuẩn
            </p>
          </div>
          <button
            onClick={resetAllData}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-600/20 hover:bg-rose-100 dark:hover:bg-rose-600/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/40 text-xs font-semibold transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Khôi Phục Dữ Liệu</span>
          </button>
        </div>
      </div>
    </div>
  );
};

