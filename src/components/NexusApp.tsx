"use client";

import React, { useState } from 'react';
import { ERPProvider, useERP } from '@/context/ERPContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { VietQRModal } from '@/components/modals/VietQRModal';
import { ManagerPinModal } from '@/components/modals/ManagerPinModal';
import { BarcodeScannerModal } from '@/components/modals/BarcodeScannerModal';
import { PrintSuiteModal } from '@/components/modals/PrintSuiteModal';
import { CreditApprovalDrawer } from '@/components/modals/CreditApprovalDrawer';

// Views
import { DashboardView } from '@/components/views/DashboardView';
import { POSView } from '@/components/views/POSView';
import { OrderManagementView } from '@/components/views/OrderManagementView';
import { ShiftView } from '@/components/views/ShiftView';
import { WarehouseView } from '@/components/views/WarehouseView';
import { CustomerView } from '@/components/views/CustomerView';
import { DebtAgingView } from '@/components/views/DebtAgingView';
import { CashFlowView } from '@/components/views/CashFlowView';
import { ApprovalsBoardView } from '@/components/views/ApprovalsBoardView';
import { SettingsView } from '@/components/views/SettingsView';
import { AuthView } from '@/components/views/AuthView';
import { ProductView } from '@/components/views/ProductView';
import { EmployeeView } from '@/components/views/EmployeeView';
import { SupplierView } from '@/components/views/SupplierView';
import { InventoryView } from '@/components/views/InventoryView';
import { ReturnView } from '@/components/views/ReturnView';
import { WarrantyView } from '@/components/views/WarrantyView';
import { SerialManagementView } from '@/components/views/SerialManagementView';
import { SalesReportView } from '@/components/views/SalesReportView';

interface NexusAppProps {
  initialView?: string;
}

const MainLayout: React.FC<NexusAppProps> = ({ initialView = 'dashboard' }) => {
  const { activeToast, isAuthenticated } = useERP();
  const [activeView, setActiveView] = useState<string>(initialView);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [approvalDrawerId, setApprovalDrawerId] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-screen bg-slate-50 text-slate-900 dark:bg-[#0B0F19] dark:text-slate-100 font-sans antialiased transition-colors duration-200">
        <AuthView onSuccess={() => setActiveView('dashboard')} />
        {activeToast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-white/95 text-slate-900 border border-indigo-200 dark:bg-slate-900/95 dark:text-white dark:border-indigo-500/50 px-5 py-3 shadow-2xl backdrop-blur-md text-xs font-semibold animate-in slide-in-from-bottom duration-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span>{activeToast}</span>
          </div>
        )}
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView onNavigate={(view) => setActiveView(view)} />;
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
        return <ProductView />;
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
      case 'auth':
        return <AuthView onSuccess={() => setActiveView('dashboard')} />;
      default:
        return <DashboardView onNavigate={(view) => setActiveView(view)} />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-[#0B0F19] dark:text-slate-100 font-sans antialiased transition-colors duration-200">
      {/* 1. Collapsible Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* 2. Main Content Stage */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <Header activeView={activeView} setActiveView={setActiveView} />

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
