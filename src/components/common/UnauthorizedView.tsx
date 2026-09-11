"use client";

import React from "react";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useERP } from "@/context/ERPContext";
import { ROLE_CONFIG, UserRole } from "@/types/erp";

interface UnauthorizedViewProps {
  onGoHome?: () => void;
  requiredPermission?: string;
}

export const UnauthorizedView: React.FC<UnauthorizedViewProps> = ({
  onGoHome,
  requiredPermission,
}) => {
  const { role, currentUser } = useERP();
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.cashier;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center animate-in fade-in duration-300">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-rose-500/20 blur-2xl animate-pulse" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-xl shadow-rose-500/30">
          <ShieldAlert className="h-10 w-10" />
        </div>
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 border bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800">
        <span>Quyền Truy Cập Bị Giới Hạn</span>
      </div>

      <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
        Bạn không có quyền truy cập khu vực này
      </h2>

      <p className="max-w-md text-sm text-slate-500 dark:text-slate-400 mb-6">
        Tài khoản <span className="font-semibold text-slate-800 dark:text-slate-200">{currentUser?.name || "Hiện tại"}</span> đang đăng nhập với vai trò{" "}
        <span className="font-bold text-indigo-600 dark:text-indigo-400">
          {currentUser?.roleTitle || config.title}
        </span>
        . Vui lòng liên hệ Quản trị viên hệ thống nếu bạn cần phân quyền tính năng này.
      </p>

      {requiredPermission && (
        <div className="text-xs font-mono bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 mb-6 border border-slate-200 dark:border-slate-700">
          Quyền yêu cầu: <span className="font-bold text-rose-500">{requiredPermission}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onGoHome && (
          <button
            onClick={onGoHome}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Về Màn Hình Chính ({config.label})</span>
          </button>
        )}
      </div>
    </div>
  );
};
