"use client";
import React, { useState, useEffect } from 'react';
import { useERP } from '../../context/ERPContext';
import { UserRole, PermissionKey, ROLE_CONFIG } from '../../types/erp';
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  RotateCcw,
  Clock,
  Package,
  CalendarDays,
  QrCode,
  Users,
  TrendingDown,
  Wallet,
  MessageSquare,
  Settings,
  Shield,
  ShieldCheck,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Printer,
  Sparkles,
  KeyRound,
  LogOut,
  Truck,
  Boxes,
  UserCheck,
  Tag,
  Building2,
  Barcode,
  Wrench,
  BarChart3,
  Store,
  Warehouse,
  Layers,
  Ruler,
  X
} from 'lucide-react';
import { RoleTourModal } from '../common/RoleTourModal';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
  badge?: string | number | undefined;
  badgeColor?: string;
  permission?: PermissionKey;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

interface Props {
  activeView: string;
  setActiveView: (view: string) => void;
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<Props> = ({
  activeView,
  setActiveView,
  collapsed,
  setCollapsed,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const { role, hasPermission, approvalRequests, currentShift, resetAllData, currentUser, logout, warranties, unreadChatCount } = useERP();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isRoleTourOpen, setIsRoleTourOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const pendingApprovalsCount = approvalRequests.filter(r => r.status === 'pending').length;
  const activeWarrantiesCount = warranties.filter(w => ['receiving', 'inspecting', 'repairing', 'waiting_parts'].includes(w.status)).length;

  const navItems: NavGroup[] = [
    {
      group: 'TỔNG QUAN',
      items: [
        { id: 'dashboard', label: 'Dashboard Điều Hành', icon: LayoutDashboard, permission: 'view_dashboard' as PermissionKey }
      ]
    },
    {
      group: 'BÁN HÀNG & THỰC ĐỊA',
      items: [
        { id: 'pos', label: 'Bàn POS Đa Đơn', icon: ShoppingCart, highlight: true, permission: 'pos_sales' as PermissionKey },
        { id: 'orders', label: 'Danh Sách Đơn Hàng', icon: Receipt, permission: 'manage_orders' as PermissionKey },
        { id: 'returns', label: 'Quản Lý Trả Hàng', icon: RotateCcw, permission: 'manage_returns' as PermissionKey },
        { id: 'shift', label: 'Chốt Ca Thu Ngân', icon: Clock, permission: 'cash_shift' as PermissionKey }
      ]
    },
    {
      group: 'SẢN PHẨM & KHO VẬT TƯ',
      items: [
        { id: 'products', label: 'Danh Mục Sản Phẩm', icon: Tag, permission: 'manage_products' as PermissionKey },
        { id: 'categories', label: 'Nhóm Sản Phẩm', icon: Layers, permission: 'manage_products' as PermissionKey },
        { id: 'units', label: 'Đơn Vị Tính (ĐVT)', icon: Ruler, permission: 'manage_products' as PermissionKey },
        { id: 'inventory', label: 'Xuất Nhập Tồn & Kiểm Kê', icon: Boxes, permission: 'manage_inventory' as PermissionKey },
        { id: 'warehouse', label: 'Quy Đổi ĐVT & Lô FEFO', icon: Package, permission: 'manage_warehouse' as PermissionKey },
        { id: 'serials', label: 'Quản Lý Serial / IMEI', icon: Barcode, permission: 'manage_serials' as PermissionKey }
      ]
    },
    {
      group: 'DỊCH VỤ & BẢO HÀNH',
      items: [
        {
          id: 'warranty',
          label: 'Quản Lý Bảo Hành & RMA',
          icon: Wrench,
          badge: activeWarrantiesCount > 0 ? `${activeWarrantiesCount}` : undefined,
          badgeColor: 'bg-indigo-600 text-white',
          permission: 'manage_warranty' as PermissionKey
        }
      ]
    },
    {
      group: 'ĐỐI TÁC & CÔNG NỢ',
      items: [
        { id: 'customers', label: 'Khách Hàng & Credit Guard', icon: Users, permission: 'manage_customers' as PermissionKey },
        { id: 'suppliers', label: 'Nhà Cung Cấp & Nợ NCC', icon: Truck, permission: 'manage_suppliers' as PermissionKey },
        { id: 'debt_aging', label: 'Báo Cáo Tuổi Nợ', icon: TrendingDown, permission: 'manage_debt_aging' as PermissionKey }
      ]
    },
    {
      group: 'NHÂN SỰ & TỔ CHỨC',
      items: [
        { id: 'employees', label: 'Quản Lý Nhân Viên', icon: UserCheck, permission: 'manage_employees' as PermissionKey }
      ]
    },
    {
      group: 'TÀI CHÍNH & PHÊ DUYỆT',
      items: [
        { id: 'cashflow', label: 'Sổ Quỹ Thu Chi', icon: Wallet, permission: 'manage_cashflow' as PermissionKey },
        {
          id: 'approvals',
          label: 'Thảo Luận Duyệt Nợ',
          icon: MessageSquare,
          badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount}` : undefined,
          badgeColor: 'bg-rose-500 text-white animate-pulse',
          permission: 'manage_approvals' as PermissionKey
        }
      ]
    },
    {
      group: 'BÁO CÁO & THỐNG KÊ',
      items: [
        { id: 'reports', label: 'Báo Cáo Doanh Thu & VAT', icon: BarChart3, permission: 'view_reports' as PermissionKey }
      ]
    },
    {
      group: 'HỆ THỐNG',
      items: [
        { id: 'chat', label: 'Chat Nội Bộ', icon: MessageSquare, badge: unreadChatCount > 0 ? `${unreadChatCount}` : undefined, badgeColor: 'bg-indigo-600 text-white' },
        { id: 'settings', label: 'Cấu Hình & VietQR', icon: Settings, permission: 'system_settings' as PermissionKey },
        { id: 'auth', label: 'Xác Thực & Tài Khoản', icon: KeyRound }
      ]
    }
  ];

  // Filter navigation items strictly based on role permissions
  const visibleNavItems = navItems
    .map(group => ({
      ...group,
    }))
    .filter(group => group.items.length > 0);

  const currentRoleConfig = ROLE_CONFIG[role] || ROLE_CONFIG.cashier;

  const getRoleInitials = () => {
    switch (role) {
      case 'admin': return 'AD';
      case 'manager': return 'MN';
      case 'cashier': return 'TN';
      case 'warehouse': return 'TK';
      case 'accountant': return 'KT';
      default: return 'NV';
    }
  };



  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 md:static md:translate-x-0 flex flex-col h-screen bg-white text-slate-800 border-r border-slate-200 dark:bg-[#0E1320] dark:text-slate-200 dark:border-slate-800 transition-all duration-300 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        } ${collapsed ? 'w-20' : 'w-64'}`}
      >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200 dark:border-slate-800/80">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-black text-sm shadow-md shadow-indigo-500/20 shrink-0">
              NX
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-base whitespace-nowrap">NEXUS ERP</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 font-mono font-bold">
                v3.0
              </span>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-black text-sm shadow-md shadow-indigo-500/20">
            NX
          </div>
        )}

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-colors"
            title={collapsed ? 'Mở rộng menu' : 'Thu nhỏ menu'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-colors"
              title="Đóng menu điều hướng"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {visibleNavItems.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!collapsed && (
              <div className="px-2.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-1">
                {group.group}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    onCloseMobile?.();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
                  } ${collapsed ? 'justify-center px-0' : 'justify-between'}`}
                  title={item.label}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!collapsed && item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold font-mono ${
                        (item as { badgeColor?: string }).badgeColor || 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer System Status & Auth */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 dark:border-slate-800/80 dark:bg-slate-950/50 space-y-2 text-xs">
        {!collapsed ? (
          <>
            <div
              onClick={() => setIsRoleTourOpen(true)}
              className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xs transition-all cursor-pointer group"
              title="Nhấn để đổi vai trò trải nghiệm (Role Tour RBAC)"
            >
              <div className="flex items-center gap-2 truncate">
                <div className="h-7 w-7 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold flex items-center justify-center text-xs shrink-0 group-hover:scale-105 transition-transform">
                  {getRoleInitials()}
                </div>
                <div className="truncate text-left">
                  <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate flex items-center gap-1">
                    <span>{currentUser?.name || 'Người Dùng ERP'}</span>
                    <Sparkles className="w-2.5 h-2.5 text-indigo-500 shrink-0" />
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {currentUser?.roleTitle || currentRoleConfig.title}
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  logout();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
                title="Đăng xuất khỏi hệ thống"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] pt-0.5">
              <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{currentTime}</span>
              <button
                onClick={resetAllData}
                className="text-[10px] text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors"
                title="Khôi phục dữ liệu mẫu ban đầu"
              >
                <RotateCcw className="h-3 w-3" /> Reset Data
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={logout}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="h-4 w-4" />
            </button>
            <button
              onClick={resetAllData}
              className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
              title="Reset Data"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>

    {/* Role Tour Modal */}
    <RoleTourModal isOpen={isRoleTourOpen} onClose={() => setIsRoleTourOpen(false)} />
    </>
  );
};

