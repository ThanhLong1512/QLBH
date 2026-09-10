"use client";
import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ShieldAlert, X, Lock, KeyRound } from 'lucide-react';

export const ManagerPinModal: React.FC = () => {
  const { pinModal, closePinModal, verifyPin } = useERP();
  const [pinInput, setPinInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!pinModal.isOpen) return null;

  const handleKeyPress = (num: string) => {
    if (pinInput.length < 4) {
      const nextPin = pinInput + num;
      setPinInput(nextPin);
      setErrorMessage('');

      if (nextPin.length === 4) {
        // Auto verify on 4 digits
        setTimeout(() => {
          if (verifyPin(nextPin)) {
            pinModal.onSuccess();
            closePinModal();
            setPinInput('');
          } else {
            setErrorMessage('Mã PIN quản trị không đúng! Vui lòng thử lại.');
            setPinInput('');
          }
        }, 150);
      }
    }
  };

  const handleBackspace = () => {
    setPinInput(prev => prev.slice(0, -1));
    setErrorMessage('');
  };

  const handleClear = () => {
    setPinInput('');
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-rose-300 dark:border-rose-500/40 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100">
        {/* Top Warning Banner */}
        <div className="flex items-center justify-between border-b border-rose-200 dark:border-rose-500/20 px-6 py-4 bg-gradient-to-r from-rose-50 to-white dark:from-rose-950/80 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm sm:text-base">
                Mã PIN Quản Trị Chống Bán Lỗ
              </h3>
              <p className="text-xs text-rose-600 dark:text-rose-300/80">Yêu cầu xác thực quyền quản lý</p>
            </div>
          </div>
          <button
            onClick={closePinModal}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-center">
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-left">
            <div className="flex items-start gap-2.5">
              <Lock className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-900 dark:text-rose-200 leading-relaxed">
                <span className="font-semibold text-rose-950 dark:text-white">Lý do khóa: </span>
                {pinModal.reason || 'Phát hiện đơn hàng có chiết khấu > 10% hoặc đơn giá bán thấp hơn giá vốn (COGS)!'}
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Nhập mã PIN 4 số của Quản Lý để mở khóa phê duyệt (Mặc định: <strong className="text-indigo-600 dark:text-indigo-400">8888</strong>)
          </p>

          {/* PIN Dots Indicator */}
          <div className="flex justify-center items-center gap-3 py-2">
            {[0, 1, 2, 3].map((index) => {
              const isFilled = index < pinInput.length;
              return (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    isFilled
                      ? 'bg-rose-500 scale-125 shadow-md shadow-rose-500/50'
                      : 'bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700'
                  }`}
                />
              );
            })}
          </div>

          {errorMessage && (
            <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 animate-shake">
              {errorMessage}
            </div>
          )}

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto pt-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num)}
                className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-mono text-lg font-bold border border-slate-200 dark:border-slate-700/60 shadow-xs active:scale-95 transition-all"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800/40 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold border border-slate-200 dark:border-slate-800 active:scale-95 transition-all"
            >
              Xóa hết
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-mono text-lg font-bold border border-slate-200 dark:border-slate-700/60 shadow-xs active:scale-95 transition-all"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800/40 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold border border-slate-200 dark:border-slate-800 active:scale-95 transition-all flex items-center justify-center"
            >
              ← Xóa
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-3 bg-slate-50 dark:bg-slate-950/70 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <KeyRound className="h-3.5 w-3.5" /> Ghi log audit về Telegram
          </span>
          <button
            onClick={closePinModal}
            className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Hủy bỏ
          </button>
        </div>
      </div>
    </div>
  );
};

