"use client";
import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Clock,
  Banknote,
  QrCode,
  AlertTriangle,
  CheckCircle2,
  Printer,
  RotateCcw,
  FileSpreadsheet,
  Layers,
  Lock,
  Unlock,
  ShieldCheck
} from 'lucide-react';

export const ShiftView: React.FC = () => {
  const { currentShift, closeShift, openPrintModal, showToast } = useERP();

  const [actualCash, setActualCash] = useState<number>(currentShift.actualCash || currentShift.expectedCash || 0);
  const [discrepancyNote, setDiscrepancyNote] = useState<string>('');
  const [showDenomHelper, setShowDenomHelper] = useState(false);

  // Denominations counter for quick VN cash audit
  const [denoms, setDenoms] = useState<{ [key: number]: number }>({
    500000: 0,
    200000: 0,
    100000: 0,
    50000: 0,
    20000: 0,
    10000: 0,
    5000: 0
  });

  const updateDenom = (faceValue: number, count: number) => {
    const updated = { ...denoms, [faceValue]: Math.max(0, count) };
    setDenoms(updated);
    const sum = Object.entries(updated).reduce(
      (acc, [val, cnt]) => acc + Number(val) * Number(cnt),
      0
    );
    setActualCash(sum);
  };

  // Calculations
  const expectedCash =
    currentShift.openingCash + currentShift.cashSales - currentShift.cashDrops;
  const difference = actualCash - expectedCash;

  const handleCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (difference !== 0 && !discrepancyNote.trim()) {
      showToast('⚠️ Vui lòng nhập lý do giải trình chênh lệch két tiền trước khi chốt ca!');
      return;
    }

    closeShift(actualCash, discrepancyNote);
  };

  const handlePrintHandover = () => {
    // Generate dummy order object to trigger handover print layout
    const dummyOrder = {
      id: 'shift_receipt',
      code: `CA-${currentShift.id.toUpperCase()}`,
      customerId: '0',
      customerName: `BÀN GIAO CA BÁN HÀNG - ${currentShift.cashierName}`,
      customerPhone: '0901234567',
      items: [
        {
          productId: '1',
          name: 'Số dư tiền mặt đầu ca',
          sku: 'INIT',
          category: 'Ca',
          selectedUnit: 'VNĐ',
          conversionRate: 1,
          quantity: 1,
          unitPrice: currentShift.openingCash,
          discountPercent: 0,
          totalPrice: currentShift.openingCash,
          costPricePerUnit: 0
        },
        {
          productId: '2',
          name: 'Doanh thu tiền mặt trong ca',
          sku: 'CASH',
          category: 'Ca',
          selectedUnit: 'VNĐ',
          conversionRate: 1,
          quantity: 1,
          unitPrice: currentShift.cashSales,
          discountPercent: 0,
          totalPrice: currentShift.cashSales,
          costPricePerUnit: 0
        },
        {
          productId: '3',
          name: 'Doanh thu chuyển khoản VietQR',
          sku: 'QR',
          category: 'Ca',
          selectedUnit: 'VNĐ',
          conversionRate: 1,
          quantity: 1,
          unitPrice: currentShift.vietQrSales,
          discountPercent: 0,
          totalPrice: currentShift.vietQrSales,
          costPricePerUnit: 0
        }
      ],
      subtotal: currentShift.cashSales + currentShift.vietQrSales,
      totalAmount: currentShift.cashSales + currentShift.vietQrSales,
      discountAmount: 0,
      shippingFee: 0,
      paidAmount: expectedCash,
      debtAmount: 0,
      paymentMethod: 'cash' as const,
      status: 'completed' as const,
      cashierName: currentShift.cashierName,
      createdAt: currentShift.closedAt || currentShift.startedAt,
      notes: `Tiền thực kiểm: ${actualCash.toLocaleString('vi-VN')} đ | Lệch: ${difference.toLocaleString('vi-VN')} đ | ${discrepancyNote}`
    };

    openPrintModal('k80', dummyOrder);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200 text-slate-800 dark:text-slate-100">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Kiểm Két & Bàn Giao Ca Bán Hàng
            </h2>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                !currentShift.isClosed
                  ? 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-500/30 animate-pulse'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {!currentShift.isClosed ? 'Ca Đang Hoạt Động' : 'Ca Đã Đóng Khóa Sổ'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Thu ngân: <strong className="text-slate-800 dark:text-slate-200">{currentShift.cashierName}</strong> • Bắt đầu lúc: {currentShift.startedAt}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintHandover}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold shadow-xs transition-all"
            title="In phiếu bàn giao ca khổ K80 hoặc A5"
          >
            <Printer className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
            <span>In Biên Bản Ca</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards: Initial Cash, Cash Revenue, Bank VietQR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Tiền Đầu Ca (Tiền Lẻ)</span>
          <div className="text-2xl font-mono font-black text-slate-900 dark:text-white mt-1">
            {currentShift.openingCash.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-400">đ</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Đã bàn giao từ ca trước</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-xs">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Doanh Thu Tiền Mặt</span>
          <div className="text-2xl font-mono font-black text-emerald-600 dark:text-emerald-400 mt-1">
            +{currentShift.cashSales.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-400">đ</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Thu tiền mặt trực tiếp tại quầy</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-xs">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">Doanh Thu VietQR 0đ</span>
          <div className="text-2xl font-mono font-black text-indigo-600 dark:text-indigo-400 mt-1">
            +{currentShift.vietQrSales.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-400">đ</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Chuyển khoản khớp lệnh tự động</div>
        </div>
      </div>

      {/* Main Reconciliation Audit Box */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Đối Soát Tiền Mặt Trong Két</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">So sánh số tiền hệ thống tính toán và số tiền thực kiểm đếm</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Expected Cash Breakdown */}
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-2.5">
              <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                Công thức tính tiền két lý thuyết:
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>1. Tiền mặt ban đầu:</span>
                <span className="font-mono font-semibold">{currentShift.openingCash.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>2. Tiền mặt bán hàng:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">+{currentShift.cashSales.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>3. Trả hàng / Chi tiền mặt:</span>
                <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold">-{currentShift.cashDrops.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between font-bold text-slate-900 dark:text-white text-sm">
                <span>TIỀN LÝ THUYẾT TRONG KÉT:</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">{expectedCash.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>

            {/* Quick Denomination Counter Tool */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">Bảng Đếm Mệnh Giá Tiền VNĐ</span>
                <button
                  type="button"
                  onClick={() => setShowDenomHelper(!showDenomHelper)}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  {showDenomHelper ? 'Thu gọn' : 'Mở bảng đếm tờ'}
                </button>
              </div>

              {showDenomHelper && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  {Object.keys(denoms).map((k) => {
                    const faceVal = parseInt(k);
                    return (
                      <div key={faceVal} className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 font-semibold">
                          {faceVal >= 1000 ? `${faceVal / 1000}k` : faceVal}:
                        </span>
                        <input
                          type="number"
                          value={denoms[faceVal] || ''}
                          onChange={(e) => updateDenom(faceVal, parseInt(e.target.value) || 0)}
                          placeholder="0 tờ"
                          className="w-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-0.5 text-center text-xs font-mono text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: Actual Cash Count Input & Difference Result */}
          <form onSubmit={handleCloseShift} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-800 dark:text-slate-200 font-bold">Số Tiền Mặt Thực Kiểm Đếm (VNĐ):</label>
              <input
                type="number"
                value={actualCash}
                onChange={(e) => setActualCash(parseFloat(e.target.value) || 0)}
                disabled={currentShift.isClosed}
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 px-4 py-3 text-lg font-mono font-black text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-indigo-500 disabled:opacity-60"
              />
            </div>

            {/* Difference Indicator Pill */}
            <div
              className={`p-4 rounded-xl border flex items-center justify-between ${
                difference === 0
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-400'
                  : difference > 0
                  ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-300'
                  : 'bg-rose-50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {difference === 0 ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                ) : (
                  <AlertTriangle className="h-5 w-5 shrink-0 animate-pulse" />
                )}
                <div>
                  <div className="font-bold text-sm">
                    {difference === 0
                      ? 'Két tiền khớp hoàn toàn 100%'
                      : difference > 0
                      ? `Thừa tiền két (+${difference.toLocaleString('vi-VN')} đ)`
                      : `Thiếu tiền két (${difference.toLocaleString('vi-VN')} đ)`}
                  </div>
                  <div className="text-[11px] opacity-80">
                    Thực tế ({actualCash.toLocaleString('vi-VN')} đ) vs Lý thuyết ({expectedCash.toLocaleString('vi-VN')} đ)
                  </div>
                </div>
              </div>
            </div>

            {/* Discrepancy Note Textarea (Mandatory if difference != 0) */}
            {difference !== 0 && (
              <div className="space-y-1.5">
                <label className="text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Lý do giải trình chênh lệch két (Bắt buộc):
                </label>
                <textarea
                  rows={3}
                  value={discrepancyNote}
                  onChange={(e) => setDiscrepancyNote(e.target.value)}
                  disabled={currentShift.isClosed}
                  placeholder="Ví dụ: Khách quên lấy lại 20k tiền thối, hoặc thối nhầm đơn lúc 11h..."
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 disabled:opacity-60"
                />
              </div>
            )}

            {!currentShift.isClosed ? (
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all active:scale-98"
              >
                <Lock className="h-4 w-4" />
                Xác Nhận Chốt Ca & Khóa Sổ Bán Hàng
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center text-slate-600 dark:text-slate-400 font-semibold">
                🔒 Ca này đã được đóng khóa sổ lúc {currentShift.closedAt}. Không thể chỉnh sửa thêm.
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

