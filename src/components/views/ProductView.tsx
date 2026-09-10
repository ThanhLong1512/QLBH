"use client";
import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import { Product, PackagingUnit } from '../../types/erp';
import { Pagination } from '../common/Pagination';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Download,
  AlertTriangle,
  Layers,
  Barcode,
  CheckCircle2,
  X,
  Boxes,
  Tag,
  DollarSign,
  ScanBarcode,
  Copy,
  ExternalLink
} from 'lucide-react';

export const ProductView: React.FC = () => {
  const {
    products,
    canViewCosts,
    canExportExcel,
    getConvertedStockText,
    openScannerModal,
    showToast,
    addProduct,
    updateProduct,
    deleteProduct
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    sku: '',
    barcode: '',
    name: '',
    category: 'Điện Máy',
    baseUnit: 'Cái',
    costPrice: 0,
    retailPrice: 0,
    wholesalePrice: 0,
    vipPrice: 0,
    stockBaseUnits: 0,
    minStockThreshold: 5,
    trackFefo: false,
    trackSerial: false,
    image: '',
    hasMultiUnit: false,
    secondaryUnitName: 'Thùng',
    secondaryConversionRate: 10,
    secondaryWholesalePrice: 0
  });

  // Extract unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category))).filter(Boolean);
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.barcode && p.barcode.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory = categoryFilter === 'all' || p.category === categoryFilter;

      let matchStock = true;
      if (stockStatusFilter === 'in_stock') {
        matchStock = p.stockBaseUnits > p.minStockAlert;
      } else if (stockStatusFilter === 'low_stock') {
        matchStock = p.stockBaseUnits > 0 && p.stockBaseUnits <= p.minStockAlert;
      } else if (stockStatusFilter === 'out_of_stock') {
        matchStock = p.stockBaseUnits <= 0;
      }

      return matchSearch && matchCategory && matchStock;
    });
  }, [products, searchQuery, categoryFilter, stockStatusFilter]);

  // Paginated Products
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  // Statistics Summary
  const stats = useMemo(() => {
    const total = products.length;
    const lowStock = products.filter(p => p.stockBaseUnits > 0 && p.stockBaseUnits <= p.minStockAlert).length;
    const outOfStock = products.filter(p => p.stockBaseUnits <= 0).length;
    const inStock = total - lowStock - outOfStock;
    const totalInventoryValue = products.reduce((sum, p) => sum + p.stockBaseUnits * p.costPrice, 0);

    return { total, inStock, lowStock, outOfStock, totalInventoryValue };
  }, [products]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      sku: `SP-${Date.now().toString().slice(-6)}`,
      barcode: `${Math.floor(8930000000000 + Math.random() * 999999999)}`,
      name: '',
      category: categories[0] || 'Điện Máy',
      baseUnit: 'Cái',
      costPrice: 0,
      retailPrice: 0,
      wholesalePrice: 0,
      vipPrice: 0,
      stockBaseUnits: 10,
      minStockThreshold: 5,
      trackFefo: false,
      trackSerial: false,
      image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=160&auto=format&fit=crop&q=80',
      hasMultiUnit: false,
      secondaryUnitName: 'Thùng',
      secondaryConversionRate: 10,
      secondaryWholesalePrice: 0
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    const secUnit = product.units.find(u => !u.isBase);
    setFormData({
      sku: product.sku,
      barcode: product.barcode || '',
      name: product.name,
      category: product.category,
      baseUnit: product.baseUnit,
      costPrice: product.costPrice,
      retailPrice: product.priceRetail,
      wholesalePrice: product.priceWholesale,
      vipPrice: product.priceVip,
      stockBaseUnits: product.stockBaseUnits,
      minStockThreshold: product.minStockAlert,
      trackFefo: !!product.hasExpiry,
      trackSerial: !!product.hasSerial,
      image: product.imageUrl || '',
      hasMultiUnit: !!secUnit,
      secondaryUnitName: secUnit ? secUnit.name : 'Thùng',
      secondaryConversionRate: secUnit ? secUnit.conversionRate : 10,
      secondaryWholesalePrice: secUnit ? secUnit.priceWholesale : 0
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sku.trim()) {
      showToast('⚠️ Vui lòng nhập đầy đủ tên và mã SKU sản phẩm');
      return;
    }

    const units: PackagingUnit[] = [
      {
        name: formData.baseUnit,
        conversionRate: 1,
        isBase: true,
        priceRetail: Number(formData.retailPrice),
        priceWholesale: Number(formData.wholesalePrice),
        priceVip: Number(formData.vipPrice)
      }
    ];

    if (formData.hasMultiUnit && formData.secondaryUnitName) {
      units.push({
        name: formData.secondaryUnitName,
        conversionRate: Number(formData.secondaryConversionRate) || 1,
        isBase: false,
        priceRetail: Number(formData.retailPrice) * (Number(formData.secondaryConversionRate) || 1),
        priceWholesale: Number(formData.secondaryWholesalePrice) || Number(formData.wholesalePrice) * (Number(formData.secondaryConversionRate) || 1),
        priceVip: Number(formData.vipPrice) * (Number(formData.secondaryConversionRate) || 1)
      });
    }

    const productPayload: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      sku: formData.sku.toUpperCase(),
      barcode: formData.barcode,
      name: formData.name.trim(),
      category: formData.category,
      baseUnit: formData.baseUnit,
      costPrice: Number(formData.costPrice),
      priceRetail: Number(formData.retailPrice),
      priceWholesale: Number(formData.wholesalePrice),
      priceVip: Number(formData.vipPrice),
      stockBaseUnits: Number(formData.stockBaseUnits),
      minStockAlert: Number(formData.minStockThreshold),
      units,
      hasExpiry: formData.trackFefo,
      hasSerial: formData.trackSerial,
      imageUrl: formData.image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=160&auto=format&fit=crop&q=80'
    };

    if (editingProduct) {
      updateProduct(productPayload);
    } else {
      addProduct(productPayload);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}" khỏi danh mục?`)) {
      deleteProduct(id);
    }
  };

  const exportExcel = () => {
    const csvContent = [
      ['Mã SKU', 'Mã Vạch', 'Tên Sản Phẩm', 'Danh Mục', 'ĐVT Cơ Bản', 'Giá Vốn', 'Giá Lẻ', 'Giá Sỉ', 'Giá VIP', 'Tồn Kho', 'Cảnh Báo Min'].join(','),
      ...products.map(p =>
        [
          `"${p.sku}"`,
          `"${p.barcode || ''}"`,
          `"${p.name}"`,
          `"${p.category}"`,
          `"${p.baseUnit}"`,
          p.costPrice,
          p.priceRetail,
          p.priceWholesale,
          p.priceVip,
          p.stockBaseUnits,
          p.minStockAlert
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Danh_Sach_San_Pham_NEXUS_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast('📥 Đã xuất file danh mục sản phẩm CSV/Excel thành công!');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Header & Quick Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Quản Lý Sản Phẩm & Danh Mục Hàng Hóa
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Quản lý mã SKU, mã vạch Barcode, bảng giá đa cấp (Lẻ/Sỉ/VIP), quy đổi đơn vị tính Thùng/Cái & định mức tồn
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {canExportExcel && (
            <button
              id="export-products-btn"
              onClick={exportExcel}
              className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              Xuất Excel / CSV
            </button>
          )}

          <button
            id="scan-product-barcode-btn"
            onClick={() =>
              openScannerModal(code => {
                setSearchQuery(code);
                showToast(`🔍 Tìm kiếm theo mã quét: ${code}`);
              })
            }
            className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <ScanBarcode className="w-4 h-4 text-indigo-500" />
            Quét Mã Vạch
          </button>

          <button
            id="create-product-btn"
            onClick={handleOpenAdd}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Thêm Mới Sản Phẩm
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Tổng Sản Phẩm</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</span>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{categories.length} nhóm</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Đủ Tồn Kho An Toàn</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.inStock}</span>
            <span className="text-xs text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">Sẵn sàng bán</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Cảnh Báo Sắp Hết</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.lowStock}</span>
            <span className="text-xs text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded font-medium">≤ Định mức min</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Hết Hàng Trong Kho</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">{stats.outOfStock}</span>
            <span className="text-xs text-rose-600 bg-rose-500/10 px-1.5 py-0.5 rounded font-medium">0 tồn kho</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm col-span-2 lg:col-span-1">
          <span className="text-xs text-slate-500 font-medium">Tổng Giá Trị Tồn Kho</span>
          <div className="mt-1">
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              {canViewCosts ? `${stats.totalInventoryValue.toLocaleString('vi-VN')} đ` : '•••••••• đ'}
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">Theo giá vốn nhập kho</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, mã SKU hoặc mã vạch barcode..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          {/* Category filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Ngành:</span>
          </div>
          <select
            value={categoryFilter}
            onChange={e => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">Tất cả danh mục ({products.length})</option>
            {categories.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Stock status filter */}
          <select
            value={stockStatusFilter}
            onChange={e => {
              setStockStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">Tất cả tình trạng tồn</option>
            <option value="in_stock">Tồn an toàn</option>
            <option value="low_stock">Cảnh báo tồn ít (≤ min)</option>
            <option value="out_of_stock">Đã hết hàng (0 tồn)</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold">
                <th className="py-3 px-4">Sản Phẩm & Mã SKU</th>
                <th className="py-3 px-4">Ngành Hàng</th>
                <th className="py-3 px-4">Đơn Vị Quy Đổi</th>
                <th className="py-3 px-4 text-right">Giá Bán Lẻ / Sỉ</th>
                {canViewCosts && <th className="py-3 px-4 text-right">Giá Vốn Nhập</th>}
                <th className="py-3 px-4 text-center">Tồn Kho Khả Dụng</th>
                <th className="py-3 px-4 text-center">Theo Dõi Lô/Serial</th>
                <th className="py-3 px-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={canViewCosts ? 8 : 7} className="py-12 text-center text-slate-400">
                    <Boxes className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    Không tìm thấy sản phẩm nào phù hợp với bộ lọc
                  </td>
                </tr>
              ) : (
                paginatedProducts.map(product => {
                  const isLow = product.stockBaseUnits > 0 && product.stockBaseUnits <= product.minStockAlert;
                  const isOut = product.stockBaseUnits <= 0;
                  const secondaryUnit = product.units.find(u => !u.isBase);

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Product & SKU */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.imageUrl || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=100&auto=format&fit=crop&q=80'}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-white block group-hover:text-indigo-600 transition-colors">
                              {product.name}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                                {product.sku}
                              </span>
                              {product.barcode && (
                                <span className="font-mono text-[10px] text-slate-400 flex items-center gap-0.5">
                                  <Barcode className="w-3 h-3" />
                                  {product.barcode}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {product.category}
                        </span>
                      </td>

                      {/* Packaging Units */}
                      <td className="py-3 px-4">
                        <div className="text-[11px]">
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            1 {product.baseUnit}
                          </span>
                          {secondaryUnit && (
                            <span className="text-slate-500 dark:text-slate-400 block text-[10px]">
                              = 1/{secondaryUnit.conversionRate} {secondaryUnit.name}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Selling Prices */}
                      <td className="py-3 px-4 text-right">
                        <div className="text-[11px]">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {product.priceRetail.toLocaleString('vi-VN')} đ
                          </span>
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 block">
                            Sỉ: {product.priceWholesale.toLocaleString('vi-VN')} đ
                          </span>
                        </div>
                      </td>

                      {/* Cost Price */}
                      {canViewCosts && (
                        <td className="py-3 px-4 text-right">
                          <span className="text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                            {product.costPrice.toLocaleString('vi-VN')} đ
                          </span>
                        </td>
                      )}

                      {/* Stock on Hand */}
                      <td className="py-3 px-4 text-center">
                        <div>
                          <span
                            className={`inline-flex items-center gap-1 font-bold text-xs px-2 py-0.5 rounded-full ${
                              isOut
                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                : isLow
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {isOut && <AlertTriangle className="w-3 h-3" />}
                            {product.stockBaseUnits} {product.baseUnit}
                          </span>
                          {secondaryUnit && product.stockBaseUnits > 0 && (
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {getConvertedStockText(product)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Tracking Options */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {product.hasExpiry && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-medium">
                              Lô FEFO
                            </span>
                          )}
                          {product.hasSerial && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-medium">
                              IMEI
                            </span>
                          )}
                          {!product.hasExpiry && !product.hasSerial && (
                            <span className="text-slate-300 dark:text-slate-600 text-[11px]">—</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            id={`edit-product-${product.id}`}
                            onClick={() => handleOpenEdit(product)}
                            title="Chỉnh sửa sản phẩm"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`delete-product-${product.id}`}
                            onClick={() => handleDelete(product.id, product.name)}
                            title="Xóa sản phẩm"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

        {/* Pagination bar */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredProducts.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemName="sản phẩm"
          className="border-t border-slate-200 dark:border-slate-800"
        />
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-6 py-4 backdrop-blur">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />
                {editingProduct ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mã SKU Sản Phẩm *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono uppercase focus:ring-2 focus:ring-indigo-500"
                    placeholder="VD: DM-SAM-43CU8000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mã Vạch Barcode
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.barcode}
                      onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono focus:ring-2 focus:ring-indigo-500"
                      placeholder="VD: 8936018273910"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        openScannerModal(c => {
                          setFormData(prev => ({ ...prev, barcode: c }));
                        })
                      }
                      className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 shrink-0"
                    >
                      <ScanBarcode className="w-4 h-4 text-indigo-500" />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tên Sản Phẩm Đầy Đủ *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                  placeholder="VD: Smart Tivi Samsung 43 inch Crystal UHD 4K (43CU8000)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ngành Hàng / Nhóm *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                    placeholder="VD: Điện Máy, Gia Dụng..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ĐVT Cơ Bản (Nhỏ nhất) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.baseUnit}
                    onChange={e => setFormData({ ...formData, baseUnit: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                    placeholder="VD: Chiếc, Can, Cái, Lon"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Link Ảnh Sản Phẩm
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Pricing Section */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Chính Sách Bảng Giá & Giá Vốn
                </span>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Giá Vốn Nhập Kho
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.costPrice}
                      onChange={e => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Giá Bán Lẻ Quầy *
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={formData.retailPrice}
                      onChange={e => setFormData({ ...formData, retailPrice: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Giá Bán Sỉ Đại Lý
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.wholesalePrice}
                      onChange={e => setFormData({ ...formData, wholesalePrice: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Giá Khách VIP
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.vipPrice}
                      onChange={e => setFormData({ ...formData, vipPrice: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Stock & Threshold */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Số Lượng Tồn Ban Đầu ({formData.baseUnit})
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.stockBaseUnits}
                    onChange={e => setFormData({ ...formData, stockBaseUnits: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Định Mức Tồn Min (Cảnh báo hết)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.minStockThreshold}
                    onChange={e => setFormData({ ...formData, minStockThreshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Multi-unit packaging */}
              <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasMultiUnit}
                    onChange={e => setFormData({ ...formData, hasMultiUnit: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Khai báo đơn vị bao bì cấp 2 (Quy đổi Thùng / Kiện / Lốc)
                  </span>
                </label>

                {formData.hasMultiUnit && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">
                        Tên ĐVT Cấp 2
                      </label>
                      <input
                        type="text"
                        value={formData.secondaryUnitName}
                        onChange={e => setFormData({ ...formData, secondaryUnitName: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        placeholder="VD: Thùng"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">
                        Hệ Số Quy Đổi (1 ĐVT cấp 2 = ? {formData.baseUnit})
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={formData.secondaryConversionRate}
                        onChange={e => setFormData({ ...formData, secondaryConversionRate: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-indigo-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">
                        Giá Bán Sỉ Theo ĐVT Cấp 2
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={formData.secondaryWholesalePrice}
                        onChange={e => setFormData({ ...formData, secondaryWholesalePrice: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        placeholder="Tự động tính nếu để 0"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Special Tracking */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <input
                    type="checkbox"
                    checked={formData.trackFefo}
                    onChange={e => setFormData({ ...formData, trackFefo: e.target.checked })}
                    className="rounded text-indigo-600 w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                      Quản lý Lô Date & FEFO
                    </span>
                    <span className="text-[10px] text-slate-500">Bắt buộc nhập số lô & ngày hết hạn</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <input
                    type="checkbox"
                    checked={formData.trackSerial}
                    onChange={e => setFormData({ ...formData, trackSerial: e.target.checked })}
                    className="rounded text-indigo-600 w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                      Quản lý Serial / IMEI
                    </span>
                    <span className="text-[10px] text-slate-500">Mỗi chiếc có mã định danh duy nhất</span>
                  </div>
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                >
                  {editingProduct ? 'Cập Nhật Sản Phẩm' : 'Lưu Sản Phẩm Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

