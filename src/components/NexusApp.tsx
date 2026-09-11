"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ERPProvider, useERP } from '@/context/ERPContext';
import { getViewFromSlug, getPathFromView } from '@/lib/routes';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { UnauthorizedView } from '@/components/common/UnauthorizedView';
import { ROLE_CONFIG, PermissionKey } from '@/types/erp';

// Lightweight Shimmer Skeleton for smooth view transitions during code splitting
const ViewSkeleton: React.FC<{ title?: string }> = ({ title }) => (
  <div className="p-6 space-y-4 animate-in fade-in duration-150">
    <div className="flex items-center justify-between">
      <div className="space-y-1.5">
        <div className="h-6 w-48 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="h-3 w-64 rounded bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
      </div>
      <div className="h-9 w-28 rounded-lg bg-indigo-500/20 animate-pulse" />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
      ))}
    </div>
    <div className="h-96 rounded-2xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 animate-pulse" />
  </div>
);

// Dynamic Lazy-Loaded Views for High-Performance Code Splitting (Bundle Reduction)
const DashboardView = dynamic(() => import('@/components/views/DashboardView').then(m => m.DashboardView), {
  loading: () => <ViewSkeleton title="Dashboard" />
});
const POSView = dynamic(() => import('@/components/views/POSView').then(m => m.POSView), {
  loading: () => <ViewSkeleton title="Bán Hàng POS" />
});
const OrderManagementView = dynamic(() => import('@/components/views/OrderManagementView').then(m => m.OrderManagementView), {
  loading: () => <ViewSkeleton title="Đơn Hàng" />
});
const ShiftView = dynamic(() => import('@/components/views/ShiftView').then(m => m.ShiftView), {
  loading: () => <ViewSkeleton title="Ca Bán" />
});
const WarehouseView = dynamic(() => import('@/components/views/WarehouseView').then(m => m.WarehouseView), {
  loading: () => <ViewSkeleton title="Kho Hàng & ĐVT" />
});
const CustomerView = dynamic(() => import('@/components/views/CustomerView').then(m => m.CustomerView), {
  loading: () => <ViewSkeleton title="Khách Hàng" />
});
const DebtAgingView = dynamic(() => import('@/components/views/DebtAgingView').then(m => m.DebtAgingView), {
  loading: () => <ViewSkeleton title="Công Nợ" />
});
const CashFlowView = dynamic(() => import('@/components/views/CashFlowView').then(m => m.CashFlowView), {
  loading: () => <ViewSkeleton title="Thu Chi" />
});
const ApprovalsBoardView = dynamic(() => import('@/components/views/ApprovalsBoardView').then(m => m.ApprovalsBoardView), {
  loading: () => <ViewSkeleton title="Xét Duyệt Tín Dụng" />
});
const SettingsView = dynamic(() => import('@/components/views/SettingsView').then(m => m.SettingsView), {
  loading: () => <ViewSkeleton title="Cài Đặt" />
});
const AuthView = dynamic(() => import('@/components/views/AuthView').then(m => m.AuthView), {
  loading: () => <ViewSkeleton title="Đăng Nhập" />
});
const ProductView = dynamic(() => import('@/components/views/ProductView').then(m => m.ProductView), {
  loading: () => <ViewSkeleton title="Sản Phẩm" />
});
const EmployeeView = dynamic(() => import('@/components/views/EmployeeView').then(m => m.EmployeeView), {
  loading: () => <ViewSkeleton title="Nhân Viên" />
});
const SupplierView = dynamic(() => import('@/components/views/SupplierView').then(m => m.SupplierView), {
  loading: () => <ViewSkeleton title="Nhà Cung Cấp" />
});
const InventoryView = dynamic(() => import('@/components/views/InventoryView').then(m => m.InventoryView), {
  loading: () => <ViewSkeleton title="Xuất Nhập Tồn & Kiểm Kê" />
});
const ReturnView = dynamic(() => import('@/components/views/ReturnView').then(m => m.ReturnView), {
  loading: () => <ViewSkeleton title="Đổi Trả Hàng" />
});
const WarrantyView = dynamic(() => import('@/components/views/WarrantyView').then(m => m.WarrantyView), {
  loading: () => <ViewSkeleton title="Bảo Hành" />
});
const SerialManagementView = dynamic(() => import('@/components/views/SerialManagementView').then(m => m.SerialManagementView), {
  loading: () => <ViewSkeleton title="Serial/IMEI" />
});
const SalesReportView = dynamic(() => import('@/components/views/SalesReportView').then(m => m.SalesReportView), {
  loading: () => <ViewSkeleton title="Báo Cáo Doanh Thu" />
});
const InternalChatView = dynamic(() => import('@/components/views/InternalChatView').then(m => m.InternalChatView), {
  loading: () => <ViewSkeleton title="Chat Nội Bộ" />
});

