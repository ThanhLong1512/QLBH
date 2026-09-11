'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal, ChevronDown } from 'lucide-react';

export interface ActionItem {
  id?: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  variant?: 'default' | 'danger' | 'success' | 'warning' | 'indigo';
  disabled?: boolean;
  badge?: string;
  title?: string;
  divider?: boolean; // render a divider line before this item
}

export interface RowActionMenuProps {
  items: ActionItem[];
  label?: string; // If set (e.g. "Thao tác"), renders a button with text & chevron
  iconOnly?: boolean; // default: true (renders MoreHorizontal button)
  buttonClassName?: string;
  align?: 'right' | 'left';
  title?: string;
  disabled?: boolean;
}

export const RowActionMenu: React.FC<RowActionMenuProps> = ({
  items,
  label,
  iconOnly = !label,
  buttonClassName = '',
  align = 'right',
  title = 'Thao tác',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left?: number; right?: number }>({
    top: 0,
  });
  const [opensUpward, setOpensUpward] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const approxMenuHeight = items.length * 40 + 20;
    const spaceBelow = window.innerHeight - rect.bottom;
    const shouldOpenUp = spaceBelow < approxMenuHeight && rect.top > approxMenuHeight;
    setOpensUpward(shouldOpenUp);

    const top = shouldOpenUp
      ? Math.max(8, rect.top - approxMenuHeight - 4)
      : Math.min(window.innerHeight - 20, rect.bottom + 4);

    if (align === 'right') {
      const right = Math.max(8, window.innerWidth - rect.right);
      setMenuPos({ top, right });
    } else {
      const left = Math.max(8, rect.left);
      setMenuPos({ top, left });
    }
  }, [items.length, align]);

  // Handle open / close
  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (disabled) return;
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen((prev) => !prev);
  };

  // Close on outside click, window resize, escape key, or scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      setIsOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen]);

  const activeCount = items.filter((it) => !it.disabled).length;
  if (activeCount === 0) return null;

  return (
    <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleMenu}
        disabled={disabled}
        title={title}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={
          buttonClassName ||
          (iconOnly
            ? `p-1.5 rounded-lg border transition-all duration-150 inline-flex items-center justify-center cursor-pointer ${
                isOpen
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'border-slate-200 dark:border-slate-700/80 bg-white/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white shadow-2xs'
              }`
            : `px-2.5 py-1.5 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 transition-all duration-150 cursor-pointer ${
                isOpen
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'border-slate-200 dark:border-slate-700/80 bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 shadow-2xs'
              }`)
        }
      >
        {label ? (
          <>
            <span>{label}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''
              }`}
            />
          </>
        ) : (
          <MoreHorizontal className="w-4 h-4" />
        )}
      </button>

      {/* PORTAL DROPDOWN MENU */}
      {mounted &&
        isOpen &&
        createPortal(
          <>
            {/* Backdrop overlay to catch outside clicks */}
            <div
              className="fixed inset-0 z-[9998] cursor-default bg-black/5 dark:bg-black/20 backdrop-blur-[0.5px]"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              onContextMenu={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
            />

            {/* Menu Popover */}
            <div
              ref={menuRef}
              role="menu"
              style={{
                top: `${menuPos.top}px`,
                ...(menuPos.right !== undefined ? { right: `${menuPos.right}px` } : {}),
                ...(menuPos.left !== undefined ? { left: `${menuPos.left}px` } : {}),
              }}
              className={`fixed z-[9999] min-w-[200px] max-w-[280px] p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-950/10 dark:shadow-black/40 backdrop-blur-md animate-in fade-in zoom-in-95 duration-100 select-none`}
              onClick={(e) => e.stopPropagation()}
            >
              {items.map((item, index) => {
                if (item.disabled) return null;
                const Icon = item.icon;

                let variantClass =
                  'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white';
                let iconColor = 'text-slate-500 dark:text-slate-400';

                if (item.variant === 'danger') {
                  variantClass =
                    'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-700 dark:hover:text-rose-300';
                  iconColor = 'text-rose-500 dark:text-rose-400';
                } else if (item.variant === 'success') {
                  variantClass =
                    'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-800 dark:hover:text-emerald-300';
                  iconColor = 'text-emerald-600 dark:text-emerald-400';
                } else if (item.variant === 'warning') {
                  variantClass =
                    'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:text-amber-800 dark:hover:text-amber-300';
                  iconColor = 'text-amber-500 dark:text-amber-400';
                } else if (item.variant === 'indigo') {
                  variantClass =
                    'text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-800 dark:hover:text-indigo-200';
                  iconColor = 'text-indigo-500 dark:text-indigo-400';
                }

                return (
                  <React.Fragment key={item.id || index}>
                    {item.divider && index > 0 && (
                      <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      title={item.title || item.label}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(false);
                        item.onClick?.();
                      }}
                      className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${variantClass}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {Icon && <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />}
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </>,
          document.body
        )}
    </div>
  );
};
