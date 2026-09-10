"use client";
import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Bell,
  ScanBarcode,
  Printer,
  ShieldCheck,
  Shield,
  Sun,
  Moon,
  Search,
  ExternalLink,
  ChevronDown,
  User,
  CheckCircle,
  AlertTriangle,
  Radio,
  Volume2,
  LogOut,
  KeyRound
} from 'lucide-react';

interface Props {
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Header: React.FC<Props> = ({ activeView, setActiveView }) => {
  const {
    theme,
    toggleTheme,
    role,
    toggleRole,
    canViewCosts,
    telegramAlerts,
    openScannerModal,
    openPrintModal,
    orders,
    currentShift,
    currentUser,
    logout
  } = useERP();

  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const viewTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard KPI Điều Hành', subtitle: 'Tổng quan chỉ số kinh doanh, tài chính & cảnh báo vận hành' },
    pos: { title: 'Bàn Bán Hàng POS Đa Đơn', subtitle: 'Hỗ trợ đa tab, VietQR tự động 0đ, chống bán lỗ & quy đổi ĐVT' },
    orders: { title: 'Danh Sách Đơn Hàng & Vận Đơn', subtitle: 'Theo dõi tiến độ giao hàng, in ấn K80/A5/A6 & lịch sử thanh toán' },
    shift: { title: 'Chốt Ca Thu Ngân & Kiểm Két', subtitle: 'Đối soát tiền mặt, tiền chuyển khoản VietQR & giải trình lệch két' },
    products: { title: 'Quản Lý Danh Mục Sản Phẩm & Bảng Giá', subtitle: 'Mã SKU, mã vạch Barcode, bảng giá đa cấp (Lẻ/Sỉ/VIP), đơn vị quy đổi & định mức tồn' },
    inventory: { title: 'Quản Lý Xuất Nhập Tồn & Kiểm Kê Kho', subtitle: 'Báo cáo xuất nhập tồn tổng hợp, lập phiếu nhập kho NCC, xuất hủy & cân bằng kiểm kê' },
    warehouse: { title: 'Quản Lý Kho, Lô Date & Serial IMEI', subtitle: 'Quy đổi Thùng/Cái, cảnh báo FEFO cận hạn & tra cứu vòng đời thiết bị' },
    returns: { title: 'Quản Lý Trả Hàng & Hoàn Tiền', subtitle: 'Khách hàng trả lại hàng (nhập lại/hàng lỗi, hoàn tiền/trừ nợ) & trả hàng nhà cung cấp' },
    customers: { title: 'Quản Lý Khách Hàng & Credit Guard', subtitle: 'Hạn mức công nợ thị trường, xếp hạng đại lý & thu nợ nhanh' },
    suppliers: { title: 'Quản Lý Nhà Cung Cấp & Công Nợ Mua', subtitle: 'Đối tác cung ứng hàng hóa, theo dõi công nợ phải trả & lập phiếu chi đối soát' },
    debt_aging: { title: 'Báo Cáo Phân Tích Tuổi Nợ (Aging Report)', subtitle: 'Khoanh vùng nợ trong hạn, nợ quá hạn & nợ xấu khó đòi' },
    employees: { title: 'Quản Lý Nhân Sự & Phân Quyền Vai Trò', subtitle: 'Hồ sơ nhân viên, phân quyền truy cập, lương cơ bản & cơ chế hoa hồng' },
    cashflow: { title: 'Sổ Quỹ Thu Chi & Dòng Tiền', subtitle: 'Quản lý thu chi tiền mặt, tiền gửi ngân hàng theo danh mục' },
    approvals: { title: 'Thẩm Định & Thảo Luận Duyệt Nợ', subtitle: 'Phê duyệt vượt trần tín dụng & bảo đảm an toàn dòng tiền' },
    settings: { title: 'Cấu Hình Hệ Thống & Cổng VietQR', subtitle: 'Tùy chỉnh thông tin tài khoản ngân hàng, mã PIN & Telegram Webhook' }
  };

  const currentInfo = viewTitles[activeView] || { title: 'NEXUS ERP', subtitle: 'Hệ thống vận hành doanh nghiệp' };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 text-slate-800 dark:border-slate-800 dark:bg-[#0B0F19]/95 dark:text-white backdrop-blur px-6 transition-colors duration-200">
      {/* Title & Context */}
      <div>
        <h1 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          {currentInfo.title}
          {!canViewCosts && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium">
              Chế độ Thu Ngân (Đã ẩn giá vốn)
            </span>
          )}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">{currentInfo.subtitle}</p>
      </div>

