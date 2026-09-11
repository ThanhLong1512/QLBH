"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useERP } from "../../context/ERPContext";
import { DEMO_PERSONAS, DemoPersona } from "../../data/demoPersonas";
import { UserRole } from "../../types/erp";
import { X, Check, ShieldAlert, Sparkles, UserCheck, ArrowRight } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleTourModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { role, setRole, showToast } = useERP();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and handle ESC key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleSelectRole = (targetRole: UserRole) => {
    const persona = DEMO_PERSONAS[targetRole];
    if (!persona) return;

    // Set cookie for middleware & server-side API auth validation
    document.cookie = `nexus_demo_role=${targetRole}; path=/; max-age=604800; SameSite=Lax`;

    // Update frontend state
    setRole(targetRole);

    showToast(`🎭 Đã chuyển sang vai trò: ${persona.name} (${persona.roleTitle})`);
    onClose();
  };

  const personaList = Object.values(DEMO_PERSONAS);

  const modalContent = (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-2xl sm:max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 sm:px-6 py-4 bg-slate-50 dark:bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30 shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2 truncate">
                <span>Trải Nghiệm Đa Vai Trò (Role Tour)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shrink-0">
                  RBAC
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Chọn vai trò để kiểm chứng phân quyền, bảo mật giá vốn và tính năng tương ứng
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer shrink-0 ml-2"
            title="Đóng (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Personas List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 max-h-[calc(90vh-130px)]">
          {personaList.map((persona) => {
            const isCurrent = role === persona.role;

            return (
              <div
                key={persona.role}
                onClick={() => handleSelectRole(persona.role)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                  isCurrent
                    ? "bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md"
                    : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-slate-600 hover:shadow-xs"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={`h-11 w-11 sm:h-12 sm:w-12 rounded-2xl flex items-center justify-center text-xl font-bold shadow-xs shrink-0 ${persona.badgeColor}`}
                    >
                      {persona.avatar}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {persona.name}
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                          {persona.roleTitle}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white flex items-center gap-1 shadow-xs">
                            <UserCheck className="w-3 h-3" /> Đang Hoạt Động
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {persona.description}
                      </p>

                      {/* Allowed vs Restricted tags */}
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {persona.allowedHighlights.slice(0, 3).map((feat, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40"
                          >
                            <Check className="w-2.5 h-2.5" /> {feat}
                          </span>
                        ))}
                        {persona.restrictedHighlights.map((restr, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40"
                          >
                            <ShieldAlert className="w-2.5 h-2.5" /> {restr}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 self-end sm:self-center ${
                      isCurrent
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-700 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    <span>{isCurrent ? "Đang chọn" : "Chuyển vai trò"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-3 bg-slate-50 dark:bg-slate-950/70 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <span className="hidden sm:inline">Phân quyền được áp dụng tự động trên Client & Server-Side API</span>
          <span className="sm:hidden">Kiểm tra quyền RBAC</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors font-semibold cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
