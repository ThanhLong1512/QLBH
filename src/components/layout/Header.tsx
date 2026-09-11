"use client";
import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { UserRole, ROLE_CONFIG } from '../../types/erp';
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
  KeyRound,
  Store,
  Warehouse,
  Wallet,
  Check,
  MessageSquare,
  Menu,
  Sparkles
} from 'lucide-react';
import { RoleTourModal } from '../common/RoleTourModal';

interface Props {
  activeView: string;
  setActiveView: (view: string) => void;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<Props> = ({ activeView, setActiveView, onToggleMobileMenu }) => {
  const {
    theme,
    toggleTheme,
    role,
    canViewCosts,
    telegramAlerts,
    openScannerModal,
    openPrintModal,
    orders,
    currentShift,
    currentUser,
    logout,
    unreadChatCount,
    isChatOpen,
    setIsChatOpen,
    warehouses,
    activeWarehouse,
    setActiveWarehouse,
    showToast
  } = useERP();

  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showWarehouseDropdown, setShowWarehouseDropdown] = useState(false);
  const [isRoleTourOpen, setIsRoleTourOpen] = useState(false);

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
    settings: { title: 'Cấu Hình Hệ Thống & Cổng VietQR', subtitle: 'Tùy chỉnh thông tin tài khoản ngân hàng, mã PIN & Telegram Webhook' },
    internal_chat: { title: 'Phòng Chat Nội Bộ Doanh Nghiệp', subtitle: 'Kênh trao đổi công việc tức thời giữa các bộ phận Bán Hàng, Kho Vận, Kế Toán' },
    chat: { title: 'Phòng Chat Nội Bộ Doanh Nghiệp', subtitle: 'Kênh trao đổi công việc tức thời giữa các bộ phận Bán Hàng, Kho Vận, Kế Toán' }
  };

  const currentInfo = viewTitles[activeView] || { title: 'NEXUS ERP', subtitle: 'Hệ thống vận hành doanh nghiệp' };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 text-slate-800 dark:border-slate-800 dark:bg-[#0B0F19]/95 dark:text-white backdrop-blur px-4 sm:px-6 transition-colors duration-200">
      {/* Title & Context & Mobile Hamburger Button */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 mr-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="p-1.5 -ml-1 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden transition-colors border border-slate-200 dark:border-slate-700/70 shrink-0"
            title="Mở menu điều hướng"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 truncate whitespace-nowrap">
            <span className="truncate">{currentInfo.title}</span>
            {!canViewCosts && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium hidden sm:inline whitespace-nowrap shrink-0">
                Chế độ Thu Ngân
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden md:block truncate whitespace-nowrap max-w-[320px] lg:max-w-[480px]">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Action Controls - Single Horizontal Row (1 Hàng Ngang) */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* GROUP 0: Active Warehouse Switcher */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowWarehouseDropdown(!showWarehouseDropdown)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/70 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 shadow-xs transition-all active:scale-95 whitespace-nowrap"
            title="Kho hàng đang làm việc (Click để đổi kho)"
          >
            <Store className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span className="hidden sm:inline font-bold text-slate-900 dark:text-white max-w-[140px] truncate whitespace-nowrap">
              {activeWarehouse?.name || 'Chọn Kho'}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400 shrink-0" />
          </button>

          {showWarehouseDropdown && (
            <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-64 rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-2xl p-2.5 space-y-1 z-50 animate-in fade-in duration-150 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
              <div className="px-2 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Chọn Kho Làm Việc</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-mono">
                  {warehouses.length} kho
                </span>
              </div>
              <div className="max-h-56 overflow-y-auto space-y-1 pt-1">
                {warehouses.map(w => {
                  const isCurrent = activeWarehouse?.id === w.id;
                  return (
                    <button
                      key={w.id}
                      onClick={() => {
                        setActiveWarehouse(w);
                        setShowWarehouseDropdown(false);
                        showToast(`🏭 Đã chuyển làm việc tại: ${w.name}`);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all ${
                        isCurrent
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800/80'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {w.code}
                          </span>
                          <span className="truncate font-semibold">{w.name}</span>
                        </div>
                        {w.isDefault && (
                          <span className="text-[10px] text-amber-500 font-normal">★ Kho chính</span>
                        )}
                      </div>
                      {isCurrent && <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* GROUP 1: POS Quick Actions Group */}
        <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 p-0.5 border border-slate-200 dark:border-slate-700/70 shadow-sm shrink-0">
          <button
            onClick={() => openScannerModal(() => {
              setActiveView('pos');
            })}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xs transition-all active:scale-95 whitespace-nowrap"
            title="Mở máy quét mã vạch Barcode/QR từ Camera"
          >
            <ScanBarcode className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
            <span className="hidden md:inline whitespace-nowrap">Quét Mã</span>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 my-auto" />

          <button
            onClick={() => {
              const lastOrder = orders[0];
              if (lastOrder) {
                openPrintModal('k80', lastOrder);
              }
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xs transition-all active:scale-95 whitespace-nowrap"
            title="Xem trước mẫu in đơn hàng mới nhất"
          >
            <Printer className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
            <span className="hidden md:inline whitespace-nowrap">Mẫu In</span>
          </button>
        </div>

        {/* Telegram Alerts Dropdown Trigger */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
            className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/70 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all shadow-xs active:scale-95 cursor-pointer"
            title="Thông báo cảnh báo Telegram"
          >
            <Bell className="h-4 w-4" />
            {telegramAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white animate-pulse">
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

        {/* Role Tour Switcher Button (Thử Nghiệm Đa Vai Trò) */}
        <button
          onClick={() => setIsRoleTourOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/90 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all shrink-0 cursor-pointer shadow-2xs active:scale-95"
          title="Trải nghiệm đổi vai trò người dùng (Admin, Thu ngân, Thủ kho, Kế toán, Quản lý)"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span className="hidden md:inline font-semibold">Vai trò:</span>
          <span className="font-bold">{role === 'admin' ? 'Admin' : role === 'cashier' ? 'Thu Ngân' : role === 'warehouse' ? 'Thủ Kho' : role === 'accountant' ? 'Kế Toán' : 'Quản Lý'}</span>
          <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
        </button>

        {/* User Profile & Menu Dropdown (Single Horizontal Row) */}
        <div className="relative pl-1.5 border-l border-slate-200 dark:border-slate-800 shrink-0">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left whitespace-nowrap cursor-pointer"
            title="Thông tin tài khoản & Cài đặt"
          >
            <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center justify-center text-xs font-bold border border-indigo-200 dark:border-indigo-800 shadow-xs shrink-0">
              {role === 'admin' ? 'AD' : role === 'manager' ? 'MN' : role === 'cashier' ? 'TN' : role === 'warehouse' ? 'TK' : 'KT'}
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs">
              <span className="font-bold text-slate-900 dark:text-white whitespace-nowrap">
                {currentUser?.name || 'Người Dùng ERP'}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            </div>
          </button>

          {/* User Profile Dropdown */}
          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-2xl p-4 space-y-3 z-50 animate-in fade-in duration-150 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
              <div className="flex items-start gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="h-10 w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-600/20 shrink-0">
                  {role === 'admin' ? 'AD' : role === 'manager' ? 'MN' : role === 'cashier' ? 'TN' : role === 'warehouse' ? 'TK' : 'KT'}
                </div>
                <div className="truncate">
                  <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {currentUser?.name || 'Người Dùng ERP'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                    {currentUser?.email || 'user@nexus-erp.vn'}
                  </div>
                  <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium truncate pt-0.5">
                    {currentUser?.businessName || 'Tập Đoàn Phân Phối NEXUS'}
                  </div>
                </div>
              </div>

              {/* Account Role & System Permission Info with Tour Switcher Link */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Vai Trò & Quyền Hạn</span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserDropdown(false);
                      setIsRoleTourOpen(true);
                    }}
                    className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <Sparkles className="w-2.5 h-2.5" /> Đổi vai trò demo
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    {currentUser?.roleTitle || ROLE_CONFIG[role].label}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                    {role === 'admin' ? 'Toàn quyền Admin' : 'Quyền theo RBAC'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  {role === 'admin' 
                    ? 'Bạn có toàn bộ đặc quyền quản trị và vận hành toàn hệ thống.' 
                    : ROLE_CONFIG[role].description}
                </p>
              </div>

              {/* Dark / Light Mode Toggle inside User Profile Menu */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'bg-amber-400/15 text-amber-400 border border-amber-400/20'
                      : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                  }`}>
                    {theme === 'dark' ? (
                      <Moon className="h-4 w-4" />
                    ) : (
                      <Sun className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Chế Độ Giao Diện
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      {theme === 'dark' ? 'Đang bật Giao diện Tối (Dark)' : 'Đang bật Giao diện Sáng (Light)'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  role="switch"
                  aria-checked={theme === 'dark'}
                  title={theme === 'dark' ? 'Chuyển sang Chế độ Sáng' : 'Chuyển sang Chế độ Tối'}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Menu Actions */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
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

      {/* Role Tour Modal */}
      <RoleTourModal isOpen={isRoleTourOpen} onClose={() => setIsRoleTourOpen(false)} />
    </header>
  );
};

