"use client";
import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { SerialItem, SerialStatus, SerialTimelineEvent } from '../../types/erp';
import { Pagination } from '../common/Pagination';
import { RowActionMenu } from '../common/RowActionMenu';
import {
  Barcode,
  Search,
  Filter,
  Plus,
  Download,
  ScanBarcode,
  Package,
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  X,
  FileText,
  Trash2,
  Edit2,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  ShieldCheck,
  Tag
} from 'lucide-react';

export const SerialManagementView: React.FC = () => {
  const {
    serials,
    addSerial,
    updateSerial,
    deleteSerial,
    bulkAddSerials,
    products,
    customers,
    currentUser,
    openScannerModal,
    canExportExcel,
    showToast
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SerialStatus>('all');
  const [productFilter, setProductFilter] = useState('all');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedSerial, setSelectedSerial] = useState<SerialItem | null>(null);
  const [editingSerial, setEditingSerial] = useState<SerialItem | null>(null);

  // Form State: Single Serial
  const [singleForm, setSingleForm] = useState({
    serialNumber: '',
    productId: '',
    productName: '',
    sku: '',
    supplier: 'Công Ty Điện Máy Á Châu',
    batchNumber: 'LO-2026-01',
    warrantyMonths: 12,
    notes: ''
  });

  // Form State: Bulk Import
  const [bulkProductId, setBulkProductId] = useState('');
  const [bulkSupplier, setBulkSupplier] = useState('Công Ty Điện Máy Á Châu');
  const [bulkBatchNumber, setBulkBatchNumber] = useState('LO-2026-01');
  const [bulkWarrantyMonths, setBulkWarrantyMonths] = useState(12);
  const [bulkText, setBulkText] = useState('');

  // Status configuration
  const statusConfig: Record<SerialStatus, { label: string; badge: string; icon: any }> = {
    in_stock: {
      label: 'Trong kho (Sẵn sàng)',
      badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
      icon: CheckCircle2
    },
    sold: {
      label: 'Đã xuất bán',
      badge: 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
      icon: CheckCircle2
    },
    rma: {
      label: 'Đang bảo hành (RMA)',
      badge: 'bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
      icon: ShieldCheck
    },
    defective: {
      label: 'Lỗi / Hỏng / Chờ hủy',
      badge: 'bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
      icon: AlertTriangle
    },
    returned: {
      label: 'Thu hồi / Đổi trả',
      badge: 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
      icon: RotateCcw
    }
  };

  // Metrics
  const totalCount = serials.length;
  const inStockCount = serials.filter(s => s.status === 'in_stock').length;
  const soldCount = serials.filter(s => s.status === 'sold').length;
  const rmaCount = serials.filter(s => s.status === 'rma').length;
  const defectiveCount = serials.filter(s => s.status === 'defective').length;

  // Filtering
  const filteredSerials = serials.filter(s => {
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchProduct = productFilter === 'all' || s.sku === productFilter;

    const q = searchQuery.toLowerCase();
    const matchSearch =
      s.serialNumber.toLowerCase().includes(q) ||
      s.productName.toLowerCase().includes(q) ||
      s.sku.toLowerCase().includes(q) ||
      (s.customerName && s.customerName.toLowerCase().includes(q)) ||
      (s.customerPhone && s.customerPhone.includes(q)) ||
      (s.orderCode && s.orderCode.toLowerCase().includes(q)) ||
      (s.batchNumber && s.batchNumber.toLowerCase().includes(q));

    return matchStatus && matchProduct && matchSearch;
  });

  const totalItems = filteredSerials.length;
  const paginatedSerials = filteredSerials.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handle single product select
  const handleProductSelect = (pId: string) => {
    const prod = products.find(p => p.id === pId);
    if (prod) {
      setSingleForm(prev => ({
        ...prev,
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku
      }));
    }
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleForm.serialNumber.trim()) {
      showToast('⚠️ Vui lòng nhập mã Serial/IMEI!');
      return;
    }
    if (!singleForm.productName.trim()) {
      showToast('⚠️ Vui lòng chọn sản phẩm liên kết!');
      return;
    }

    const today = new Date();
    const warrantyDate = new Date(today);
    warrantyDate.setMonth(warrantyDate.getMonth() + singleForm.warrantyMonths);

    const newSerialItem: SerialItem = {
      serialNumber: singleForm.serialNumber.trim().toUpperCase(),
      sku: singleForm.sku || 'SKU-GEN',
      productName: singleForm.productName,
      importDate: today.toISOString().slice(0, 10),
      supplier: singleForm.supplier,
      warrantyUntil: warrantyDate.toISOString().slice(0, 10),
      status: 'in_stock',
      batchNumber: singleForm.batchNumber,
      notes: singleForm.notes,
      timeline: [
        {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          action: 'imported',
          description: `Nhập kho thiết bị Serial/IMEI [${singleForm.serialNumber.trim().toUpperCase()}]`,
          actor: currentUser?.name || 'Thủ Kho'
        }
      ]
    };

    addSerial(newSerialItem);
    setIsCreateModalOpen(false);
    setSingleForm({
      serialNumber: '',
      productId: '',
      productName: '',
      sku: '',
      supplier: 'Công Ty Điện Máy Á Châu',
      batchNumber: 'LO-2026-01',
      warrantyMonths: 12,
      notes: ''
    });
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => p.id === bulkProductId);
    if (!prod) {
      showToast('⚠️ Vui lòng chọn sản phẩm cần nhập Serial!');
      return;
    }

    const lines = bulkText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) {
      showToast('⚠️ Vui lòng dán danh sách mã Serial/IMEI (mỗi mã 1 dòng)!');
      return;
    }

    const today = new Date();
    const warrantyDate = new Date(today);
    warrantyDate.setMonth(warrantyDate.getMonth() + bulkWarrantyMonths);

    const items: SerialItem[] = lines.map(sn => ({
      serialNumber: sn.toUpperCase(),
      sku: prod.sku,
      productName: prod.name,
      importDate: today.toISOString().slice(0, 10),
      supplier: bulkSupplier,
      warrantyUntil: warrantyDate.toISOString().slice(0, 10),
      status: 'in_stock',
      batchNumber: bulkBatchNumber,
      timeline: [
        {
          id: `tl-${Date.now()}-${Math.random()}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          action: 'imported',
          description: `Nhập hàng loạt ${lines.length} thiết bị vào kho`,
          actor: currentUser?.name || 'Thủ Kho'
        }
      ]
    }));

    bulkAddSerials(items);
    setIsBulkModalOpen(false);
    setBulkText('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSerial) return;

    // Check if status changed to add a timeline record
    const prev = serials.find(s => s.serialNumber === editingSerial.serialNumber);
    let updatedTimeline = editingSerial.timeline || [];
    if (prev && prev.status !== editingSerial.status) {
      updatedTimeline = [
        ...updatedTimeline,
        {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          action: 'status_changed',
          description: `Thay đổi trạng thái từ [${statusConfig[prev.status]?.label}] sang [${statusConfig[editingSerial.status]?.label}]`,
          actor: currentUser?.name || 'Quản lý kho'
        }
      ];
    }

    updateSerial({
      ...editingSerial,
      timeline: updatedTimeline
    });

    setEditingSerial(null);
  };

  const exportSerialReport = () => {
    if (!canExportExcel) {
      showToast('🔒 Bạn không có quyền xuất file! Chỉ dành cho Quản trị viên.');
      return;
    }

    const headers = [
      'Số Serial/IMEI',
      'SKU Sản Phẩm',
      'Tên Sản Phẩm',
      'Trạng Thái',
      'Ngày Nhập Kho',
      'Nhà Cung Cấp',
      'Hạn Bảo Hành',
      'Số Lô (Batch)',
      'Mã Đơn Bán',
      'Khách Hàng',
      'Số Điện Thoại'
    ];

    const rows = filteredSerials.map(s => [
      s.serialNumber,
      s.sku,
      `"${s.productName}"`,
      statusConfig[s.status].label,
      s.importDate,
      `"${s.supplier}"`,
      s.warrantyUntil,
      s.batchNumber || '',
      s.orderCode || '',
      `"${s.customerName || ''}"`,
      s.customerPhone || ''
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NEXUS_Serial_IMEI_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📥 Đã xuất danh sách Serial/IMEI ra CSV thành công!');
  };

  return (
    <div className="p-6 space-y-6 w-full animate-in fade-in duration-200 text-slate-800 dark:text-slate-100">
      {/* HEADER & TOP BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Barcode className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Quản Lý Serial / IMEI & Vòng Đời Thiết Bị
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Theo dõi từng thiết bị đơn lẻ từ lúc nhập kho, bán hàng, kích hoạt bảo hành cho tới khi thu hồi
          </p>
        </div>

        {/* Action Button Group */}
        <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200 dark:border-slate-700 shadow-xs">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm Serial</span>
          </button>

          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 text-xs font-semibold transition-all ml-1"
            title="Dán hàng loạt danh sách Serial"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Nhập Hàng Loạt</span>
          </button>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1.5" />

          <button
            onClick={() =>
              openScannerModal((code) => {
                setSearchQuery(code);
                showToast(`🔍 Đã quét mã Serial: ${code}`);
              })
            }
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 text-xs font-semibold"
            title="Mở camera quét mã Barcode/QR"
          >
            <ScanBarcode className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">Quét</span>
          </button>

          <button
            onClick={exportSerialReport}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 text-xs font-semibold transition-all"
            title="Xuất file ra Excel/CSV"
          >
            <Download className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* 4 METRIC STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Tổng Serial Đã Đăng Ký</span>
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Barcode className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-mono font-black text-slate-900 dark:text-white mt-2">
            {totalCount} <span className="text-xs font-normal text-slate-400">mã</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Toàn bộ vòng đời thiết bị</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Tồn Kho (Sẵn Sàng)</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-mono font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {inStockCount} <span className="text-xs font-normal text-slate-400">mã</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Đang nằm tại kệ kho hàng</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">Đã Xuất Bán</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <User className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-mono font-black text-blue-600 dark:text-blue-400 mt-2">
            {soldCount} <span className="text-xs font-normal text-slate-400">mã</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Đã giao khách, kích hoạt BH</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase">Bảo Hành & Lỗi</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-mono font-black text-purple-600 dark:text-purple-400 mt-2">
            {rmaCount + defectiveCount} <span className="text-xs font-normal text-slate-400">mã</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            RMA: {rmaCount} | Lỗi: {defectiveCount}
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
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
            placeholder="Tìm theo mã Serial/IMEI, SKU, tên khách, đơn hàng, lô..."
            className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Product Filter */}
          <select
            value={productFilter}
            onChange={(e) => {
              setProductFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 font-semibold focus:outline-none max-w-[180px] truncate"
          >
            <option value="all">Tất cả sản phẩm</option>
            {products.map((p) => (
              <option key={p.id} value={p.sku}>
                {p.name}
              </option>
            ))}
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
            <option value="in_stock">Trong kho (Sẵn sàng)</option>
            <option value="sold">Đã xuất bán</option>
            <option value="rma">Đang bảo hành (RMA)</option>
            <option value="defective">Lỗi / Hỏng</option>
            <option value="returned">Thu hồi / Trả hàng</option>
          </select>
        </div>
      </div>

      {/* TABLE & LIST VIEW CONTAINER */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden">
        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-4">Mã Serial / IMEI</th>
                <th className="p-4">Sản Phẩm & SKU</th>
                <th className="p-4 text-center">Trạng Thái</th>
                <th className="p-4">Ngày Nhập & Hạn BH</th>
                <th className="p-4">Khách Hàng / Đơn Bán</th>
                <th className="p-4">Lô / Nhà Cung Cấp</th>
                <th className="p-4 text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedSerials.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 dark:text-slate-500">
                    Không tìm thấy mã Serial/IMEI nào phù hợp.
                  </td>
                </tr>
              ) : (
                paginatedSerials.map((s) => {
                  const statusInfo = statusConfig[s.status] || statusConfig.in_stock;
                  const StatusIcon = statusInfo.icon;

                  return (
                    <tr key={s.serialNumber} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                          {s.serialNumber}
                        </div>
                        {s.notes && (
                          <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                            {s.notes}
                          </div>
                        )}
                      </td>

                      <td className="p-4 max-w-xs">
                        <div className="font-semibold text-slate-900 dark:text-white truncate">
                          {s.productName}
                        </div>
                        <div className="font-mono text-indigo-600 dark:text-indigo-400 text-[11px] font-semibold">
                          SKU: {s.sku}
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

                      <td className="p-4 font-mono text-slate-600 dark:text-slate-400">
                        <div>Nhập: {s.importDate}</div>
                        <div className="text-slate-400 text-[11px]">BH đến: {s.warrantyUntil}</div>
                      </td>

                      <td className="p-4">
                        {s.customerName ? (
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">{s.customerName}</div>
                            <div className="font-mono text-slate-500 text-[11px]">{s.customerPhone}</div>
                            {s.orderCode && (
                              <span className="text-[10px] text-indigo-600 font-mono bg-indigo-50 dark:bg-indigo-950/40 px-1 rounded">
                                Đơn: {s.orderCode}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Chưa bán (Tồn kho)</span>
                        )}
                      </td>

                      <td className="p-4 text-slate-600 dark:text-slate-400">
                        {s.batchNumber && (
                          <div className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                            Lô: {s.batchNumber}
                          </div>
                        )}
                        <div className="text-[11px] text-slate-400 truncate max-w-[140px]">{s.supplier}</div>
                      </td>

                      <td className="p-4 text-center">
                        <RowActionMenu
                          items={[
                            {
                              id: `history-${s.serialNumber}`,
                              label: 'Xem vòng đời thiết bị',
                              icon: Clock,
                              variant: 'indigo',
                              onClick: () => setSelectedSerial(s),
                            },
                            {
                              id: `edit-${s.serialNumber}`,
                              label: 'Chỉnh sửa thông tin',
                              icon: Edit2,
                              onClick: () => setEditingSerial(s),
                            },
                            {
                              id: `delete-${s.serialNumber}`,
                              label: 'Xóa mã Serial/IMEI',
                              icon: Trash2,
                              variant: 'danger',
                              divider: true,
                              onClick: () => {
                                if (confirm(`Bạn có chắc muốn xóa mã Serial ${s.serialNumber}?`)) {
                                  deleteSerial(s.serialNumber);
                                }
                              },
                            },
                          ]}
                        />
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
          {paginatedSerials.length === 0 ? (
            <div className="p-6 text-center text-slate-400 dark:text-slate-500">
              Không tìm thấy mã Serial/IMEI nào.
            </div>
          ) : (
            paginatedSerials.map((s) => {
              const statusInfo = statusConfig[s.status] || statusConfig.in_stock;

              return (
                <div key={s.serialNumber} className="p-4 space-y-2.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                        {s.serialNumber}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        BH đến: {s.warrantyUntil}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusInfo.badge}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl space-y-1 text-xs">
                    <div className="font-semibold text-slate-900 dark:text-white">{s.productName}</div>
                    <div className="font-mono text-indigo-600 dark:text-indigo-400 text-[11px]">
                      SKU: {s.sku} {s.batchNumber ? `• Lô: ${s.batchNumber}` : ''}
                    </div>
                  </div>

                  {s.customerName && (
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Khách mua: <strong>{s.customerName}</strong> ({s.customerPhone})
                    </div>
                  )}

                  <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                    <RowActionMenu
                      label="Thao tác"
                      items={[
                        {
                          id: `history-mob-${s.serialNumber}`,
                          label: 'Xem vòng đời thiết bị',
                          icon: Clock,
                          variant: 'indigo',
                          onClick: () => setSelectedSerial(s),
                        },
                        {
                          id: `edit-mob-${s.serialNumber}`,
                          label: 'Chỉnh sửa thông tin',
                          icon: Edit2,
                          onClick: () => setEditingSerial(s),
                        },
                      ]}
                    />
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
          pageSizeOptions={[10, 20, 50, 100]}
        />
      </div>

      {/* MODAL: THÊM SERIAL ĐƠN */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                  <Barcode className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Đăng Ký Mã Serial / IMEI Thiết Bị
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Khởi tạo mã định danh duy nhất cho từng máy trong kho
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

            <form onSubmit={handleSingleSubmit} className="p-6 space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Chọn Sản Phẩm Liên Kết *</label>
                <select
                  required
                  value={singleForm.productId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-medium"
                >
                  <option value="">-- Chọn sản phẩm có quản lý Serial --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Mã Serial / IMEI *</label>
                  <button
                    type="button"
                    onClick={() =>
                      openScannerModal((code) => {
                        setSingleForm(prev => ({ ...prev, serialNumber: code.toUpperCase() }));
                      })
                    }
                    className="text-indigo-600 dark:text-indigo-400 text-[11px] flex items-center gap-1 font-semibold"
                  >
                    <ScanBarcode className="h-3 w-3" /> Quét Barcode
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={singleForm.serialNumber}
                  onChange={(e) => setSingleForm({ ...singleForm, serialNumber: e.target.value.toUpperCase() })}
                  placeholder="VD: SN-SAM-2026-999"
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-mono uppercase text-sm font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Thời Hạn Bảo Hành</label>
                  <select
                    value={singleForm.warrantyMonths}
                    onChange={(e) => setSingleForm({ ...singleForm, warrantyMonths: parseInt(e.target.value) || 12 })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
                  >
                    <option value={3}>3 tháng</option>
                    <option value={6}>6 tháng</option>
                    <option value={12}>12 tháng (1 năm)</option>
                    <option value={24}>24 tháng (2 năm)</option>
                    <option value={36}>36 tháng (3 năm)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Số Lô Hàng (Batch ID)</label>
                  <input
                    type="text"
                    value={singleForm.batchNumber}
                    onChange={(e) => setSingleForm({ ...singleForm, batchNumber: e.target.value })}
                    placeholder="VD: LO-2026-01"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Nhà Cung Cấp Hàng Hóa</label>
                <input
                  type="text"
                  value={singleForm.supplier}
                  onChange={(e) => setSingleForm({ ...singleForm, supplier: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Ghi Chú Kỹ Thuật</label>
                <input
                  type="text"
                  value={singleForm.notes}
                  onChange={(e) => setSingleForm({ ...singleForm, notes: e.target.value })}
                  placeholder="VD: Phiên bản quốc tế, đã dán tem niêm phong..."
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md active:scale-95 transition-all"
                >
                  Lưu Serial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NHẬP HÀNG LOẠT (BULK PASTE) */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Nhập Hàng Loạt Serial / IMEI (Bulk Paste)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Dán nhanh danh sách hàng chục/hàng trăm mã từ máy quét hoặc file Excel
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleBulkSubmit} className="p-6 space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Chọn Sản Phẩm Nhập Hàng Loạt *</label>
                <select
                  required
                  value={bulkProductId}
                  onChange={(e) => setBulkProductId(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-medium"
                >
                  <option value="">-- Chọn sản phẩm cần nhập --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Thời Hạn Bảo Hành</label>
                  <select
                    value={bulkWarrantyMonths}
                    onChange={(e) => setBulkWarrantyMonths(parseInt(e.target.value) || 12)}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
                  >
                    <option value={6}>6 tháng</option>
                    <option value={12}>12 tháng</option>
                    <option value={24}>24 tháng</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Số Lô (Batch ID)</label>
                  <input
                    type="text"
                    value={bulkBatchNumber}
                    onChange={(e) => setBulkBatchNumber(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Danh Sách Serial / IMEI (Mỗi mã trên 1 dòng) *
                  </label>
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono">
                    {bulkText.split('\n').filter(l => l.trim().length > 0).length} mã đã nhận diện
                  </span>
                </div>
                <textarea
                  required
                  rows={6}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={`VD:
LG-55-2026-101
LG-55-2026-102
LG-55-2026-103
LG-55-2026-104`}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 text-xs font-mono text-slate-900 dark:text-white uppercase"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md active:scale-95 transition-all"
                >
                  Tiến Hành Nhập Hàng Loạt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TIMELINE VÒNG ĐỜI SERIAL */}
      {selectedSerial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-base text-slate-900 dark:text-white">
                    {selectedSerial.serialNumber}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      statusConfig[selectedSerial.status]?.badge
                    }`}
                  >
                    {statusConfig[selectedSerial.status]?.label}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {selectedSerial.productName} (SKU: {selectedSerial.sku})
                </div>
              </div>
              <button
                onClick={() => setSelectedSerial(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
              {/* Device Quick Specs */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 font-mono text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Ngày nhập kho:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedSerial.importDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Hạn bảo hành:</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">{selectedSerial.warrantyUntil}</span>
                </div>
                {selectedSerial.customerName && (
                  <div className="col-span-2 pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Khách hàng sở hữu:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {selectedSerial.customerName} ({selectedSerial.customerPhone})
                    </span>
                  </div>
                )}
              </div>

              {/* TIMELINE LIST */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">
                  <Clock className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Dòng Sự Kiện Vòng Đời Thiết Bị</span>
                </h4>

                <div className="space-y-3 pl-2 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                  {(selectedSerial.timeline || []).map((evt, idx) => (
                    <div key={evt.id || idx} className="relative pl-6 space-y-0.5">
                      <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-500 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                      </div>

                      <div className="font-semibold text-slate-900 dark:text-white text-xs">
                        {evt.description}
                      </div>

                      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
                        <span>{evt.timestamp}</span>
                        <span>• Thực hiện: {evt.actor}</span>
                        {evt.referenceCode && (
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                            [{evt.referenceCode}]
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CHỈNH SỬA SERIAL */}
      {editingSerial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Cập Nhật Trạng Thái & Thông Tin Serial
                </h3>
                <p className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                  {editingSerial.serialNumber}
                </p>
              </div>
              <button
                onClick={() => setEditingSerial(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Trạng Thái Thiết Bị</label>
                <select
                  value={editingSerial.status}
                  onChange={(e) =>
                    setEditingSerial({ ...editingSerial, status: e.target.value as SerialStatus })
                  }
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="in_stock">Trong kho (Sẵn sàng bán)</option>
                  <option value="sold">Đã xuất bán cho khách</option>
                  <option value="rma">Đang nhận bảo hành (RMA)</option>
                  <option value="defective">Lỗi / Hỏng / Hủy</option>
                  <option value="returned">Thu hồi / Đổi trả</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Hạn Bảo Hành</label>
                <input
                  type="date"
                  value={editingSerial.warrantyUntil}
                  onChange={(e) => setEditingSerial({ ...editingSerial, warrantyUntil: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Tên Khách Hàng</label>
                  <input
                    type="text"
                    value={editingSerial.customerName || ''}
                    onChange={(e) => setEditingSerial({ ...editingSerial, customerName: e.target.value })}
                    placeholder="Chưa có"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Số Điện Thoại</label>
                  <input
                    type="tel"
                    value={editingSerial.customerPhone || ''}
                    onChange={(e) => setEditingSerial({ ...editingSerial, customerPhone: e.target.value })}
                    placeholder="Chưa có"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Ghi Chú</label>
                <input
                  type="text"
                  value={editingSerial.notes || ''}
                  onChange={(e) => setEditingSerial({ ...editingSerial, notes: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingSerial(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md active:scale-95 transition-all"
                >
                  Cập Nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

