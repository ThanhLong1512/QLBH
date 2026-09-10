"use client";
import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { WarrantyTicket, WarrantyTicketStatus, WarrantyServiceRecord } from '../../types/erp';
import { Pagination } from '../common/Pagination';
import {
  ShieldCheck,
  Wrench,
  Search,
  Filter,
  Plus,
  Download,
  Calendar,
  Clock,
  User,
  Phone,
  Barcode,
  Package,
  CheckCircle2,
  AlertTriangle,
  X,
  Printer,
  ChevronRight,
  FileText,
  DollarSign,
  Layers,
  ArrowRight,
  Trash2,
  Cpu
} from 'lucide-react';

export const WarrantyView: React.FC = () => {
  const {
    warranties,
    addWarranty,
    updateWarranty,
    deleteWarranty,
    addWarrantyServiceRecord,
    customers,
    products,
    serials,
    employees,
    currentUser,
    canExportExcel,
    showToast
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | WarrantyTicketStatus>('all');
  const [warrantyTypeFilter, setWarrantyTypeFilter] = useState<'all' | 'under_warranty' | 'service'>('all');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<WarrantyTicket | null>(null);
  const [printTicket, setPrintTicket] = useState<WarrantyTicket | null>(null);

  // Create Form State
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    customerPhone: '',
    productId: '',
    productName: '',
    sku: '',
    serialNumber: '',
    orderCode: '',
    issueDescription: '',
    accessoriesAttached: 'Thân máy, hộp, cáp sạc',
    technicianName: employees[0]?.name || 'Nguyễn Văn Hùng',
    isUnderWarranty: true,
    estimatedReturnDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    repairCost: 0,
    sparePartsCost: 0,
    notes: ''
  });

  // Add Service Record Sub-form state inside Detail Modal
  const [newServiceAction, setNewServiceAction] = useState('');
  const [newSpareParts, setNewSpareParts] = useState('');
  const [newServiceCost, setNewServiceCost] = useState<number>(0);
  const [newServiceNotes, setNewServiceNotes] = useState('');

  // Status labels & badges styling
  const statusConfig: Record<WarrantyTicketStatus, { label: string; badge: string; icon: any }> = {
    receiving: {
      label: 'Mới tiếp nhận',
      badge: 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
      icon: Clock
    },
    inspecting: {
      label: 'Đang chẩn đoán',
      badge: 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
      icon: Search
    },
    repairing: {
      label: 'Đang sửa chữa',
      badge: 'bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
      icon: Wrench
    },
    waiting_parts: {
      label: 'Chờ linh kiện',
      badge: 'bg-orange-100 text-orange-800 dark:bg-orange-500/10 dark:text-orange-400 border-orange-200 dark:border-orange-500/20',
      icon: AlertTriangle
    },
    completed: {
      label: 'Sẵn sàng trả khách',
      badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
      icon: CheckCircle2
    },
    returned_to_customer: {
      label: 'Đã bàn giao khách',
      badge: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600',
      icon: CheckCircle2
    },
    canceled: {
      label: 'Hủy / Trả nguyên trạng',
      badge: 'bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
      icon: X
    }
  };

  // Metrics
  const activeCount = warranties.filter(w => ['receiving', 'inspecting', 'repairing'].includes(w.status)).length;
  const waitingPartsCount = warranties.filter(w => w.status === 'waiting_parts').length;
  const readyCount = warranties.filter(w => w.status === 'completed').length;
  const completedCount = warranties.filter(w => w.status === 'returned_to_customer').length;
  const totalRepairRevenue = warranties.reduce((acc, w) => acc + (w.totalCost || 0), 0);

  // Filtering
  const filteredWarranties = warranties.filter(w => {
    const matchStatus = statusFilter === 'all' || w.status === statusFilter;
    const matchType =
      warrantyTypeFilter === 'all' ||
      (warrantyTypeFilter === 'under_warranty' && w.isUnderWarranty) ||
      (warrantyTypeFilter === 'service' && !w.isUnderWarranty);

    const q = searchQuery.toLowerCase();
    const matchSearch =
      w.code.toLowerCase().includes(q) ||
      w.customerName.toLowerCase().includes(q) ||
      w.customerPhone.includes(q) ||
      w.productName.toLowerCase().includes(q) ||
      (w.serialNumber && w.serialNumber.toLowerCase().includes(q)) ||
      w.technicianName.toLowerCase().includes(q);

    return matchStatus && matchType && matchSearch;
  });

  const totalItems = filteredWarranties.length;
  const paginatedWarranties = filteredWarranties.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Quick fill customer data
  const handleSelectCustomer = (cId: string) => {
    const c = customers.find(item => item.id === cId);
    if (c) {
      setFormData(prev => ({
        ...prev,
        customerId: c.id,
        customerName: c.name,
        customerPhone: c.phone
      }));
    }
  };

  // Quick fill product data
  const handleSelectProduct = (pId: string) => {
    const p = products.find(item => item.id === pId);
    if (p) {
      setFormData(prev => ({
        ...prev,
        productId: p.id,
        productName: p.name,
        sku: p.sku
      }));
    }
  };

  // Quick fill serial data
  const handleSelectSerial = (sn: string) => {
    const s = serials.find(item => item.serialNumber === sn);
    if (s) {
      setFormData(prev => ({
        ...prev,
        serialNumber: s.serialNumber,
        sku: s.sku,
        productName: s.productName,
        customerName: s.customerName || prev.customerName,
        customerPhone: s.customerPhone || prev.customerPhone
      }));
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.customerPhone.trim()) {
      showToast('⚠️ Vui lòng nhập tên và số điện thoại khách hàng!');
      return;
    }
    if (!formData.productName.trim()) {
      showToast('⚠️ Vui lòng chọn hoặc nhập tên thiết bị cần bảo hành!');
      return;
    }

    const total = formData.repairCost + formData.sparePartsCost;

    addWarranty({
      customerName: formData.customerName.trim(),
      customerPhone: formData.customerPhone.trim(),
      customerId: formData.customerId || undefined,
      productId: formData.productId || 'custom-prod',
      productName: formData.productName.trim(),
      sku: formData.sku || 'SKU-CUSTOM',
      serialNumber: formData.serialNumber.trim() || undefined,
      orderCode: formData.orderCode.trim() || undefined,
      receivedDate: new Date().toISOString().slice(0, 10),
      estimatedReturnDate: formData.estimatedReturnDate,
      status: 'receiving',
      issueDescription: formData.issueDescription.trim(),
      accessoriesAttached: formData.accessoriesAttached.trim(),
      technicianName: formData.technicianName,
      isUnderWarranty: formData.isUnderWarranty,
      repairCost: formData.repairCost,
      sparePartsCost: formData.sparePartsCost,
      totalCost: total,
      serviceRecords: [
        {
          id: `rec-${Date.now()}`,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          technicianName: formData.technicianName,
          action: 'Tiếp nhận thiết bị & lập biên bản kiểm tra ngoại quan ban đầu',
          cost: 0,
          notes: formData.accessoriesAttached ? `Phụ kiện kèm theo: ${formData.accessoriesAttached}` : undefined
        }
      ],
      notes: formData.notes.trim()
    });

    setIsCreateModalOpen(false);
    // Reset form
    setFormData({
      customerId: '',
      customerName: '',
      customerPhone: '',
      productId: '',
      productName: '',
      sku: '',
      serialNumber: '',
      orderCode: '',
      issueDescription: '',
      accessoriesAttached: 'Thân máy, hộp, cáp sạc',
      technicianName: employees[0]?.name || 'Nguyễn Văn Hùng',
      isUnderWarranty: true,
      estimatedReturnDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      repairCost: 0,
      sparePartsCost: 0,
      notes: ''
    });
  };

  const handleUpdateStatus = (ticket: WarrantyTicket, newStatus: WarrantyTicketStatus) => {
    const updated = {
      ...ticket,
      status: newStatus,
      returnedDate: newStatus === 'returned_to_customer' ? new Date().toISOString().slice(0, 10) : ticket.returnedDate
    };
    updateWarranty(updated);
    if (selectedTicket?.id === ticket.id) {
      setSelectedTicket(updated);
    }
  };

  const handleAddServiceRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    if (!newServiceAction.trim()) {
      showToast('⚠️ Vui lòng nhập nội dung công việc xử lý kỹ thuật!');
      return;
    }

    const record: Omit<WarrantyServiceRecord, 'id'> = {
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      technicianName: selectedTicket.technicianName || currentUser?.name || 'Kỹ thuật viên',
      action: newServiceAction.trim(),
      spareParts: newSpareParts.trim() || undefined,
      cost: newServiceCost,
      notes: newServiceNotes.trim() || undefined
    };

    addWarrantyServiceRecord(selectedTicket.id, record);

    // Update local selected ticket
    const updatedRecords = [...selectedTicket.serviceRecords, { ...record, id: `rec-${Date.now()}` }];
    setSelectedTicket({
      ...selectedTicket,
      serviceRecords: updatedRecords,
      totalCost: selectedTicket.totalCost + newServiceCost
    });

    setNewServiceAction('');
    setNewSpareParts('');
    setNewServiceCost(0);
    setNewServiceNotes('');
  };

  const exportWarrantyReport = () => {
    if (!canExportExcel) {
      showToast('🔒 Bạn không có quyền xuất file! Chỉ dành cho Quản trị viên.');
      return;
    }

    const headers = [
      'Mã Phiếu',
      'Ngày Tiếp Nhận',
      'Khách Hàng',
      'Số Điện Thoại',
      'Thiết Bị',
      'Serial/IMEI',
      'Trạng Thái',
      'Loại Bảo Hành',
      'Lỗi Mô Tả',
      'Kỹ Thuật Viên',
      'Tổng Chi Phí (VNĐ)'
    ];

    const rows = filteredWarranties.map(w => [
      w.code,
      w.receivedDate,
      `"${w.customerName}"`,
      w.customerPhone,
      `"${w.productName}"`,
      w.serialNumber || '',
      statusConfig[w.status].label,
      w.isUnderWarranty ? 'Bảo hành miễn phí' : 'Sửa chữa có phí',
      `"${w.issueDescription}"`,
      w.technicianName,
      w.totalCost
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NEXUS_Bao_Hanh_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📥 Đã xuất báo cáo bảo hành ra CSV thành công!');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200 text-slate-800 dark:text-slate-100">
      {/* HEADER & TOP BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Quản Lý Bảo Hành & Dịch Vụ Sửa Chữa (RMA)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tiếp nhận, theo dõi quy trình bảo dưỡng kỹ thuật, thay thế linh kiện và bàn giao thiết bị
          </p>
        </div>

        {/* Action Group */}
        <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200 dark:border-slate-700 shadow-xs">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Tiếp Nhận Bảo Hành</span>
          </button>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1.5" />

          <button
            onClick={exportWarrantyReport}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 text-xs font-semibold transition-all"
            title="Xuất danh sách bảo hành ra Excel/CSV"
          >
            <Download className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">Đang Xử Lý / Sửa</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Wrench className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-mono font-black text-slate-900 dark:text-white mt-2">
            {activeCount} <span className="text-xs font-normal text-slate-400">phiếu</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Chẩn đoán, sửa chữa tại quầy</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase">Chờ Linh Kiện</span>
            <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-mono font-black text-orange-600 dark:text-orange-400 mt-2">
            {waitingPartsCount} <span className="text-xs font-normal text-slate-400">phiếu</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Đang đặt hàng phụ tùng thay thế</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Sẵn Sàng Trả Khách</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-mono font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {readyCount} <span className="text-xs font-normal text-slate-400">thiết bị</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Đã kiểm tra QC đạt chuẩn</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase">Doanh Thu Dịch Vụ</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-mono font-black text-purple-600 dark:text-purple-400 mt-2">
            {totalRepairRevenue.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-400">đ</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Tổng tiền công & phụ tùng</div>
        </div>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center bg-white dark:bg-slate-900/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 md:max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm theo mã phiếu PBH, Serial/IMEI, tên khách, số điện thoại..."
            className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Warranty Type Filter */}
          <select
            value={warrantyTypeFilter}
            onChange={(e) => {
              setWarrantyTypeFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 font-semibold focus:outline-none"
          >
            <option value="all">Tất cả loại bảo hành</option>
            <option value="under_warranty">🛡️ Bảo hành chính hãng (Free)</option>
            <option value="service">🔧 Sửa chữa dịch vụ (Có phí)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 font-semibold focus:outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="receiving">Mới tiếp nhận</option>
            <option value="inspecting">Đang chẩn đoán</option>
            <option value="repairing">Đang sửa chữa</option>
            <option value="waiting_parts">Chờ linh kiện</option>
            <option value="completed">Sẵn sàng trả khách</option>
            <option value="returned_to_customer">Đã bàn giao khách</option>
            <option value="canceled">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* TABLE LIST CONTAINER */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden">
        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-4">Mã Phiếu</th>
                <th className="p-4">Khách Hàng</th>
                <th className="p-4">Thiết Bị & Serial</th>
                <th className="p-4">Lỗi Tiếp Nhận</th>
                <th className="p-4">Kỹ Thuật Viên</th>
                <th className="p-4 text-center">Trạng Thái</th>
                <th className="p-4 text-right">Chi Phí</th>
                <th className="p-4 text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedWarranties.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 dark:text-slate-500">
                    Không tìm thấy phiếu bảo hành nào phù hợp.
                  </td>
                </tr>
              ) : (
                paginatedWarranties.map((w) => {
                  const statusInfo = statusConfig[w.status] || statusConfig.receiving;
                  const StatusIcon = statusInfo.icon;

                  return (
                    <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">{w.code}</div>
                        <div className="text-[11px] text-slate-400">{w.receivedDate}</div>
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{w.customerName}</div>
                        <div className="font-mono text-slate-500 text-[11px] flex items-center gap-1">
                          <Phone className="h-3 w-3 text-slate-400" />
                          {w.customerPhone}
                        </div>
                      </td>

                      <td className="p-4 max-w-xs">
                        <div className="font-medium text-slate-900 dark:text-white truncate">{w.productName}</div>
                        {w.serialNumber && (
                          <div className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 mt-0.5">
                            <Barcode className="h-3 w-3" />
                            {w.serialNumber}
                          </div>
                        )}
                        <div className="mt-1">
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                              w.isUnderWarranty
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                            }`}
                          >
                            {w.isUnderWarranty ? 'Bảo hành Free' : 'Sửa tính phí'}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 max-w-xs">
                        <div className="text-slate-700 dark:text-slate-300 font-medium line-clamp-2">
                          {w.issueDescription}
                        </div>
                        {w.accessoriesAttached && (
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">
                            Kèm: {w.accessoriesAttached}
                          </div>
                        )}
                      </td>

                      <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">
                        <div className="flex items-center gap-1.5">
                          <div className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-[10px]">
                            {w.technicianName.charAt(0)}
                          </div>
                          <span>{w.technicianName}</span>
                        </div>
                      </td>

                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusInfo.badge}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          <span>{statusInfo.label}</span>
                        </span>
                      </td>

                      <td className="p-4 text-right font-mono">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {w.totalCost.toLocaleString('vi-VN')} đ
                        </div>
                        {w.totalCost > 0 && (
                          <div className="text-[10px] text-slate-400">
                            Công: {w.repairCost.toLocaleString('vi-VN')} | LK: {w.sparePartsCost.toLocaleString('vi-VN')}
                          </div>
                        )}
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedTicket(w)}
                            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 dark:text-indigo-300 transition-colors text-xs font-semibold"
                            title="Chi tiết & Cập nhật tiến độ"
                          >
                            <Wrench className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => setPrintTicket(w)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors"
                            title="In biên nhận tiếp nhận"
                          >
                            <Printer className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc chắn muốn xóa hồ sơ bảo hành ${w.code}?`)) {
                                deleteWarranty(w.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 dark:text-rose-400 transition-colors"
                            title="Xóa phiếu"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARD VIEW */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {paginatedWarranties.length === 0 ? (
            <div className="p-6 text-center text-slate-400 dark:text-slate-500">
              Không tìm thấy phiếu bảo hành nào.
            </div>
          ) : (
            paginatedWarranties.map((w) => {
              const statusInfo = statusConfig[w.status] || statusConfig.receiving;
              return (
                <div key={w.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                        {w.code}
                      </span>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Tiếp nhận: {w.receivedDate}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusInfo.badge}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl space-y-1 text-xs">
                    <div className="font-semibold text-slate-900 dark:text-white">{w.productName}</div>
                    {w.serialNumber && (
                      <div className="font-mono text-indigo-600 dark:text-indigo-400 text-[11px]">
                        SN: {w.serialNumber}
                      </div>
                    )}
                    <div className="text-slate-600 dark:text-slate-400 text-[11px] mt-1">
                      Lỗi: {w.issueDescription}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="text-slate-400">Khách: </span>
                      <strong className="text-slate-700 dark:text-slate-200">{w.customerName}</strong> ({w.customerPhone})
                    </div>
                    <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {w.totalCost.toLocaleString('vi-VN')} đ
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => setPrintTicket(w)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1"
                    >
                      <Printer className="h-3.5 w-3.5" /> In phiếu
                    </button>
                    <button
                      onClick={() => setSelectedTicket(w)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center gap-1"
                    >
                      <Wrench className="h-3.5 w-3.5" /> Xử lý kỹ thuật
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* PAGINATION */}
        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          pageSizeOptions={[8, 16, 24, 32]}
        />
      </div>

      {/* MODAL: TIẾP NHẬN BẢO HÀNH (CREATE) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Lập Phiếu Tiếp Nhận Bảo Hành / Sửa Chữa (RMA)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Ghi nhận thiết bị khách hàng mang tới, phân loại bảo hành và lập biên bản tiếp nhận
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              {/* Customer Information */}
              <div className="space-y-2">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">
                  <User className="h-3.5 w-3.5 text-indigo-500" />
                  <span>1. Thông Tin Khách Hàng</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Chọn Khách Hàng (Sẵn Có)</label>
                    <select
                      value={formData.customerId}
                      onChange={(e) => handleSelectCustomer(e.target.value)}
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
                    >
                      <option value="">-- Khách vãng lai / Nhập tay --</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.phone})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Tên Khách Hàng *</label>
                    <input
                      type="text"
                      required
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      placeholder="VD: Nguyễn Văn Anh"
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Số Điện Thoại Liên Hệ *</label>
                    <input
                      type="tel"
                      required
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      placeholder="VD: 0912345678"
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Product & Serial Information */}
              <div className="space-y-2 pt-2">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">
                  <Package className="h-3.5 w-3.5 text-indigo-500" />
                  <span>2. Thông Tin Thiết Bị & Serial / IMEI</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Chọn Thiết Bị Kho</label>
                    <select
                      value={formData.productId}
                      onChange={(e) => handleSelectProduct(e.target.value)}
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
                    >
                      <option value="">-- Chọn danh mục sản phẩm --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Tên Thiết Bị / Model *</label>
                    <input
                      type="text"
                      required
                      value={formData.productName}
                      onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                      placeholder="VD: Smart Tivi LG 55 Inch 4K"
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Mã Serial / IMEI</label>
                    <input
                      type="text"
                      value={formData.serialNumber}
                      onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value.toUpperCase() })}
                      placeholder="Nhập hoặc quét Serial/IMEI"
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-mono uppercase"
                    />
                  </div>
                </div>

                {/* Serial quick selector */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                  <span>Gợi ý Serial đã bán:</span>
                  {serials.slice(0, 4).map((s) => (
                    <button
                      key={s.serialNumber}
                      type="button"
                      onClick={() => handleSelectSerial(s.serialNumber)}
                      className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-mono"
                    >
                      {s.serialNumber}
                    </button>
                  ))}
                </div>
              </div>

              {/* Warranty Policy & Issue Description */}
              <div className="space-y-2 pt-2">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">
                  <Wrench className="h-3.5 w-3.5 text-indigo-500" />
                  <span>3. Tình Trạng Hư Hỏng & Phân Loại</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Chính Sách Tiếp Nhận</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, isUnderWarranty: true })}
                        className={`py-2 px-3 rounded-xl font-bold border transition-all text-center ${
                          formData.isUnderWarranty
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        🛡️ Còn Hạn Bảo Hành
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, isUnderWarranty: false })}
                        className={`py-2 px-3 rounded-xl font-bold border transition-all text-center ${
                          !formData.isUnderWarranty
                            ? 'bg-amber-50 border-amber-500 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        🔧 Sửa Dịch Vụ (Có Phí)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Kỹ Thuật Viên Tiếp Nhận</label>
                    <select
                      value={formData.technicianName}
                      onChange={(e) => setFormData({ ...formData, technicianName: e.target.value })}
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-medium"
                    >
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.name}>
                          {emp.name} ({emp.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Mô Tả Hiện Tượng Lỗi / Yêu Cầu Khách Hàng *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={formData.issueDescription}
                    onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
                    placeholder="VD: Không lên nguồn, đèn tín hiệu nhấp nháy đỏ, màn hình bị sọc ngang..."
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Phụ Kiện Đi Kèm Thiết Bị</label>
                    <input
                      type="text"
                      value={formData.accessoriesAttached}
                      onChange={(e) => setFormData({ ...formData, accessoriesAttached: e.target.value })}
                      placeholder="VD: Thân máy, điều khiển, dây nguồn..."
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Hẹn Ngày Trả Dự Kiến</label>
                    <input
                      type="date"
                      value={formData.estimatedReturnDate}
                      onChange={(e) => setFormData({ ...formData, estimatedReturnDate: e.target.value })}
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Lập Phiếu Tiếp Nhận</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CHI TIẾT & TIẾN ĐỘ SỬA CHỮA (DETAIL & TIMELINE) */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-base text-slate-900 dark:text-white">
                    {selectedTicket.code}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                      statusConfig[selectedTicket.status]?.badge
                    }`}
                  >
                    {statusConfig[selectedTicket.status]?.label}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Thiết bị: {selectedTicket.productName} {selectedTicket.serialNumber ? `(SN: ${selectedTicket.serialNumber})` : ''}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPrintTicket(selectedTicket)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  title="In phiếu tiếp nhận"
                >
                  <Printer className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 text-xs max-h-[75vh] overflow-y-auto">
              {/* STATUS WORKFLOW STEPPER */}
              <div className="space-y-2">
                <div className="font-semibold text-slate-700 dark:text-slate-300">
                  Cập Nhật Trạng Thái Quy Trình Xử Lý
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { status: 'receiving', label: '1. Tiếp nhận' },
                    { status: 'inspecting', label: '2. Chẩn đoán' },
                    { status: 'repairing', label: '3. Sửa chữa' },
                    { status: 'waiting_parts', label: '4. Chờ linh kiện' },
                    { status: 'completed', label: '5. Sẵn sàng trả' },
                    { status: 'returned_to_customer', label: '6. Đã bàn giao' }
                  ].map((s) => {
                    const isCurrent = selectedTicket.status === s.status;
                    return (
                      <button
                        key={s.status}
                        type="button"
                        onClick={() => handleUpdateStatus(selectedTicket, s.status as WarrantyTicketStatus)}
                        className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                          isCurrent
                            ? 'bg-indigo-600 text-white font-bold shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* OVERVIEW GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[11px] text-slate-400">Khách Hàng:</span>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">{selectedTicket.customerName}</div>
                  <div className="font-mono text-slate-500">{selectedTicket.customerPhone}</div>
                  <div className="mt-2 text-slate-600 dark:text-slate-300">
                    <span className="text-slate-400">Phụ kiện kèm: </span>
                    {selectedTicket.accessoriesAttached || 'Không có'}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400">Kỹ Thuật Phụ Trách:</span>
                  <div className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                    {selectedTicket.technicianName}
                  </div>
                  <div className="text-slate-500 mt-1">
                    Ngày tiếp nhận: <span className="font-mono text-slate-900 dark:text-white">{selectedTicket.receivedDate}</span>
                  </div>
                  <div className="text-slate-500">
                    Hẹn ngày trả: <span className="font-mono text-slate-900 dark:text-white">{selectedTicket.estimatedReturnDate || 'Chưa định'}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-slate-400">Tổng chi phí dịch vụ: </span>
                    <strong className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      {selectedTicket.totalCost.toLocaleString('vi-VN')} đ
                    </strong>
                  </div>
                </div>
              </div>

              {/* SERVICE RECORDS & REPAIR LOG */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Wrench className="h-4 w-4 text-indigo-500" />
                    <span>Nhật Ký Xử Lý Kỹ Thuật & Thay Thế Linh Kiện</span>
                  </h4>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {selectedTicket.serviceRecords.length} lần ghi nhận
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedTicket.serviceRecords.map((rec, idx) => (
                    <div
                      key={rec.id || idx}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-start gap-3"
                    >
                      <div className="space-y-1">
                        <div className="font-semibold text-slate-900 dark:text-white">{rec.action}</div>
                        {rec.spareParts && (
                          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-mono">
                            <Cpu className="h-3 w-3" />
                            Linh kiện: {rec.spareParts}
                          </div>
                        )}
                        {rec.notes && <div className="text-[11px] text-slate-500">{rec.notes}</div>}
                        <div className="text-[10px] text-slate-400 font-mono">
                          {rec.date} • KTV: {rec.technicianName}
                        </div>
                      </div>

                      {rec.cost > 0 && (
                        <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                          +{rec.cost.toLocaleString('vi-VN')} đ
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* ADD NEW LOG ENTRY SUB-FORM */}
                <form onSubmit={handleAddServiceRecord} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <div className="font-semibold text-slate-700 dark:text-slate-300">
                    + Thêm Công Việc Xử Lý Mới
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        required
                        value={newServiceAction}
                        onChange={(e) => setNewServiceAction(e.target.value)}
                        placeholder="Nội dung: Thay bóng đèn nền LED, nạp phần mềm..."
                        className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={newServiceCost || ''}
                        onChange={(e) => setNewServiceCost(parseFloat(e.target.value) || 0)}
                        placeholder="Chi phí (VNĐ)"
                        className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newSpareParts}
                      onChange={(e) => setNewSpareParts(e.target.value)}
                      placeholder="Tên linh kiện/phụ tùng thay thế (nếu có)..."
                      className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={newServiceNotes}
                      onChange={(e) => setNewServiceNotes(e.target.value)}
                      placeholder="Ghi chú kỹ thuật bổ sung..."
                      className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all active:scale-95"
                    >
                      Lưu Công Việc
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINT RECEIPT MODAL */}
      {printTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white text-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-300 space-y-4 my-8">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-black text-base text-indigo-700 tracking-wide">
                  NEXUS ERP - BIÊN NHẬN BẢO HÀNH & SỬA CHỮA
                </h3>
                <p className="text-[11px] text-slate-500">
                  Trung Tâm Dịch Vụ Kỹ Thuật & Bảo Hành Thiết Bị
                </p>
              </div>
              <button
                onClick={() => setPrintTicket(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 print:hidden"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Printable Content */}
            <div className="space-y-3 text-xs leading-relaxed">
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono">
                <div>
                  <span className="text-slate-500">Mã Biên Nhận: </span>
                  <strong>{printTicket.code}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Ngày: </span>
                  <span>{printTicket.receivedDate}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div>
                  <span className="text-slate-500">Khách Hàng: </span>
                  <strong>{printTicket.customerName}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Số Điện Thoại: </span>
                  <span className="font-mono">{printTicket.customerPhone}</span>
                </div>
                <div>
                  <span className="text-slate-500">Thiết Bị: </span>
                  <strong>{printTicket.productName}</strong>
                </div>
                {printTicket.serialNumber && (
                  <div>
                    <span className="text-slate-500">Serial / IMEI: </span>
                    <span className="font-mono font-bold text-indigo-600">{printTicket.serialNumber}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-500">Phụ kiện đi kèm: </span>
                  <span>{printTicket.accessoriesAttached || 'Không có'}</span>
                </div>
                <div>
                  <span className="text-slate-500">Hiện tượng lỗi: </span>
                  <span className="text-rose-600 font-medium">{printTicket.issueDescription}</span>
                </div>
                <div>
                  <span className="text-slate-500">Hình thức: </span>
                  <span className="font-semibold">
                    {printTicket.isUnderWarranty ? 'Bảo hành chính hãng (Miễn phí)' : 'Dịch vụ sửa chữa có phí'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Hẹn ngày trả dự kiến: </span>
                  <strong className="font-mono">{printTicket.estimatedReturnDate || 'KTV sẽ liên hệ'}</strong>
                </div>
              </div>

              {printTicket.totalCost > 0 && (
                <div className="flex justify-between items-center bg-indigo-50 p-2.5 rounded-xl border border-indigo-200 font-mono">
                  <span className="font-bold text-indigo-900">Chi Phí Ước Tính:</span>
                  <strong className="text-indigo-700 text-sm font-black">
                    {printTicket.totalCost.toLocaleString('vi-VN')} đ
                  </strong>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 grid grid-cols-2 text-center text-[11px]">
                <div>
                  <p className="font-semibold text-slate-700">Khách Hàng</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">(Ký và ghi rõ họ tên)</p>
                  <div className="h-14" />
                  <p className="font-medium text-slate-800">{printTicket.customerName}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-700">Đại Diện Tiếp Nhận</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">(Kỹ thuật viên ký xác nhận)</p>
                  <div className="h-14" />
                  <p className="font-medium text-slate-800">{printTicket.technicianName}</p>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 italic text-center pt-2">
                * Quý khách vui lòng mang theo biên nhận này khi đến nhận lại thiết bị. Trân trọng cảm ơn!
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 print:hidden">
              <button
                type="button"
                onClick={() => setPrintTicket(null)}
                className="px-4 py-1.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                <Printer className="h-4 w-4" />
                <span>In Biên Nhận (K80 / A5)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

