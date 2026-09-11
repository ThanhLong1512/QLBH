"use client";
import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Product, ProductBatch, SerialItem, PackagingUnit, ProductVariant } from '../../types/erp';
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
  CalendarPlus,
  Building2,
  Store,
  ClipboardList,
  MapPin,
  Phone,
  RefreshCw,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';

export const WarehouseView: React.FC = () => {
  const {
    products,
    batches,
    serials,
    warehouses,
    branches,
    activeWarehouse,
    setActiveWarehouse,
    addWarehouse,
    addBranch,
    stockBalances,
    stockLedgers,
    fetchStockLedger,
    fetchStockBalances,
    canViewCosts,
    canExportExcel,
    getConvertedStockText,
    openScannerModal,
    showToast,
    addProduct,
    updateProduct,
    deleteProduct,
    addBatch
  } = useERP();

  const [activeSubTab, setActiveSubTab] = useState<'units' | 'fefo' | 'serials' | 'variants' | 'warehouses' | 'ledger'>('units');
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

  // Batch Create Modal State
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchFormData, setBatchFormData] = useState({
    productId: '',
    batchNumber: '',
    productionDate: new Date().toISOString().slice(0, 10),
    expiryDate: new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10),
    quantity: 50,
    warehouseLocation: 'Kệ A-01'
  });

  const handleOpenCreateBatch = () => {
    const p = products[0];
    setBatchFormData({
      productId: p ? p.id : '',
      batchNumber: `LÔ-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`,
      productionDate: new Date().toISOString().slice(0, 10),
      expiryDate: new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10),
      quantity: 50,
      warehouseLocation: 'Kệ A-01'
    });
    setIsBatchModalOpen(true);
  };

  const handleSaveBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchFormData.batchNumber.trim()) {
      showToast('⚠️ Vui lòng nhập số lô sản xuất!');
      return;
    }
    const prod = products.find(p => p.id === batchFormData.productId);
    if (!prod) {
      showToast('⚠️ Vui lòng chọn sản phẩm!');
      return;
    }
    const exp = new Date(batchFormData.expiryDate).getTime();
    const daysRemaining = Math.ceil((exp - Date.now()) / (1000 * 60 * 60 * 24));

    addBatch({
      batchId: batchFormData.batchNumber.trim(),
      productId: prod.id,
      sku: prod.sku,
      productionDate: batchFormData.productionDate,
      expiryDate: batchFormData.expiryDate,
      daysRemaining,
      quantityBaseUnits: batchFormData.quantity,
      warehouseLocation: batchFormData.warehouseLocation.trim() || 'Kho Tổng'
    });

    setIsBatchModalOpen(false);
  };

  // Product Variant Modal State & Handlers
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [variantSelectedProduct, setVariantSelectedProduct] = useState<Product | null>(null);
  const [variantFormData, setVariantFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    priceDifference: 0,
    stockBaseUnits: 20
  });

  const handleOpenAddVariant = (prod: Product) => {
    setVariantSelectedProduct(prod);
    setVariantFormData({
      name: 'Size M - Màu Đen',
      sku: `${prod.sku}-M-BLK`,
      barcode: `893${Math.floor(100000000 + Math.random() * 900000000)}`,
      priceDifference: 0,
      stockBaseUnits: 20
    });
    setIsVariantModalOpen(true);
  };

  const handleSaveVariant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!variantSelectedProduct) return;
    if (!variantFormData.name.trim()) {
      showToast('⚠️ Vui lòng nhập tên biến thể (Size/Màu sắc)!');
      return;
    }

    const diff = variantFormData.priceDifference || 0;
    const newVariant: ProductVariant = {
      id: `var_${Date.now()}`,
      productId: variantSelectedProduct.id,
      name: variantFormData.name.trim(),
      sku: variantFormData.sku.trim() || `${variantSelectedProduct.sku}-VAR`,
      barcode: variantFormData.barcode.trim(),
      priceRetail: variantSelectedProduct.priceRetail + diff,
      priceDifference: diff,
      stockBaseUnits: variantFormData.stockBaseUnits
    };

    const updatedProduct: Product = {
      ...variantSelectedProduct,
      hasVariants: true,
      variants: [...(variantSelectedProduct.variants || []), newVariant],
      stockBaseUnits: variantSelectedProduct.stockBaseUnits + variantFormData.stockBaseUnits
    };

    updateProduct(updatedProduct);
    setVariantSelectedProduct(updatedProduct);
    showToast(`✨ Đã thêm biến thể "${newVariant.name}" cho sản phẩm ${variantSelectedProduct.name}!`);
    setIsVariantModalOpen(false);
  };

  // Master Kho & Chi Nhánh Modal states
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [warehouseFormData, setWarehouseFormData] = useState({
    code: '',
    name: '',
    branchId: '',
    address: '',
    phone: '',
    isDefault: false
  });

  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [branchFormData, setBranchFormData] = useState({
    code: '',
    name: '',
    address: '',
    phone: ''
  });

  // Stock Movement Ledger Filters
  const [ledgerWarehouseFilter, setLedgerWarehouseFilter] = useState('all');
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState('all');
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [warehouseProductSearch, setWarehouseProductSearch] = useState('');

  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warehouseFormData.code.trim() || !warehouseFormData.name.trim()) {
      showToast('⚠️ Vui lòng nhập mã và tên kho hàng!');
      return;
    }
    const success = await addWarehouse(warehouseFormData);
    if (success) {
      setIsWarehouseModalOpen(false);
      setWarehouseFormData({ code: '', name: '', branchId: '', address: '', phone: '', isDefault: false });
    }
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchFormData.code.trim() || !branchFormData.name.trim()) {
      showToast('⚠️ Vui lòng nhập mã và tên chi nhánh!');
      return;
    }
    const success = await addBranch(branchFormData);
    if (success) {
      setIsBranchModalOpen(false);
      setBranchFormData({ code: '', name: '', address: '', phone: '' });
    }
  };

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
          <div className="flex flex-wrap items-center rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 text-xs font-semibold gap-1">
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
            <button
              onClick={() => setActiveSubTab('variants')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeSubTab === 'variants'
                  ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Boxes className="h-3.5 w-3.5" />
              <span>Biến Thể Size/Màu</span>
            </button>
            <button
              onClick={() => setActiveSubTab('warehouses')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeSubTab === 'warehouses'
                  ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Store className="h-3.5 w-3.5" />
              <span>Master Kho & Chi Nhánh</span>
            </button>
            <button
              onClick={() => setActiveSubTab('ledger')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeSubTab === 'ledger'
                  ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ClipboardList className="h-3.5 w-3.5" />
              <span>Sổ Thẻ Kho (Ledger)</span>
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
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-slate-300 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>
                <strong>Nguyên tắc xuất kho FEFO (First-Expired, First-Out):</strong> Các lô hàng có ngày hết hạn sớm nhất sẽ luôn được ưu tiên đề xuất xuất kho đầu tiên để giảm thiểu rủi ro hủy hàng quá date.
              </span>
            </div>
            <button
              onClick={handleOpenCreateBatch}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-sm transition-all"
            >
              <CalendarPlus className="h-4 w-4" />
              <span>Tạo Lô Sản Xuất Mới</span>
            </button>
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

      {/* SUB-TAB 4: BIẾN THỂ SẢN PHẨM (SIZE / MÀU SẮC) */}
      {activeSubTab === 'variants' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-slate-300 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Boxes className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div>
                <span className="font-bold block">Quản lý ma trận biến thể đa thuộc tính (Size, Màu sắc, Dung lượng, Phiên bản)</span>
                <span className="text-slate-500 dark:text-slate-400">
                  Mỗi biến thể sở hữu mã SKU, mã vạch barcode riêng, số lượng tồn kho độc lập và có thể thiết lập giá chênh lệch linh hoạt.
                </span>
              </div>
            </div>
            <button
              onClick={handleOpenCreateProduct}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Thêm Sản Phẩm Mới
            </button>
          </div>

          {/* Product list with variants */}
          <div className="space-y-3">
            {products.map((prod) => {
              const prodVariants = prod.variants || [];

              return (
                <div
                  key={prod.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                        <Package className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{prod.name}</h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {prod.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <span>Mã gốc: <strong className="font-mono text-slate-700 dark:text-slate-300">{prod.sku}</strong></span>
                          <span>•</span>
                          <span>Tồn kho tổng: <strong className="text-indigo-600 dark:text-indigo-400">{prod.stockBaseUnits} {prod.baseUnit}</strong></span>
                          <span>•</span>
                          <span>Giá niêm yết: <strong>{prod.priceRetail.toLocaleString('vi-VN')} đ</strong></span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenAddVariant(prod)}
                      className="px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-center transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Thêm Biến Thể (Size/Màu)
                    </button>
                  </div>

                  {/* Variants Table or Empty state */}
                  {prodVariants.length === 0 ? (
                    <div className="py-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 flex items-center justify-between">
                      <span>Sản phẩm này hiện đang là sản phẩm đơn (chưa phân loại Size/Màu sắc).</span>
                      <button
                        onClick={() => handleOpenAddVariant(prod)}
                        className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                      >
                        + Tạo biến thể đầu tiên
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-semibold">
                            <th className="py-2 px-3">Tên Biến Thể (Size / Màu)</th>
                            <th className="py-2 px-3">Mã SKU Biến Thể</th>
                            <th className="py-2 px-3">Mã Vạch Riêng</th>
                            <th className="py-2 px-3 text-center">Tồn Kho Biến Thể</th>
                            <th className="py-2 px-3 text-right">Chênh Lệch Giá</th>
                            <th className="py-2 px-3 text-right">Giá Bán Thực Tế</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {prodVariants.map((v) => {
                            const diff = v.priceDifference !== undefined ? v.priceDifference : (v.priceRetail - prod.priceRetail);
                            const effectivePrice = v.priceRetail || (prod.priceRetail + diff);
                            return (
                              <tr key={v.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                                <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">
                                  {v.name}
                                </td>
                                <td className="py-2 px-3 font-mono text-slate-600 dark:text-slate-300">
                                  {v.sku}
                                </td>
                                <td className="py-2 px-3 font-mono text-slate-500 text-[11px]">
                                  {v.barcode || '—'}
                                </td>
                                <td className="py-2 px-3 text-center font-bold text-slate-800 dark:text-slate-200">
                                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                                    {v.stockBaseUnits} {prod.baseUnit}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-right">
                                  {diff === 0 ? (
                                    <span className="text-slate-400">Khớp giá chuẩn</span>
                                  ) : diff > 0 ? (
                                    <span className="text-emerald-600 font-bold">+{diff.toLocaleString('vi-VN')} đ</span>
                                  ) : (
                                    <span className="text-rose-600 font-bold">{diff.toLocaleString('vi-VN')} đ</span>
                                  )}
                                </td>
                                <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-white font-mono">
                                  {effectivePrice.toLocaleString('vi-VN')} đ
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: MASTER KHO & CHI NHÁNH */}
      {activeSubTab === 'warehouses' && (
        <div className="space-y-6">
          {/* TOP STATS & ACTIONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Tổng Chi Nhánh</p>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white font-mono">{branches.length}</h4>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                <Store className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Tổng Kho Hàng</p>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white font-mono">{warehouses.length}</h4>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 shadow-xs flex items-center gap-3 sm:col-span-2">
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">Kho Làm Việc Hiện Tại</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100 font-bold uppercase">
                    Active Session
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                  <span>{activeWarehouse?.name || 'Chưa chọn kho'}</span>
                  <span className="text-xs font-mono font-normal text-slate-500">({activeWarehouse?.code || 'N/A'})</span>
                </h4>
              </div>
            </div>
          </div>

          {/* MASTER BRANCHES & WAREHOUSES DIRECTORY */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-indigo-500" />
                  Hệ Thống Chi Nhánh & Danh Mục Kho
                </h3>
                <p className="text-xs text-slate-500">Mô hình phân cấp chi nhánh - kho hàng thực tế hỗ trợ đa điểm bán POS và chuỗi phân phối</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsBranchModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold shadow-xs transition-all active:scale-95"
                >
                  <Plus className="h-3.5 w-3.5 text-slate-500" />
                  <span>+ Chi Nhánh Mới</span>
                </button>
                <button
                  onClick={() => setIsWarehouseModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+ Thêm Kho Hàng</span>
                </button>
              </div>
            </div>

            {/* BRANCH CARDS WITH LINKED WAREHOUSES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {branches.map(br => {
                const branchWhs = warehouses.filter(w => w.branchId === br.id);
                return (
                  <div key={br.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                    <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono text-[11px] font-bold">
                            {br.code}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{br.name}</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          {br.address && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-slate-400" />
                              {br.address}
                            </span>
                          )}
                          {br.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-slate-400" />
                              {br.phone}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                        {branchWhs.length} kho trực thuộc
                      </span>
                    </div>

                    {/* LIST OF WAREHOUSES IN THIS BRANCH */}
                    <div className="space-y-2">
                      {branchWhs.map(wh => {
                        const isCurrentActive = activeWarehouse?.id === wh.id;
                        const whBalances = stockBalances.filter(b => b.warehouseId === wh.id);
                        const totalStock = whBalances.reduce((sum, b) => sum + b.quantity, 0);

                        return (
                          <div
                            key={wh.id}
                            className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-2 ${
                              isCurrentActive
                                ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/80 shadow-xs'
                                : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                                  {wh.code}
                                </span>
                                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                                  {wh.name}
                                </span>
                                {wh.isDefault && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-semibold">
                                    Kho Chính
                                  </span>
                                )}
                                {isCurrentActive && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
                                    ● Đang dùng
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 flex items-center gap-2">
                                <span>Tồn thực tế: <strong className="text-slate-700 dark:text-slate-300 font-mono">{totalStock.toLocaleString('vi-VN')}</strong> cơ sở</span>
                                <span>•</span>
                                <span>{whBalances.length} mặt hàng</span>
                              </p>
                            </div>

                            <button
                              onClick={() => {
                                setActiveWarehouse(wh);
                                showToast(`🏭 Đã chọn làm việc tại: ${wh.name}`);
                              }}
                              disabled={isCurrentActive}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                isCurrentActive
                                  ? 'bg-emerald-600 text-white cursor-default'
                                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 hover:border-indigo-300 active:scale-95'
                              }`}
                            >
                              {isCurrentActive ? '✓ Đang làm việc' : 'Chọn kho này'}
                            </button>
                          </div>
                        );
                      })}

                      {branchWhs.length === 0 && (
                        <p className="text-xs text-slate-400 italic py-2 text-center">Chưa có kho hàng nào trực thuộc chi nhánh này.</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STOCK BALANCES OF CURRENT ACTIVE WAREHOUSE */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Package className="h-4 w-4 text-indigo-500" />
                  Bảng Cân Đối Tồn Kho: {activeWarehouse?.name || 'Kho Chưa Xác Định'}
                </h3>
                <p className="text-xs text-slate-500">Kiểm soát số lượng tồn kho vật lý (OnHand) và tồn giữ chỗ (Reserved) từng kho riêng biệt</p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={warehouseProductSearch}
                    onChange={e => setWarehouseProductSearch(e.target.value)}
                    placeholder="Lọc SKU, tên sản phẩm trong kho..."
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  onClick={() => {
                    fetchStockBalances();
                    showToast('🔄 Đã cập nhật số dư tồn kho!');
                  }}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Tải lại số dư tồn kho"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold">
                    <th className="py-2.5 px-3">Mã SKU</th>
                    <th className="py-2.5 px-3">Tên Sản Phẩm</th>
                    <th className="py-2.5 px-3">Ngành Hàng</th>
                    <th className="py-2.5 px-3">ĐVT Cơ Sở</th>
                    <th className="py-2.5 px-3 text-right">Tồn Thực Tế</th>
                    <th className="py-2.5 px-3 text-right">Tạm Giữ (Reserved)</th>
                    <th className="py-2.5 px-3 text-right">Khả Dụng</th>
                    <th className="py-2.5 px-3 text-center">Trạng Thái Kho</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stockBalances
                    .filter(b => b.warehouseId === activeWarehouse?.id)
                    .filter(b => {
                      if (!warehouseProductSearch.trim()) return true;
                      const q = warehouseProductSearch.toLowerCase();
                      const prod = products.find(p => p.id === b.productId);
                      return prod?.name.toLowerCase().includes(q) || prod?.sku.toLowerCase().includes(q) || prod?.barcode.toLowerCase().includes(q);
                    })
                    .map(b => {
                      const prod = products.find(p => p.id === b.productId);
                      const available = b.quantity - (b.reservedQuantity || 0);
                      const minAlert = b.minStockAlert || prod?.minStockAlert || 5;
                      const isLowStock = available <= minAlert && available > 0;
                      const isOutOfStock = available <= 0;

                      return (
                        <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                            {prod?.sku || 'N/A'}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {prod?.name || 'Sản phẩm không xác định'}
                            </span>
                            {prod?.barcode && (
                              <span className="block font-mono text-[10px] text-slate-400">{prod.barcode}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium">
                              {prod?.category || 'Chung'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 font-medium">
                            {prod?.baseUnit || 'Cái'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                            {b.quantity.toLocaleString('vi-VN')}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                            {(b.reservedQuantity || 0).toLocaleString('vi-VN')}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {available.toLocaleString('vi-VN')}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {isOutOfStock ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold">
                                Hết hàng
                              </span>
                            ) : isLowStock ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold">
                                Sắp hết (&le; {minAlert})
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold">
                                An toàn
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}

                  {stockBalances.filter(b => b.warehouseId === activeWarehouse?.id).length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                        Chưa có dữ liệu tồn kho nào cho kho hàng này.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: SỔ THẺ KHO (DOUBLE-ENTRY AUDIT LEDGER) */}
      {activeSubTab === 'ledger' && (
        <div className="space-y-4">
          {/* LEDGER HEADER & EXPLANATION */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-indigo-500" />
                Sổ Thẻ Kho Biến Động Hàng Hóa (Double-Entry Stock Ledger)
              </h3>
              <p className="text-xs text-slate-500">
                Nhật ký kiểm toán lưu vết bất biến mọi lần nhập, xuất, bán lẻ POS, điều chuyển nội bộ và cân bằng kiểm kê
              </p>
            </div>

            <button
              onClick={() => {
                fetchStockLedger();
                showToast('🔄 Đã cập nhật sổ thẻ kho!');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold shadow-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Làm Mới Sổ Thẻ Kho</span>
            </button>
          </div>

          {/* KPI CARDS: TOTAL TRANSACTIONS, INBOUND, OUTBOUND */}
          {(() => {
            const filteredLedgers = stockLedgers.filter(l => {
              if (ledgerWarehouseFilter !== 'all' && l.warehouseId !== ledgerWarehouseFilter) return false;
              if (ledgerTypeFilter !== 'all' && l.type !== ledgerTypeFilter) return false;
              if (ledgerSearch.trim()) {
                const q = ledgerSearch.toLowerCase();
                const p = products.find(prod => prod.id === l.productId);
                const matchProduct = p?.name.toLowerCase().includes(q) || p?.sku.toLowerCase().includes(q);
                const matchCode = l.code?.toLowerCase().includes(q) || l.referenceCode?.toLowerCase().includes(q);
                if (!matchProduct && !matchCode) return false;
              }
              return true;
            });

            const totalIn = filteredLedgers.filter(l => l.quantityChange > 0).reduce((sum, l) => sum + l.quantityChange, 0);
            const totalOut = filteredLedgers.filter(l => l.quantityChange < 0).reduce((sum, l) => sum + Math.abs(l.quantityChange), 0);

            return (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                      <ClipboardList className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Lượt Biến Động Thẻ Kho</p>
                      <h4 className="text-xl font-bold text-slate-900 dark:text-white font-mono">{filteredLedgers.length}</h4>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                      <ArrowDownRight className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Tổng Lượng Nhập Vào (+)</p>
                      <h4 className="text-xl font-bold text-emerald-600 font-mono">+{totalIn.toLocaleString('vi-VN')}</h4>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                      <ArrowUpRight className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Tổng Lượng Xuất Ra (-)</p>
                      <h4 className="text-xl font-bold text-rose-600 font-mono">-{totalOut.toLocaleString('vi-VN')}</h4>
                    </div>
                  </div>
                </div>

                {/* FILTERS TOOLBAR */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={ledgerSearch}
                      onChange={e => setLedgerSearch(e.target.value)}
                      placeholder="Tìm theo mã thẻ kho, mã phiếu tham chiếu, SKU, tên hàng..."
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={ledgerWarehouseFilter}
                      onChange={e => setLedgerWarehouseFilter(e.target.value)}
                      className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200"
                    >
                      <option value="all">Tất cả kho hàng</option>
                      {warehouses.map(w => (
                        <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                      ))}
                    </select>

                    <select
                      value={ledgerTypeFilter}
                      onChange={e => setLedgerTypeFilter(e.target.value)}
                      className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200"
                    >
                      <option value="all">Tất cả loại nghiệp vụ</option>
                      <option value="INBOUND">Nhập mua NCC (INBOUND)</option>
                      <option value="OUTBOUND">Xuất kho (OUTBOUND)</option>
                      <option value="SALE">Bán lẻ POS (SALE)</option>
                      <option value="SALE_RETURN">Khách trả hàng (SALE_RETURN)</option>
                      <option value="TRANSFER_OUT">Xuất chuyển kho (TRANSFER_OUT)</option>
                      <option value="TRANSFER_IN">Nhập chuyển kho (TRANSFER_IN)</option>
                      <option value="STOCKTAKE_ADJUST">Cân bằng kiểm kê (STOCKTAKE_ADJUST)</option>
                      <option value="INITIAL">Số dư ban đầu (INITIAL)</option>
                    </select>
                  </div>
                </div>

                {/* DETAILED LEDGER TABLE */}
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold">
                        <th className="py-2.5 px-3">Mã Thẻ Kho / Ngày</th>
                        <th className="py-2.5 px-3">Chứng Từ Tham Chiếu</th>
                        <th className="py-2.5 px-3">Loại Nghiệp Vụ</th>
                        <th className="py-2.5 px-3">Mặt Hàng (SKU)</th>
                        <th className="py-2.5 px-3">Kho Hàng</th>
                        <th className="py-2.5 px-3 text-right">Biến Động</th>
                        <th className="py-2.5 px-3 text-center">Tồn Trước &rarr; Sau</th>
                        {canViewCosts && <th className="py-2.5 px-3 text-right">Đơn Giá Vốn</th>}
                        <th className="py-2.5 px-3">Người Lập</th>
                        <th className="py-2.5 px-3">Ghi Chú</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredLedgers.map(l => {
                        const prod = products.find(p => p.id === l.productId);
                        const wh = warehouses.find(w => w.id === l.warehouseId);

                        // Badge styling helper
                        let typeBadge = (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 font-semibold">
                            {l.type}
                          </span>
                        );
                        if (l.type === 'INBOUND' || l.type === 'TRANSFER_IN') {
                          typeBadge = (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
                              {l.type === 'INBOUND' ? 'Nhập mua NCC' : 'Nhận chuyển kho'}
                            </span>
                          );
                        } else if (l.type === 'OUTBOUND' || l.type === 'TRANSFER_OUT') {
                          typeBadge = (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold">
                              {l.type === 'OUTBOUND' ? 'Xuất kho' : 'Xuất chuyển kho'}
                            </span>
                          );
                        } else if (l.type === 'SALE') {
                          typeBadge = (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold">
                              Bán hàng POS
                            </span>
                          );
                        } else if (l.type === 'STOCKTAKE_ADJUST') {
                          typeBadge = (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold">
                              Cân bằng kiểm kê
                            </span>
                          );
                        } else if (l.type === 'INITIAL') {
                          typeBadge = (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                              Khởi tạo ban đầu
                            </span>
                          );
                        }

                        return (
                          <tr key={l.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                            <td className="py-2.5 px-3">
                              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block">{l.code}</span>
                              <span className="text-[10px] text-slate-400">{new Date(l.createdAt).toLocaleString('vi-VN')}</span>
                            </td>
                            <td className="py-2.5 px-3 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                              {l.referenceCode || l.referenceType || '—'}
                            </td>
                            <td className="py-2.5 px-3">{typeBadge}</td>
                            <td className="py-2.5 px-3">
                              <span className="font-semibold text-slate-900 dark:text-white block">
                                {prod?.name || l.productId}
                              </span>
                              <span className="font-mono text-[10px] text-slate-400">{prod?.sku || ''}</span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-medium">
                              {wh?.name || l.warehouseId}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold">
                              {l.quantityChange > 0 ? (
                                <span className="text-emerald-600 font-bold">+{l.quantityChange.toLocaleString('vi-VN')}</span>
                              ) : (
                                <span className="text-rose-600 font-bold">{l.quantityChange.toLocaleString('vi-VN')}</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-600 dark:text-slate-400">
                              <span>{l.balanceBefore}</span>
                              <span className="mx-1 text-slate-400">&rarr;</span>
                              <strong className="text-slate-900 dark:text-white">{l.balanceAfter}</strong>
                            </td>
                            {canViewCosts && (
                              <td className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                                {l.costPrice ? `${l.costPrice.toLocaleString('vi-VN')} đ` : '—'}
                              </td>
                            )}
                            <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 font-medium">
                              {l.createdByName || 'Hệ thống'}
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate" title={l.notes || ''}>
                              {l.notes || '—'}
                            </td>
                          </tr>
                        );
                      })}

                      {filteredLedgers.length === 0 && (
                        <tr>
                          <td colSpan={canViewCosts ? 10 : 9} className="py-8 text-center text-slate-400 italic">
                            Không tìm thấy biến động thẻ kho nào phù hợp với bộ lọc.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            );
          })()}
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

      {/* ================= MODAL: CREATE BATCH (FEFO) ================= */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <CalendarPlus className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Khai Báo Lô Sản Xuất & Hạn Dùng Mới
              </h3>
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBatch} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Sản phẩm áp dụng *</label>
                <select
                  value={batchFormData.productId}
                  onChange={e => setBatchFormData({ ...batchFormData, productId: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-medium"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Số Lô (Batch ID) *</label>
                <input
                  type="text"
                  required
                  value={batchFormData.batchNumber}
                  onChange={e => setBatchFormData({ ...batchFormData, batchNumber: e.target.value })}
                  placeholder="VD: LÔ-202609-883"
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 font-mono font-bold text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Ngày sản xuất (MFG)</label>
                  <input
                    type="date"
                    required
                    value={batchFormData.productionDate}
                    onChange={e => setBatchFormData({ ...batchFormData, productionDate: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 font-mono text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Hạn sử dụng (EXP) *</label>
                  <input
                    type="date"
                    required
                    value={batchFormData.expiryDate}
                    onChange={e => setBatchFormData({ ...batchFormData, expiryDate: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Số lượng ban đầu</label>
                  <input
                    type="number"
                    min={1}
                    value={batchFormData.quantity}
                    onChange={e => setBatchFormData({ ...batchFormData, quantity: Math.max(1, Number(e.target.value)) })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 font-mono font-bold text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Vị trí lưu kho (Kệ/Dãy)</label>
                  <input
                    type="text"
                    value={batchFormData.warehouseLocation}
                    onChange={e => setBatchFormData({ ...batchFormData, warehouseLocation: e.target.value })}
                    placeholder="VD: Kệ B-04"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md"
                >
                  Lưu Lô Hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE VARIANT (SIZE / MÀU) ================= */}
      {isVariantModalOpen && variantSelectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Boxes className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Thêm Biến Thể (Size / Màu Sắc)
                </h3>
                <p className="text-xs text-slate-500">Sản phẩm: {variantSelectedProduct.name}</p>
              </div>
              <button
                onClick={() => setIsVariantModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVariant} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Tên Biến Thể *</label>
                <input
                  type="text"
                  required
                  value={variantFormData.name}
                  onChange={e => setVariantFormData({ ...variantFormData, name: e.target.value })}
                  placeholder="VD: Size L - Màu Trắng, 128GB - Đen Titan..."
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Mã SKU Biến Thể *</label>
                  <input
                    type="text"
                    required
                    value={variantFormData.sku}
                    onChange={e => setVariantFormData({ ...variantFormData, sku: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 font-mono font-bold text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Mã Vạch Barcode</label>
                  <input
                    type="text"
                    value={variantFormData.barcode}
                    onChange={e => setVariantFormData({ ...variantFormData, barcode: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Số Lượng Tồn Kho Ban Đầu</label>
                  <input
                    type="number"
                    min={0}
                    value={variantFormData.stockBaseUnits}
                    onChange={e => setVariantFormData({ ...variantFormData, stockBaseUnits: Math.max(0, Number(e.target.value)) })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 font-mono font-bold text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Chênh Lệch Giá So Với Gốc (+/- đ)</label>
                  <input
                    type="number"
                    value={variantFormData.priceDifference}
                    onChange={e => setVariantFormData({ ...variantFormData, priceDifference: Number(e.target.value) })}
                    placeholder="VD: 50000"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 font-mono font-bold text-xs"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                <span className="text-slate-500">Giá bán lẻ thực tế của biến thể này: </span>
                <strong className="text-indigo-600 dark:text-indigo-400 font-mono text-sm">
                  {(variantSelectedProduct.priceRetail + variantFormData.priceDifference).toLocaleString('vi-VN')} đ
                </strong>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsVariantModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md"
                >
                  Lưu Biến Thể
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD WAREHOUSE ================= */}
      {isWarehouseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Store className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Thêm Kho Hàng Mới
              </h3>
              <button
                onClick={() => setIsWarehouseModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWarehouse} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Mã Kho Hàng *</label>
                  <input
                    type="text"
                    required
                    value={warehouseFormData.code}
                    onChange={e => setWarehouseFormData({ ...warehouseFormData, code: e.target.value.toUpperCase() })}
                    placeholder="VD: KHO-Q7, KHO-BD..."
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 font-mono font-bold text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Tên Kho Hàng *</label>
                  <input
                    type="text"
                    required
                    value={warehouseFormData.name}
                    onChange={e => setWarehouseFormData({ ...warehouseFormData, name: e.target.value })}
                    placeholder="VD: Kho Quận 7, Kho Bình Dương..."
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Chi Nhánh Trực Thuộc</label>
                <select
                  value={warehouseFormData.branchId}
                  onChange={e => setWarehouseFormData({ ...warehouseFormData, branchId: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs"
                >
                  <option value="">-- Chọn chi nhánh (tùy chọn) --</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Địa Chỉ Kho</label>
                <input
                  type="text"
                  value={warehouseFormData.address}
                  onChange={e => setWarehouseFormData({ ...warehouseFormData, address: e.target.value })}
                  placeholder="VD: 123 Nguyễn Thị Thập, P. Tân Quy, Q.7, TP.HCM"
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Số Điện Thoại Liên Hệ</label>
                <input
                  type="text"
                  value={warehouseFormData.phone}
                  onChange={e => setWarehouseFormData({ ...warehouseFormData, phone: e.target.value })}
                  placeholder="VD: 0909 123 456"
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isDefaultWh"
                  checked={warehouseFormData.isDefault}
                  onChange={e => setWarehouseFormData({ ...warehouseFormData, isDefault: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <label htmlFor="isDefaultWh" className="text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                  Đặt làm kho mặc định của toàn hệ thống
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsWarehouseModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md"
                >
                  Lưu Kho Hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD BRANCH ================= */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Thêm Chi Nhánh Mới
              </h3>
              <button
                onClick={() => setIsBranchModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBranch} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Mã Chi Nhánh *</label>
                  <input
                    type="text"
                    required
                    value={branchFormData.code}
                    onChange={e => setBranchFormData({ ...branchFormData, code: e.target.value.toUpperCase() })}
                    placeholder="VD: CN-DN, CN-HN..."
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 font-mono font-bold text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Tên Chi Nhánh *</label>
                  <input
                    type="text"
                    required
                    value={branchFormData.name}
                    onChange={e => setBranchFormData({ ...branchFormData, name: e.target.value })}
                    placeholder="VD: Chi Nhánh Đà Nẵng, Chi Nhánh Hà Nội..."
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Địa Chỉ Trụ Sở / Văn Phòng</label>
                <input
                  type="text"
                  value={branchFormData.address}
                  onChange={e => setBranchFormData({ ...branchFormData, address: e.target.value })}
                  placeholder="VD: 45 Lê Duẩn, Q. Hải Châu, TP. Đà Nẵng"
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Số Điện Thoại</label>
                <input
                  type="text"
                  value={branchFormData.phone}
                  onChange={e => setBranchFormData({ ...branchFormData, phone: e.target.value })}
                  placeholder="VD: 0236 3888 999"
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md"
                >
                  Lưu Chi Nhánh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