// Dynamic Lazy Modals & Drawers
const VietQRModal = dynamic(() => import('@/components/modals/VietQRModal').then(m => m.VietQRModal), { ssr: false });
const ManagerPinModal = dynamic(() => import('@/components/modals/ManagerPinModal').then(m => m.ManagerPinModal), { ssr: false });
const BarcodeScannerModal = dynamic(() => import('@/components/modals/BarcodeScannerModal').then(m => m.BarcodeScannerModal), { ssr: false });
const PrintSuiteModal = dynamic(() => import('@/components/modals/PrintSuiteModal').then(m => m.PrintSuiteModal), { ssr: false });
const CreditApprovalDrawer = dynamic(() => import('@/components/modals/CreditApprovalDrawer').then(m => m.CreditApprovalDrawer), { ssr: false });
const InternalChatWidget = dynamic(() => import('@/components/chat/InternalChatWidget').then(m => m.InternalChatWidget), { ssr: false });

interface NexusAppProps {
  initialView?: string;
}

const VIEW_PERMISSIONS: Record<string, PermissionKey> = {
  dashboard: 'view_dashboard',
  pos: 'pos_sales',
  orders: 'manage_orders',
  returns: 'manage_returns',
  shift: 'cash_shift',
  products: 'manage_products',
  inventory: 'manage_inventory',
  warehouse: 'manage_warehouse',
  serials: 'manage_serials',
  warranty: 'manage_warranty',
  customers: 'manage_customers',
  suppliers: 'manage_suppliers',
  debt_aging: 'manage_debt_aging',
  employees: 'manage_employees',
  cashflow: 'manage_cashflow',
  approvals: 'manage_approvals',
  reports: 'view_reports',
  settings: 'system_settings',
};

