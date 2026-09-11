"use client";
import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Product, ProductBatch, SerialItem, PackagingUnit } from '../../types/erp';
import { Pagination } from '../common/Pagination';
import { MoneyInput } from '../common/MoneyInput';
import { RowActionMenu } from '../common/RowActionMenu';
import {
  Package,
  Layers,
  Calendar,
  Barcode,
  Search,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Plus,
  ArrowRightLeft,
  ChevronRight,
  ShieldAlert,
  Info,
  ScanBarcode,
  Edit2,
  Trash2,
  Download,
  Filter,
  X,
  Boxes,
  CalendarPlus
} from 'lucide-react';

export const WarehouseView: React.FC = () => {
  const {
    products,
    batches,
    serials,
    canViewCosts,
    canExportExcel,
    getConvertedStockText,
    openScannerModal,
    showToast,
    addProduct,
    updateProduct,
    deleteProduct
  } = useERP();

  const [activeSubTab, setActiveSubTab] = useState<'units' | 'fefo' | 'serials'>('units');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low_stock' | 'in_stock'>('all');
  const [fefoStatusFilter, setFefoStatusFilter] = useState<'all' | 'urgent' | 'expired' | 'safe'>('all');
  const [serialLookupQuery, setSerialLookupQuery] = useState('');

  // Pagination states
  const [productPage, setProductPage] = useState(1);
  const [productPageSize, setProductPageSize] = useState(8);

  const [fefoPage, setFefoPage] = useState(1);
  const [fefoPageSize, setFefoPageSize] = useState(8);

  // CRUD Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Form State for Create / Edit Product
  const [formData, setFormData] = useState<{
    name: string;
    sku: string;
    barcode: string;
    category: string;
    baseUnit: string;
    subUnitName: string;
    subUnitRate: number;
    costPrice: number;
    retailPrice: number;
    wholesalePrice: number;
    vipPrice: number;
    stockBaseUnits: number;
    minStockAlert: number;
  }>({
    name: '',
    sku: '',
    barcode: '',
    category: 'Gia Dụng',
    baseUnit: 'Cái',
    subUnitName: 'Thùng',
    subUnitRate: 24,
    costPrice: 100000,
    retailPrice: 150000,
    wholesalePrice: 130000,
    vipPrice: 120000,
    stockBaseUnits: 100,
    minStockAlert: 20
  });

  // Extract Categories
  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];

  // 1. Filter products for Unit packaging
  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery);

    const matchCategory = categoryFilter === 'all' || p.category === categoryFilter;

    let matchStock = true;
    if (stockStatusFilter === 'low_stock') {
      matchStock = p.stockBaseUnits <= p.minStockAlert;
    } else if (stockStatusFilter === 'in_stock') {
      matchStock = p.stockBaseUnits > p.minStockAlert;
    }

    return matchSearch && matchCategory && matchStock;
  });

  const totalProductItems = filteredProducts.length;
  const paginatedProducts = filteredProducts.slice(
    (productPage - 1) * productPageSize,
    productPage * productPageSize
  );

  // 2. Filter batches for FEFO
  const sortedBatches = [...batches].sort((a, b) => a.daysRemaining - b.daysRemaining);
  const filteredBatches = sortedBatches.filter((b) => {
    const matchSearch =
      b.batchId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.sku.toLowerCase().includes(searchQuery.toLowerCase());

    let matchFefo = true;
    if (fefoStatusFilter === 'expired') {
      matchFefo = b.daysRemaining <= 0;
    } else if (fefoStatusFilter === 'urgent') {
      matchFefo = b.daysRemaining > 0 && b.daysRemaining <= 30;
    } else if (fefoStatusFilter === 'safe') {
      matchFefo = b.daysRemaining > 30;
    }

    return matchSearch && matchFefo;
  });

  const totalBatchItems = filteredBatches.length;
  const paginatedBatches = filteredBatches.slice(
    (fefoPage - 1) * fefoPageSize,
    fefoPage * fefoPageSize
  );

  // 3. Serial / IMEI search
  const foundSerial = serials.find(
    (s) => s.serialNumber.toLowerCase() === serialLookupQuery.trim().toLowerCase()
  );

  // Open modal to create new product
  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    const newSku = `SKU-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBarcode = `893${Math.floor(100000000 + Math.random() * 900000000)}`;
    setFormData({
      name: '',
      sku: newSku,
      barcode: newBarcode,
      category: 'Gia Dụng',
      baseUnit: 'Cái',
      subUnitName: 'Thùng',
      subUnitRate: 24,
      costPrice: 50000,
      retailPrice: 85000,
      wholesalePrice: 70000,
      vipPrice: 65000,
      stockBaseUnits: 50,
      minStockAlert: 10
    });
    setIsProductModalOpen(true);
  };

  // Open modal to edit existing product
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    const subUnit = prod.units.find((u) => u.name !== prod.baseUnit);
    setFormData({
      name: prod.name,
      sku: prod.sku,
      barcode: prod.barcode,
      category: prod.category,
      baseUnit: prod.baseUnit,
      subUnitName: subUnit ? subUnit.name : 'Thùng',
      subUnitRate: subUnit ? subUnit.conversionRate : 24,
      costPrice: prod.costPrice,
      retailPrice: prod.priceRetail,
      wholesalePrice: prod.priceWholesale,
      vipPrice: prod.priceVip,
      stockBaseUnits: prod.stockBaseUnits,
      minStockAlert: prod.minStockAlert
    });
    setIsProductModalOpen(true);
  };

  // Submit Create or Edit Product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('⚠️ Vui lòng nhập tên sản phẩm!');
      return;
    }

    const unitsList: PackagingUnit[] = [
      {
        name: formData.baseUnit,
        conversionRate: 1,
        isBase: true,
        priceRetail: formData.retailPrice,
        priceWholesale: formData.wholesalePrice,
        priceVip: formData.vipPrice
      },
      ...(formData.subUnitName && formData.subUnitRate > 1
        ? [
            {
              name: formData.subUnitName,
              conversionRate: formData.subUnitRate,
              isBase: false,
              priceRetail: formData.retailPrice * formData.subUnitRate,
              priceWholesale: formData.wholesalePrice * formData.subUnitRate,
              priceVip: formData.vipPrice * formData.subUnitRate
            }
          ]
        : [])
    ];

    if (editingProduct) {
      // Update
      const updated: Product = {
        ...editingProduct,
        name: formData.name,
        sku: formData.sku,
        barcode: formData.barcode,
        category: formData.category,
        baseUnit: formData.baseUnit,
        units: unitsList,
        costPrice: formData.costPrice,
        priceRetail: formData.retailPrice,
        priceWholesale: formData.wholesalePrice,
        priceVip: formData.vipPrice,
        stockBaseUnits: formData.stockBaseUnits,
        minStockAlert: formData.minStockAlert
      };
      updateProduct(updated);
      showToast(`✅ Đã cập nhật sản phẩm: ${updated.name}`);
    } else {
      // Create
      const newProd: Product = {
        id: `prod_${Date.now()}`,
        name: formData.name,
        sku: formData.sku,
        barcode: formData.barcode,
        category: formData.category,
        baseUnit: formData.baseUnit,
        units: unitsList,
        costPrice: formData.costPrice,
        priceRetail: formData.retailPrice,
        priceWholesale: formData.wholesalePrice,
        priceVip: formData.vipPrice,
        stockBaseUnits: formData.stockBaseUnits,
        minStockAlert: formData.minStockAlert,
        hasSerial: false,
        hasExpiry: false
      };
      addProduct(newProd);
      showToast(`🎉 Đã thêm mới sản phẩm: ${newProd.name}`);
    }

    setIsProductModalOpen(false);
  };

  // Delete product action
  const handleConfirmDelete = () => {
    if (!deletingProduct) return;
    deleteProduct(deletingProduct.id);
    showToast(`🗑️ Đã xóa sản phẩm: ${deletingProduct.name}`);
    setDeletingProduct(null);
  };

  // Export Warehouse to CSV
  const handleExportWarehouse = () => {
    if (!canExportExcel) {
      showToast('🔒 Chỉ Quản trị viên (Admin) mới có quyền xuất file dữ liệu kho!');
      return;
    }
    const headers = ['SKU', 'Mã Vạch', 'Tên Sản Phẩm', 'Ngành Hàng', 'ĐVT Cơ Sở', 'Tồn Kho', 'Quy Đổi', 'Giá Vốn', 'Giá Bán Lẻ', 'Giá Sỉ', 'Giá VIP'];
    const rows = filteredProducts.map((p) => [
      p.sku,
      `'${p.barcode}`,
      `"${p.name}"`,
      p.category,
      p.baseUnit,
      p.stockBaseUnits,
      `"${getConvertedStockText(p)}"`,
      p.costPrice,
      p.priceRetail,
      p.priceWholesale,
      p.priceVip
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NEXUS_Kho_Hang_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📥 Đã xuất báo cáo tồn kho Excel / CSV thành công!');
  };

  return (
    <div className="p-6 space-y-6 w-full animate-in fade-in duration-200 text-slate-800 dark:text-slate-100">
      {/* 1. TOP HEADER & UNIFIED ACTION TOOLBAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-1 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Quản Lý Kho Hàng & Danh Mục Sản Phẩm (CRUD)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Kiểm soát vòng đời hàng hóa, phân loại đơn vị tính, quản lý giá 3 cấp và lô hạn FEFO
          </p>
        </div>

        {/* PRIMARY ACTION BUTTON GROUP */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Group 1: CRUD & Data Actions */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200 dark:border-slate-700/80 shadow-xs">
            <button
              onClick={handleOpenCreateProduct}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
              title="Thêm mặt hàng mới vào danh mục kho"
            >
              <Plus className="h-4 w-4" />
              <span>Thêm Sản Phẩm</span>
            </button>

            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1.5" />

            <button
              onClick={handleExportWarehouse}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 text-xs font-semibold transition-all active:scale-95"
              title="Xuất bảng kê kho ra file Excel/CSV"
            >
              <Download className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
              <span className="hidden sm:inline">Xuất Excel</span>
            </button>
          </div>

          {/* Group 2: Sub-Tab Segmented Switcher */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveSubTab('units')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeSubTab === 'units'
                  ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Quy Đổi ĐVT</span>
            </button>
            <button
              onClick={() => setActiveSubTab('fefo')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeSubTab === 'fefo'
                  ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Lô & FEFO Date</span>
            </button>
            <button
              onClick={() => setActiveSubTab('serials')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeSubTab === 'serials'
                  ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Barcode className="h-3.5 w-3.5" />
              <span>Serial / IMEI</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: ĐA ĐƠN VỊ TÍNH (PACKAGING & UNITS) */}
      {activeSubTab === 'units' && (
        <div className="space-y-4">
          {/* SEARCH & CATEGORY FILTER TOOLBAR */}
          <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center bg-white dark:bg-slate-900/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            {/* Search Input */}
            <div className="relative flex-1 md:max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setProductPage(1);
                }}
                placeholder="Tìm sản phẩm theo tên, SKU, mã vạch barcode..."
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Filter Dropdown & Category Segmented Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Stock status filter */}
              <select
                value={stockStatusFilter}
                onChange={(e) => {
                  setStockStatusFilter(e.target.value as any);
                  setProductPage(1);
                }}
                className="rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 font-semibold focus:outline-none"
              >
                <option value="all">Tất cả tồn kho</option>
                <option value="low_stock">⚠️ Cảnh báo sắp hết tồn</option>
                <option value="in_stock">✅ Còn nhiều hàng</option>
              </select>

              {/* Category Segmented Filter Buttons */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 p-0.5 border border-slate-200 dark:border-slate-700/60 overflow-x-auto">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setCategoryFilter(cat);
                        setProductPage(1);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                        categoryFilter === cat
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white font-bold shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {cat === 'all' ? 'Tất cả' : cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* MAIN PRODUCTS CONTAINER (TABLE ON DESKTOP, CARDS ON MOBILE) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden transition-colors">
            {/* DESKTOP TABLE VIEW */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="p-4">SKU / Mặt Hàng</th>
                    <th className="p-4">Ngành Hàng</th>
                    <th className="p-4">Hệ Thống ĐVT Quy Đổi</th>
                    <th className="p-4 text-right">Tồn Kho Cơ Sở</th>
                    <th className="p-4 text-right">Quy Đổi Thực Tế</th>
                    <th className="p-4 text-right">Giá Bán (Lẻ / Sỉ / VIP)</th>
                    {canViewCosts && <th className="p-4 text-right">Giá Vốn TB</th>}
                    <th className="p-4 text-center">Thao Tác (CRUD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {paginatedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 dark:text-slate-500">
                        Không tìm thấy mặt hàng nào phù hợp với bộ lọc tìm kiếm.
                      </td>
                    </tr>
                  ) : (
                    paginatedProducts.map((prod) => {
                      const isLow = prod.stockBaseUnits <= prod.minStockAlert;
                      return (
                        <tr key={prod.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          {/* Product Info */}
                          <td className="p-4">
                            <div className="font-bold text-slate-900 dark:text-white text-sm">{prod.name}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                              <span className="font-semibold text-indigo-600 dark:text-indigo-400">SKU: {prod.sku}</span>
                              <span>•</span>
                              <span>Mã vạch: {prod.barcode}</span>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-medium text-[11px]">
                              {prod.category}
                            </span>
                          </td>

                          {/* Packaging Units */}
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1.5">
                              {prod.units.map((u) => (
                                <span
                                  key={u.name}
                                  className="px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-500/30 dark:text-indigo-300 font-semibold text-[11px]"
                                >
                                  {u.name} (x{u.conversionRate})
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Base Stock */}
                          <td className="p-4 text-right font-mono font-bold">
                            <span className={isLow ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-200'}>
                              {prod.stockBaseUnits.toLocaleString('vi-VN')} {prod.baseUnit}
                            </span>
                            {isLow && (
                              <div className="text-[10px] text-rose-500 font-semibold mt-0.5">Cảnh báo sắp hết</div>
                            )}
                          </td>

                          {/* Converted Stock */}
                          <td className="p-4 text-right font-semibold text-indigo-600 dark:text-indigo-400 font-mono">
                            {getConvertedStockText(prod)}
                          </td>

                          {/* 3 Tier Prices */}
                          <td className="p-4 text-right font-mono text-[11px] space-y-0.5">
                            <div>Lẻ: <strong className="text-slate-900 dark:text-white font-bold">{prod.priceRetail.toLocaleString('vi-VN')}đ</strong></div>
                            <div className="text-slate-500 dark:text-slate-400">Sỉ: {prod.priceWholesale.toLocaleString('vi-VN')}đ • VIP: {prod.priceVip.toLocaleString('vi-VN')}đ</div>
                          </td>

                          {/* Cost Price (Admin only) */}
                          {canViewCosts && (
                            <td className="p-4 text-right font-mono text-slate-700 dark:text-slate-300 font-semibold">
                              {prod.costPrice.toLocaleString('vi-VN')} đ
                            </td>
                          )}

                          {/* CRUD ACTION BUTTON GROUP */}
                          <td className="p-4 text-center">
                            <RowActionMenu
                              items={[
                                {
                                  id: `edit-${prod.id}`,
                                  label: 'Chỉnh sửa thông tin & ĐVT',
                                  icon: Edit2,
                                  variant: 'indigo',
                                  onClick: () => handleOpenEditProduct(prod),
                                },
                                {
                                  id: `delete-${prod.id}`,
                                  label: 'Xóa mặt hàng',
                                  icon: Trash2,
                                  variant: 'danger',
                                  divider: true,
                                  onClick: () => setDeletingProduct(prod),
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
              {paginatedProducts.length === 0 ? (
                <div className="p-6 text-center text-slate-400 dark:text-slate-500">
                  Không tìm thấy mặt hàng nào phù hợp với bộ lọc tìm kiếm.
                </div>
              ) : (
                paginatedProducts.map((prod) => {
                  const isLow = prod.stockBaseUnits <= prod.minStockAlert;
                  return (
                    <div key={prod.id} className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                            SKU: {prod.sku}
                          </div>
                          <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                            {prod.name}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            Mã vạch: {prod.barcode}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-medium text-[10px]">
                          {prod.category}
                        </span>
                      </div>

                      {/* Stock & conversion info */}
                      <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl text-xs">
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 text-[11px]">Tồn kho:</span>
                          <div className={`font-mono font-bold ${isLow ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                            {prod.stockBaseUnits.toLocaleString('vi-VN')} {prod.baseUnit}
                          </div>
                          {isLow && <span className="text-[10px] text-rose-500 font-semibold">Cận hạn tồn</span>}
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 text-[11px]">Quy đổi:</span>
                          <div className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                            {getConvertedStockText(prod)}
                          </div>
                        </div>
                      </div>

                      {/* Pricing info */}
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Giá bán lẻ:</span>
                        <strong className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                          {prod.priceRetail.toLocaleString('vi-VN')} đ
                        </strong>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                        <RowActionMenu
                          label="Thao tác"
                          items={[
                            {
                              id: `edit-${prod.id}`,
                              label: 'Chỉnh sửa thông tin & ĐVT',
                              icon: Edit2,
                              variant: 'indigo',
                              onClick: () => handleOpenEditProduct(prod),
                            },
                            {
                              id: `delete-${prod.id}`,
                              label: 'Xóa mặt hàng',
                              icon: Trash2,
                              variant: 'danger',
                              divider: true,
                              onClick: () => setDeletingProduct(prod),
                            },
                          ]}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination Component */}
            <Pagination
              currentPage={productPage}
              pageSize={productPageSize}
              totalItems={totalProductItems}
              onPageChange={setProductPage}
              onPageSizeChange={(size) => {
                setProductPageSize(size);
                setProductPage(1);
              }}
              pageSizeOptions={[8, 16, 32, 64]}
            />
          </div>
        </div>
      )}

      {/* SUB-TAB 2: LÔ HÀNG & FEFO EXPIRY DATE */}
      {activeSubTab === 'fefo' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>
                <strong>Nguyên tắc xuất kho FEFO (First-Expired, First-Out):</strong> Các lô hàng có ngày hết hạn sớm nhất sẽ luôn được ưu tiên đề xuất xuất kho đầu tiên để giảm thiểu rủi ro hủy hàng quá date.
              </span>
            </div>
          </div>

          {/* FEFO FILTER & SEARCH TOOLBAR */}
          <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center bg-white dark:bg-slate-900/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="relative flex-1 md:max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setFefoPage(1);
                }}
                placeholder="Tìm theo số lô (Batch ID), SKU..."
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* FEFO Status Filter Segmented Buttons */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 p-0.5 border border-slate-200 dark:border-slate-700/60 overflow-x-auto">
                {[
                  { id: 'all', label: 'Tất cả lô' },
                  { id: 'urgent', label: '⚠️ Cận date (≤30 ngày)' },
                  { id: 'expired', label: '🛑 Đã hết hạn' },
                  { id: 'safe', label: '✅ An toàn (>30 ngày)' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setFefoStatusFilter(item.id as any);
                      setFefoPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      fefoStatusFilter === item.id
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white font-bold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden">
            {/* DESKTOP TABLE VIEW */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="p-4">Số Lô (Batch ID)</th>
                    <th className="p-4">SKU Sản Phẩm</th>
                    <th className="p-4">Ngày Sản Xuất</th>
                    <th className="p-4">Hạn Sử Dụng (EXP)</th>
                    <th className="p-4 text-center">Trạng Thái / Còn Lại</th>
                    <th className="p-4 text-right">Số Lượng Tồn Lô</th>
                    <th className="p-4">Vị Trí Kệ Hàng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {paginatedBatches.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 dark:text-slate-500">
                        Không có lô hàng nào phù hợp với điều kiện tìm kiếm.
                      </td>
                    </tr>
                  ) : (
                    paginatedBatches.map((b) => {
                      const isExpired = b.daysRemaining <= 0;
                      const isUrgent = b.daysRemaining > 0 && b.daysRemaining <= 30;

                      return (
                        <tr key={b.batchId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">{b.batchId}</td>
                          <td className="p-4 font-mono text-slate-600 dark:text-slate-300">{b.sku}</td>
                          <td className="p-4 font-mono text-slate-500 dark:text-slate-400">{b.productionDate}</td>
                          <td className="p-4 font-mono font-semibold text-slate-900 dark:text-white">{b.expiryDate}</td>
                          <td className="p-4 text-center">
                            {isExpired ? (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-200 dark:border-rose-500/40">
                                ĐÃ HẾT HẠN
                              </span>
                            ) : isUrgent ? (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40 animate-pulse">
                                Còn {b.daysRemaining} ngày (Cận date)
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                                Còn {b.daysRemaining} ngày
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right font-mono font-black text-slate-900 dark:text-white">
                            {b.quantityBaseUnits.toLocaleString('vi-VN')}
                          </td>
                          <td className="p-4 font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                            {b.warehouseLocation}
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
              {paginatedBatches.length === 0 ? (
                <div className="p-6 text-center text-slate-400 dark:text-slate-500">
                  Không có lô hàng nào phù hợp với điều kiện tìm kiếm.
                </div>
              ) : (
                paginatedBatches.map((b) => {
                  const isExpired = b.daysRemaining <= 0;
                  const isUrgent = b.daysRemaining > 0 && b.daysRemaining <= 30;

                  return (
                    <div key={b.batchId} className="p-4 space-y-2.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                            Lô: {b.batchId}
                          </div>
                          <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                            SKU: {b.sku}
                          </div>
                        </div>
                        <div>
                          {isExpired ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-200 dark:border-rose-500/40">
                              ĐÃ HẾT HẠN
                            </span>
                          ) : isUrgent ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40 animate-pulse">
                              Còn {b.daysRemaining} ngày
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                              Còn {b.daysRemaining} ngày
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl font-mono">
                        <div>
                          <span className="text-slate-400 text-[10px] block">Ngày sản xuất:</span>
                          <span className="text-slate-700 dark:text-slate-300">{b.productionDate}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Hạn dùng (EXP):</span>
                          <span className="font-bold text-slate-900 dark:text-white">{b.expiryDate}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Số lượng tồn:</span>
                          <span className="font-black text-slate-900 dark:text-white text-sm">
                            {b.quantityBaseUnits.toLocaleString('vi-VN')}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Vị trí kệ:</span>
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                            {b.warehouseLocation}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* FEFO Pagination Component */}
            <Pagination
              currentPage={fefoPage}
              pageSize={fefoPageSize}
              totalItems={totalBatchItems}
              onPageChange={setFefoPage}
              onPageSizeChange={(size) => {
                setFefoPageSize(size);
                setFefoPage(1);
              }}
              pageSizeOptions={[8, 16, 32, 64]}
            />
          </div>
        </div>
      )}

      {/* SUB-TAB 3: TRA CỨU VÒNG ĐỜI SERIAL / IMEI */}
      {activeSubTab === 'serials' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 max-w-2xl">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Barcode className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Tra Cứu Vòng Đời Thiết Bị Bằng Serial / IMEI
            </h3>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={serialLookupQuery}
                  onChange={(e) => setSerialLookupQuery(e.target.value)}
                  placeholder="Nhập chính xác mã Serial/IMEI (VD: LG-55-2024-001)..."
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <button
                onClick={() =>
                  openScannerModal((code) => {
                    setSerialLookupQuery(code);
                  })
                }
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-300 dark:border-slate-700"
              >
                <ScanBarcode className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>Quét</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span>Mẫu thử nghiệm nhanh:</span>
              {serials.slice(0, 3).map((s) => (
                <button
                  key={s.serialNumber}
                  onClick={() => setSerialLookupQuery(s.serialNumber)}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-300 font-mono"
                >
                  {s.serialNumber}
                </button>
              ))}
            </div>
          </div>

          {/* Lookup Result Box */}
          {serialLookupQuery && (
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl max-w-2xl space-y-4 animate-in fade-in duration-200">
              {foundSerial ? (
                <>
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Thiết Bị</span>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base font-mono">{foundSerial.serialNumber}</h4>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400">{foundSerial.productName} ({foundSerial.sku})</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      foundSerial.status === 'in_stock'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                        : foundSerial.status === 'sold'
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
                    }`}>
                      {foundSerial.status === 'in_stock' ? 'Đang tồn kho' : foundSerial.status === 'sold' ? 'Đã xuất bán' : 'Bảo hành'}
                    </span>
                  </div>

                  {/* Lifecycle Timeline */}
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Lịch Sử Vòng Đời Thiết Bị:</div>

                    <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-4 text-xs">
                      {foundSerial.timeline && foundSerial.timeline.length > 0 ? (
                        foundSerial.timeline.map((evt, idx) => (
                          <div key={evt.id || idx} className="relative">
                            <span className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white">✓</span>
                            <div className="font-bold text-slate-900 dark:text-white">{evt.description}</div>
                            <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                              Thời gian: {evt.timestamp} • Người thực hiện: {evt.actor}
                              {evt.referenceCode && (
                                <span className="text-indigo-600 dark:text-indigo-400 font-bold ml-1">
                                  [{evt.referenceCode}]
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <>
                          {/* Fallback Event 1: Import */}
                          <div className="relative">
                            <span className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] text-white">✓</span>
                            <div className="font-bold text-slate-900 dark:text-white">Nhập Kho Hàng Hóa</div>
                            <div className="text-slate-500 dark:text-slate-400">Thời gian: {foundSerial.importDate}</div>
                            <div className="text-slate-500 dark:text-slate-400">Nhà cung cấp: {foundSerial.supplier}</div>
                          </div>

                          {/* Fallback Event 2: Sale */}
                          {foundSerial.status === 'sold' && (
                            <div className="relative">
                              <span className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white">✓</span>
                              <div className="font-bold text-slate-900 dark:text-white">Xuất Bán & Kích Hoạt Bảo Hành</div>
                              <div className="text-slate-500 dark:text-slate-400">Thời gian xuất: {foundSerial.importDate}</div>
                              <div className="text-slate-500 dark:text-slate-400">Mã đơn xuất: <strong className="text-indigo-600 dark:text-indigo-300 font-mono">{foundSerial.orderCode || 'DH-POS-001'}</strong></div>
                              <div className="text-slate-500 dark:text-slate-400">Khách hàng nhận: {foundSerial.customerName || 'Đại lý Điện Máy Toàn Cầu'}</div>
                              <div className="text-emerald-600 dark:text-emerald-400 font-semibold">Thời hạn bảo hành: đến {foundSerial.warrantyUntil}</div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Không tìm thấy thông tin cho Serial / IMEI: <strong className="text-slate-600 dark:text-slate-300 font-mono">{serialLookupQuery}</strong>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT PRODUCT (CRUD) ================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Boxes className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                {editingProduct ? `Chỉnh Sửa Mặt Hàng: ${editingProduct.name}` : 'Thêm Mặt Hàng Mới Vào Kho'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              {/* Row 1: Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Tên sản phẩm *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="VD: Smart Tivi 4K Samsung 55 inch..."
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Ngành hàng / Phân loại</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Product['category'] })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Điện Máy">Điện Máy</option>
                    <option value="Gia Dụng">Gia Dụng</option>
                    <option value="Hóa Mỹ Phẩm">Hóa Mỹ Phẩm</option>
                    <option value="Vật Liệu">Vật Liệu</option>
                    <option value="Dịch Vụ">Dịch Vụ</option>
                  </select>
                </div>
              </div>

              {/* Row 2: SKU & Barcode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Mã SKU</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 font-mono font-bold text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Mã Vạch Barcode</label>
                  <input
                    type="text"
                    required
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Row 3: Packaging & Units */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-indigo-500" />
                  Quy Đổi Đơn Vị Tính (ĐVT Cơ sở & ĐVT Lớn)
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600 dark:text-slate-400">ĐVT cơ sở (Nhỏ nhất)</label>
                    <input
                      type="text"
                      value={formData.baseUnit}
                      onChange={(e) => setFormData({ ...formData, baseUnit: e.target.value })}
                      placeholder="VD: Cái, Chai, Lon..."
                      className="w-full rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600 dark:text-slate-400">ĐVT quy đổi phụ (Lớn hơn)</label>
                    <input
                      type="text"
                      value={formData.subUnitName}
                      onChange={(e) => setFormData({ ...formData, subUnitName: e.target.value })}
                      placeholder="VD: Thùng, Hộp, Kiện..."
                      className="w-full rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600 dark:text-slate-400">Tỷ lệ quy đổi (x ĐVT cơ sở)</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.subUnitRate}
                      onChange={(e) => setFormData({ ...formData, subUnitRate: parseInt(e.target.value) || 1 })}
                      className="w-full rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 font-mono text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: Pricing Matrix (Cost, Retail, Wholesale, VIP) */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Ma Trận Giá Bán 3 Cấp & Giá Vốn (VNĐ)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Tự động áp dụng theo loại khách</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600 dark:text-slate-400">Giá Vốn TB</label>
                    <MoneyInput
                      value={formData.costPrice}
                      onChange={(val) => setFormData({ ...formData, costPrice: val })}
                      placeholder="0"
                      suffix="đ"
                      className="w-full rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 font-mono font-bold text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-indigo-600 dark:text-indigo-400">Giá Bán Lẻ</label>
                    <MoneyInput
                      value={formData.retailPrice}
                      onChange={(val) => setFormData({ ...formData, retailPrice: val })}
                      placeholder="0"
                      suffix="đ"
                      className="w-full rounded-lg bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-500/50 px-2.5 py-1.5 font-mono font-bold text-xs text-indigo-700 dark:text-indigo-300"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-emerald-600 dark:text-emerald-400">Giá Bán Buôn (Sỉ)</label>
                    <MoneyInput
                      value={formData.wholesalePrice}
                      onChange={(val) => setFormData({ ...formData, wholesalePrice: val })}
                      placeholder="0"
                      suffix="đ"
                      className="w-full rounded-lg bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/50 px-2.5 py-1.5 font-mono font-bold text-xs text-emerald-700 dark:text-emerald-300"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-amber-600 dark:text-amber-400">Giá Khách VIP</label>
                    <MoneyInput
                      value={formData.vipPrice}
                      onChange={(val) => setFormData({ ...formData, vipPrice: val })}
                      placeholder="0"
                      suffix="đ"
                      className="w-full rounded-lg bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-500/50 px-2.5 py-1.5 font-mono font-bold text-xs text-amber-700 dark:text-amber-300"
                    />
                  </div>
                </div>
              </div>

              {/* Row 5: Stock Quantities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Tồn kho ban đầu (theo ĐVT cơ sở)</label>
                  <input
                    type="number"
                    value={formData.stockBaseUnits}
                    onChange={(e) => setFormData({ ...formData, stockBaseUnits: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 font-mono font-bold text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Mức cảnh báo tồn tối thiểu</label>
                  <input
                    type="number"
                    value={formData.minStockAlert}
                    onChange={(e) => setFormData({ ...formData, minStockAlert: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 font-mono text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md active:scale-95 transition-all"
                >
                  {editingProduct ? 'Cập Nhật Sản Phẩm' : 'Tạo Mặt Hàng Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE PRODUCT CONFIRMATION ================= */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-2.5 rounded-full bg-rose-100 dark:bg-rose-900/30">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-base">Xác Nhận Xóa Sản Phẩm</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Hành động này sẽ xóa dữ liệu khỏi hệ thống</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1.5">
              <div>Tên sản phẩm: <strong className="text-slate-900 dark:text-white">{deletingProduct.name}</strong></div>
              <div>Mã SKU: <strong className="font-mono text-indigo-600 dark:text-indigo-400">{deletingProduct.sku}</strong></div>
              <div>Tồn kho hiện tại: <strong className="font-mono text-slate-900 dark:text-white">{deletingProduct.stockBaseUnits} {deletingProduct.baseUnit}</strong></div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