      {/* Action Controls - Grouped Neatly */}
      <div className="flex items-center gap-2.5">
        {/* GROUP 1: POS Quick Actions Group */}
        <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 p-0.5 border border-slate-200 dark:border-slate-700/70 shadow-sm">
          <button
            onClick={() => openScannerModal(() => {
              setActiveView('pos');
            })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xs transition-all active:scale-95"
            title="Mở máy quét mã vạch Barcode/QR từ Camera"
          >
            <ScanBarcode className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
            <span className="hidden md:inline">Quét Mã</span>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 my-auto" />

          <button
            onClick={() => {
              const lastOrder = orders[0];
              if (lastOrder) {
                openPrintModal('k80', lastOrder);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xs transition-all active:scale-95"
            title="Xem trước mẫu in đơn hàng mới nhất"
          >
            <Printer className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            <span className="hidden md:inline">Mẫu In</span>
          </button>
        </div>

        {/* GROUP 2: System Settings & Role Group */}
        <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 p-0.5 border border-slate-200 dark:border-slate-700/70 shadow-sm">
          {/* Dark / Light Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-all active:scale-95"
            title={theme === 'dark' ? 'Chuyển sang Chế độ Sáng (Light Mode)' : 'Chuyển sang Chế độ Tối (Dark Mode)'}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-4 w-4 text-amber-400 animate-in spin-in-90 duration-200" />
                <span className="hidden lg:inline text-[11px] text-amber-300">Sáng</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-indigo-600 animate-in spin-in-90 duration-200" />
                <span className="hidden lg:inline text-[11px] text-indigo-600">Tối</span>
              </>
            )}
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 my-auto" />

          {/* Fast Role Switcher (1-Click) */}
          <button
            onClick={toggleRole}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              role === 'admin'
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60'
                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
            }`}
            title="Chuyển đổi vai trò: Quản trị viên (Admin) vs Thu ngân (Cashier)"
          >
            {role === 'admin' ? (
              <>
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="hidden sm:inline">Admin</span>
              </>
            ) : (
              <>
                <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Thu Ngân</span>
              </>
            )}
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 my-auto" />

          {/* Telegram Alerts Dropdown Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
              className="relative p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Thông báo cảnh báo Telegram"
            >
              <Bell className="h-4 w-4" />
              {telegramAlerts.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white animate-pulse">
                  {telegramAlerts.length}
                </span>
              )}
            </button>

            {showAlertsDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-2xl p-4 space-y-3 z-50 animate-in fade-in duration-150 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Radio className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
                    Kênh Cảnh Báo Telegram Dispatch (0đ)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Live Sync</span>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {telegramAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 dark:bg-slate-800/60 dark:border-slate-700/60"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{alert.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{alert.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">{alert.message}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between items-center text-[10px] text-slate-500">
                  <span>Nhóm: Ban Giám Đốc & Kế Toán</span>
                  <button
                    onClick={() => setShowAlertsDropdown(false)}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Profile & Menu Dropdown */}
        <div className="relative pl-2 border-l border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left"
            title="Thông tin tài khoản & Đăng xuất"
          >
            <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center justify-center text-xs font-bold border border-indigo-200 dark:border-indigo-800 shadow-xs">
              {role === 'admin' ? 'AD' : 'TN'}
            </div>
            <div className="hidden lg:block text-left text-xs">
              <div className="font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-1">
                <span>{currentUser?.name || (role === 'admin' ? 'Trần Hoàng Nam' : 'Nguyễn Văn Hùng')}</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </div>
              <div className="text-[10px] text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {role === 'admin' ? 'Quản Trị Viên' : 'Thu Ngân'} (Ca sáng)
              </div>
            </div>
          </button>

          {/* User Profile Dropdown */}
          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-2xl p-4 space-y-3 z-50 animate-in fade-in duration-150 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
              <div className="flex items-start gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="h-10 w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-600/20 shrink-0">
                  {role === 'admin' ? 'AD' : 'TN'}
                </div>
                <div className="truncate">
                  <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {currentUser?.name || (role === 'admin' ? 'Trần Hoàng Nam' : 'Nguyễn Văn Hùng')}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                    {currentUser?.email || (role === 'admin' ? 'admin@nexus-erp.vn' : 'thungan@nexus-erp.vn')}
                  </div>
                  <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium truncate pt-0.5">
                    {currentUser?.businessName || 'Tập Đoàn Phân Phối NEXUS'}
                  </div>
                </div>
              </div>

              {/* Menu Actions */}
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setActiveView('auth');
                    setShowUserDropdown(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <KeyRound className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Màn Hình Xác Thực (Auth View)</span>
                </button>

                <button
                  onClick={() => {
                    toggleRole();
                    setShowUserDropdown(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Đổi vai trò ({role === 'admin' ? 'Sang Thu Ngân' : 'Sang Admin'})</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/70 text-xs font-bold transition-all"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Đăng Xuất Khỏi Hệ Thống</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