const MainLayout: React.FC<NexusAppProps> = ({ initialView = 'dashboard' }) => {
  const { activeToast, isAuthenticated, role, hasPermission } = useERP();
  const [activeView, setActiveView] = useState<string>(initialView);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [approvalDrawerId, setApprovalDrawerId] = useState<string | null>(null);

  // Navigate to a view and synchronize browser URL without full reload
  const navigateToView = (view: string, updateHistory = true) => {
    setActiveView(view);
    if (updateHistory && typeof window !== 'undefined') {
      const targetPath = getPathFromView(view);
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ view }, '', targetPath);
      }
    }
  };

  // Synchronize on mount from current URL pathname & handle Back/Forward browser buttons
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (currentPath && currentPath !== '/') {
        const detected = getViewFromSlug(currentPath);
        if (detected && detected !== activeView) {
          setActiveView(detected);
        }
      }
    }

    const handlePopState = (e: PopStateEvent) => {
      if (typeof window !== 'undefined') {
        const viewFromState = e.state?.view;
        const detected = viewFromState || getViewFromSlug(window.location.pathname);
        if (detected) {
          setActiveView(detected);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-screen bg-slate-50 text-slate-900 dark:bg-[#0B0F19] dark:text-slate-100 font-sans antialiased transition-colors duration-200">
        <AuthView onSuccess={() => navigateToView(ROLE_CONFIG[role]?.defaultView || 'dashboard')} />
        {activeToast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-white/95 text-slate-900 border border-indigo-200 dark:bg-slate-900/95 dark:text-white dark:border-indigo-500/50 px-5 py-3.5 shadow-2xl backdrop-blur-md text-xs font-semibold animate-in slide-in-from-bottom duration-200">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="leading-snug">{activeToast}</span>
          </div>
        )}
      </div>
    );
  }

  const renderActiveView = () => {
    // Check permission for current view
    const requiredPermission = VIEW_PERMISSIONS[activeView];
    if (requiredPermission && !hasPermission(requiredPermission) && activeView !== 'auth') {
      return (
        <UnauthorizedView
          onGoHome={() => navigateToView(ROLE_CONFIG[role]?.defaultView || 'dashboard')}
          requiredPermission={requiredPermission}
        />
      );
    }

    switch (activeView) {
      case 'dashboard':
        return <DashboardView onNavigate={(view) => navigateToView(view)} />;
      case 'pos':
        return <POSView />;
      case 'orders':
        return (
          <OrderManagementView
            onOpenApprovalDrawer={(id) => setApprovalDrawerId(id)}
          />
        );
      case 'returns':
        return <ReturnView />;
      case 'shift':
        return <ShiftView />;
      case 'products':
        return <ProductView initialTab="products" />;
      case 'categories':
        return <ProductView initialTab="categories" />;
      case 'units':
        return <ProductView initialTab="units" />;
      case 'inventory':
        return <InventoryView />;
      case 'warehouse':
        return <WarehouseView />;
      case 'serials':
        return <SerialManagementView />;
      case 'warranty':
        return <WarrantyView />;
      case 'customers':
        return <CustomerView />;
      case 'suppliers':
        return <SupplierView />;
      case 'employees':
        return <EmployeeView />;
      case 'debt_aging':
        return <DebtAgingView />;
      case 'cashflow':
        return <CashFlowView />;
      case 'reports':
        return <SalesReportView />;
      case 'approvals':
        return (
          <ApprovalsBoardView
            onOpenDrawer={(id) => setApprovalDrawerId(id)}
          />
        );
      case 'settings':
        return <SettingsView />;
      case 'internal_chat':
      case 'chat':
        return <InternalChatView />;
      case 'auth':
        return <AuthView onSuccess={() => navigateToView(ROLE_CONFIG[role]?.defaultView || 'dashboard')} />;
      default:
        return <DashboardView onNavigate={(view) => navigateToView(view)} />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-[#0B0F19] dark:text-slate-100 font-sans antialiased transition-colors duration-200">
      {/* 1. Collapsible Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        setActiveView={navigateToView}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* 2. Main Content Stage */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <Header
          activeView={activeView}
          setActiveView={navigateToView}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        {/* Dynamic Viewport Container */}
        <main className="flex-1 overflow-y-auto bg-slate-100/70 dark:bg-[#0B0F19] transition-colors duration-200">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <VietQRModal />
      <ManagerPinModal />
      <BarcodeScannerModal />
      <PrintSuiteModal />
      <CreditApprovalDrawer
        requestId={approvalDrawerId}
        onClose={() => setApprovalDrawerId(null)}
      />

      {/* Internal Team Chatbox Widget */}
      <InternalChatWidget onExpandToView={() => navigateToView('internal_chat')} />

      {/* Global Toast Notification */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-white/95 text-slate-900 border border-indigo-200 dark:bg-slate-900/95 dark:text-white dark:border-indigo-500/50 px-5 py-3 shadow-2xl backdrop-blur-md text-xs font-semibold animate-in slide-in-from-bottom duration-200">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span>{activeToast}</span>
        </div>
      )}
    </div>
  );
};

export default function NexusApp({ initialView = 'dashboard' }: NexusAppProps) {
  return (
    <ERPProvider>
      <MainLayout initialView={initialView} />
    </ERPProvider>
  );
}
