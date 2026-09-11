"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useERP } from '../../context/ERPContext';
import { Product, PackagingUnit, ProductCategory } from '../../types/erp';
import { Pagination } from '../common/Pagination';
import { MoneyInput } from '../common/MoneyInput';
import { RowActionMenu } from '../common/RowActionMenu';
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
  ExternalLink,
  Upload,
  Image as ImageIcon,
  FolderOpen,
  Sparkles,
  Calculator,
  RefreshCw,
  Check,
  Ruler
} from 'lucide-react';

interface ProductViewProps {
  initialTab?: 'products' | 'categories' | 'units';
}

const COMMON_BASE_UNITS = ['Cái', 'Lon', 'Hộp', 'Chai', 'Can', 'Chiếc', 'Mét', 'Kg', 'Gói', 'Vỉ', 'Bao', 'Lít'];
const COMMON_PACKAGING_UNITS = ['Thùng', 'Lốc', 'Két', 'Kiện', 'Hộp', 'Bao', 'Khay', 'Vỉ', 'Can lớn'];

const COLOR_CLASSES: Record<string, { badge: string; bg: string; text: string; border: string }> = {
  indigo: { badge: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800', bg: 'bg-indigo-600', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-500' },
  purple: { badge: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800', bg: 'bg-purple-600', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500' },
  blue: { badge: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800', bg: 'bg-blue-600', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500' },
  emerald: { badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', bg: 'bg-emerald-600', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500' },
  amber: { badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800', bg: 'bg-amber-600', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500' },
  rose: { badge: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800', bg: 'bg-rose-600', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500' },
  teal: { badge: 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800', bg: 'bg-teal-600', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-500' },
  slate: { badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700', bg: 'bg-slate-600', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-500' },
};

export interface UnitOfMeasureItem {
  id: string;
  name: string;
  code?: string;
  description?: string;
  type: 'base' | 'packaging';
  productCount?: number;
}

const PRESET_IMAGES = [
  { label: 'Tivi 4K', url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&auto=format&fit=crop&q=80' },
  { label: 'Tủ Lạnh', url: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=300&auto=format&fit=crop&q=80' },
  { label: 'Máy Giặt', url: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=300&auto=format&fit=crop&q=80' },
  { label: 'Dầu Nhớt', url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=300&auto=format&fit=crop&q=80' },
  { label: 'Nồi Cơm', url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=300&auto=format&fit=crop&q=80' },
  { label: 'Nước Ngọt', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&auto=format&fit=crop&q=80' },
];

export const ProductView: React.FC<ProductViewProps> = ({ initialTab = 'products' }) => {
  const {
    products,
    canViewCosts,
    canExportExcel,
    openScannerModal,
    showToast,
    addProduct,
    updateProduct,
    deleteProduct
  } = useERP();

  // Tab State
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'units'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Category Manager State
  const [categoriesList, setCategoriesList] = useState<ProductCategory[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [catSearch, setCatSearch] = useState('');
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<ProductCategory | null>(null);
  const [reassignCatName, setReassignCatName] = useState('Khác');
  const [newCatName, setNewCatName] = useState('');
  const [newCatCode, setNewCatCode] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatColor, setNewCatColor] = useState('indigo');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');
  const [editingCatCode, setEditingCatCode] = useState('');
  const [editingCatDesc, setEditingCatDesc] = useState('');
  const [editingCatColor, setEditingCatColor] = useState('indigo');

  // Units of Measure (ĐVT) State
  const [unitsList, setUnitsList] = useState<UnitOfMeasureItem[]>([]);
  const [isLoadingUnits, setIsLoadingUnits] = useState(false);
  const [unitSearch, setUnitSearch] = useState('');
  const [unitTypeFilter, setUnitTypeFilter] = useState<'all' | 'base' | 'packaging'>('all');
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitOfMeasureItem | null>(null);
  const [deletingUnit, setDeletingUnit] = useState<UnitOfMeasureItem | null>(null);
  const [unitFormData, setUnitFormData] = useState({
    name: '',
    code: '',
    type: 'base' as 'base' | 'packaging',
    description: '',
  });

  // Quick category inline creation inside product modal
  const [isQuickAddCatOpen, setIsQuickAddCatOpen] = useState(false);
  const [quickCatName, setQuickCatName] = useState('');

  // Product Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // File upload ref & drag state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingImage, setIsDraggingImage] = useState(false);

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
    packagingUnits: [] as PackagingUnit[],
  });

  // Fetch categories from API
  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCategoriesList(data.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Fetch units from API
  const fetchUnits = async () => {
    setIsLoadingUnits(true);
    try {
      const res = await fetch('/api/units');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setUnitsList(data.data);
      }
    } catch (err) {
      console.error('Error fetching units:', err);
    } finally {
      setIsLoadingUnits(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchUnits();
  }, []);

  // Compute merged categories (API + any existing in products)
  const allCategoryNames = useMemo(() => {
    const fromApi = categoriesList.map(c => c.name);
    const fromProducts = products.map(p => p.category).filter(Boolean);
    return Array.from(new Set([...fromApi, ...fromProducts]));
  }, [categoriesList, products]);

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

  // Count products by category for quick badges
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Open Add Product
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      sku: `SP-${Date.now().toString().slice(-6)}`,
      barcode: `${Math.floor(8930000000000 + Math.random() * 999999999)}`,
      name: '',
      category: allCategoryNames[0] || 'Điện Máy',
      baseUnit: 'Cái',
      costPrice: 0,
      retailPrice: 0,
      wholesalePrice: 0,
      vipPrice: 0,
      stockBaseUnits: 10,
      minStockThreshold: 5,
      trackFefo: false,
      trackSerial: false,
      image: '',
      packagingUnits: [
        {
          name: 'Thùng',
          conversionRate: 10,
          isBase: false,
          priceRetail: 0,
          priceWholesale: 0,
          priceVip: 0
        }
      ],
    });
    setIsQuickAddCatOpen(false);
    setIsModalOpen(true);
  };

  // Open Edit Product
  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    const nonBaseUnits = (product.units || []).filter(u => !u.isBase);

    setFormData({
      sku: product.sku,
      barcode: product.barcode || '',
      name: product.name,
      category: product.category,
      baseUnit: product.baseUnit || 'Cái',
      costPrice: product.costPrice,
      retailPrice: product.priceRetail,
      wholesalePrice: product.priceWholesale,
      vipPrice: product.priceVip,
      stockBaseUnits: product.stockBaseUnits,
      minStockThreshold: product.minStockAlert,
      trackFefo: !!product.hasExpiry,
      trackSerial: !!product.hasSerial,
      image: product.imageUrl || '',
      packagingUnits: nonBaseUnits.length > 0 ? nonBaseUnits : [],
    });
    setIsQuickAddCatOpen(false);
    setIsModalOpen(true);
  };

  // Local File Image Picker Handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('⚠️ Vui lòng chọn tệp hình ảnh (PNG, JPG, WEBP, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('⚠️ Dung lượng ảnh tối đa là 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
        showToast(`📸 Đã chọn ảnh: ${file.name}`);
      }
    };
    reader.readAsDataURL(file);
    // Reset file input value so selecting the same file triggers change
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDropImage = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingImage(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('⚠️ Dung lượng ảnh tối đa là 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
        showToast(`📸 Đã tải ảnh: ${file.name}`);
      }
    };
    reader.readAsDataURL(file);
  };

  // Packaging Unit Handlers
  const addPackagingUnitRow = () => {
    setFormData(prev => ({
      ...prev,
      packagingUnits: [
        ...prev.packagingUnits,
        {
          name: '',
          conversionRate: 12,
          isBase: false,
          priceRetail: prev.retailPrice * 12,
          priceWholesale: prev.wholesalePrice * 12,
          priceVip: prev.vipPrice * 12
        }
      ]
    }));
  };

  const removePackagingUnitRow = (index: number) => {
    setFormData(prev => ({
      ...prev,
      packagingUnits: prev.packagingUnits.filter((_, i) => i !== index)
    }));
  };

  const updatePackagingUnitRow = (index: number, field: keyof PackagingUnit, val: any) => {
    setFormData(prev => {
      const updated = [...prev.packagingUnits];
      updated[index] = { ...updated[index], [field]: val };

      // Auto-calculate suggested prices if conversionRate changed and prices are 0
      if (field === 'conversionRate') {
        const rate = Number(val) || 1;
        if (updated[index].priceRetail === 0) updated[index].priceRetail = prev.retailPrice * rate;
        if (updated[index].priceWholesale === 0) updated[index].priceWholesale = prev.wholesalePrice * rate;
        if (updated[index].priceVip === 0) updated[index].priceVip = prev.vipPrice * rate;
      }

      return { ...prev, packagingUnits: updated };
    });
  };

  const autoFillUnitPrices = (index: number) => {
    setFormData(prev => {
      const updated = [...prev.packagingUnits];
      const rate = Number(updated[index].conversionRate) || 1;
      updated[index].priceRetail = prev.retailPrice * rate;
      updated[index].priceWholesale = prev.wholesalePrice * rate;
      updated[index].priceVip = prev.vipPrice * rate;
      showToast(`⚡ Đã tự động tính giá cho ${updated[index].name || 'ĐVT'}`);
      return { ...prev, packagingUnits: updated };
    });
  };

  // Save Product (Add / Update)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sku.trim()) {
      showToast('⚠️ Vui lòng nhập đầy đủ tên và mã SKU sản phẩm');
      return;
    }

    // Prepare packaging units
    const baseUnitObj: PackagingUnit = {
      name: formData.baseUnit.trim() || 'Cái',
      conversionRate: 1,
      isBase: true,
      priceRetail: Number(formData.retailPrice),
      priceWholesale: Number(formData.wholesalePrice),
      priceVip: Number(formData.vipPrice)
    };

    const secondaryUnits: PackagingUnit[] = formData.packagingUnits
      .filter(u => u.name && u.name.trim())
      .map(u => ({
        name: u.name.trim(),
        conversionRate: Number(u.conversionRate) || 1,
        isBase: false,
        priceRetail: Number(u.priceRetail) || Number(formData.retailPrice) * (Number(u.conversionRate) || 1),
        priceWholesale: Number(u.priceWholesale) || Number(formData.wholesalePrice) * (Number(u.conversionRate) || 1),
        priceVip: Number(u.priceVip) || Number(formData.vipPrice) * (Number(u.conversionRate) || 1)
      }));

    const productPayload: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      sku: formData.sku.toUpperCase().trim(),
      barcode: formData.barcode.trim(),
      name: formData.name.trim(),
      category: formData.category,
      baseUnit: formData.baseUnit.trim() || 'Cái',
      costPrice: Number(formData.costPrice),
      priceRetail: Number(formData.retailPrice),
      priceWholesale: Number(formData.wholesalePrice),
      priceVip: Number(formData.vipPrice),
      stockBaseUnits: Number(formData.stockBaseUnits),
      minStockAlert: Number(formData.minStockThreshold),
      units: [baseUnitObj, ...secondaryUnits],
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

  // Category Manager Actions
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCatName.trim(),
          code: newCatCode.trim() || undefined,
          description: newCatDesc.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ Đã thêm nhóm sản phẩm: ${newCatName.trim()}`);
        setNewCatName('');
        setNewCatCode('');
        setNewCatDesc('');
        fetchCategories();
      } else {
        showToast(`❌ ${data.error || 'Lỗi thêm nhóm sản phẩm'}`);
      }
    } catch {
      showToast('❌ Không thể kết nối tới máy chủ');
    }
  };

  const handleUpdateCategory = async (cat: ProductCategory) => {
    if (!editingCatName.trim()) return;
    try {
      const res = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: cat.id,
          oldName: cat.name,
          newName: editingCatName.trim(),
          code: editingCatCode.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ Đã cập nhật nhóm sản phẩm: ${editingCatName.trim()}`);
        setEditingCatId(null);
        fetchCategories();
      } else {
        showToast(`❌ ${data.error || 'Lỗi cập nhật'}`);
      }
    } catch {
      showToast('❌ Không thể cập nhật nhóm sản phẩm');
    }
  };

  const handleDeleteCategory = async (cat: ProductCategory) => {
    const pCount = cat.productCount || 0;
    const confirmMsg = pCount > 0
      ? `Nhóm "${cat.name}" đang có ${pCount} sản phẩm. Xóa nhóm này sẽ chuyển các sản phẩm sang nhóm "Khác". Bạn có chắc chắn muốn xóa?`
      : `Bạn có chắc chắn muốn xóa nhóm "${cat.name}"?`;

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/categories?id=${cat.id}&reassignTo=Khác`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast(`🗑️ ${data.message || 'Đã xóa nhóm sản phẩm thành công'}`);
        fetchCategories();
      } else {
        showToast(`❌ ${data.error || 'Lỗi khi xóa nhóm'}`);
      }
    } catch {
      showToast('❌ Không thể xóa nhóm sản phẩm');
    }
  };

  const handleQuickAddCategory = async () => {
    if (!quickCatName.trim()) return;
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: quickCatName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ Đã thêm nhóm mới: ${quickCatName.trim()}`);
        setFormData(prev => ({ ...prev, category: quickCatName.trim() }));
        setQuickCatName('');
        setIsQuickAddCatOpen(false);
        fetchCategories();
      } else {
        showToast(`❌ ${data.error || 'Lỗi thêm nhóm'}`);
      }
    } catch {
      showToast('❌ Lỗi kết nối');
    }
  };

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categoriesList.filter(c =>
      c.name.toLowerCase().includes(catSearch.toLowerCase()) ||
      (c.code && c.code.toLowerCase().includes(catSearch.toLowerCase())) ||
      (c.description && c.description.toLowerCase().includes(catSearch.toLowerCase()))
    );
  }, [categoriesList, catSearch]);

  // Filtered units
  const filteredUnits = useMemo(() => {
    return unitsList.filter(u => {
      const matchSearch =
        u.name.toLowerCase().includes(unitSearch.toLowerCase()) ||
        (u.code && u.code.toLowerCase().includes(unitSearch.toLowerCase())) ||
        (u.description && u.description.toLowerCase().includes(unitSearch.toLowerCase()));
      const matchType = unitTypeFilter === 'all' || u.type === unitTypeFilter;
      return matchSearch && matchType;
    });
  }, [unitsList, unitSearch, unitTypeFilter]);

  // Category statistics
  const categoryStats = useMemo(() => {
    const total = categoriesList.length;
    const active = categoriesList.filter(c => (c.productCount || 0) > 0).length;
    const totalAssigned = categoriesList.reduce((sum, c) => sum + (c.productCount || 0), 0);
    return { total, active, empty: total - active, totalAssigned };
  }, [categoriesList]);

  // Unit statistics
  const unitStats = useMemo(() => {
    const total = unitsList.length;
    const baseCount = unitsList.filter(u => u.type === 'base').length;
    const packagingCount = unitsList.filter(u => u.type === 'packaging').length;
    const totalUsage = unitsList.reduce((sum, u) => sum + (u.productCount || 0), 0);
    return { total, baseCount, packagingCount, totalUsage };
  }, [unitsList]);

  // Category modal handlers
  const handleOpenAddCategory = () => {
    setNewCatName('');
    setNewCatCode('');
    setNewCatDesc('');
    setNewCatColor('indigo');
    setIsAddCatModalOpen(true);
  };

  const handleOpenEditCategory = (cat: ProductCategory) => {
    setEditingCategory(cat);
    setEditingCatName(cat.name);
    setEditingCatCode(cat.code || '');
    setEditingCatDesc(cat.description || '');
    setEditingCatColor(cat.color || 'indigo');
  };

  const handleSaveAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      showToast('⚠️ Vui lòng nhập tên nhóm sản phẩm');
      return;
    }
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCatName.trim(),
          code: newCatCode.trim() || undefined,
          description: newCatDesc.trim() || undefined,
          color: newCatColor,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ Đã tạo mới nhóm: ${newCatName.trim()}`);
        setIsAddCatModalOpen(false);
        setNewCatName('');
        setNewCatCode('');
        setNewCatDesc('');
        fetchCategories();
      } else {
        showToast(`❌ ${data.error || 'Lỗi thêm nhóm'}`);
      }
    } catch {
      showToast('❌ Lỗi kết nối máy chủ');
    }
  };

  const handleSaveEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCatName.trim()) {
      showToast('⚠️ Tên nhóm không được để trống');
      return;
    }
    try {
      const res = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingCategory.id,
          oldName: editingCategory.name,
          newName: editingCatName.trim(),
          code: editingCatCode.trim() || undefined,
          description: editingCatDesc.trim() || undefined,
          color: editingCatColor,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ Đã cập nhật nhóm: ${editingCatName.trim()}`);
        setEditingCategory(null);
        fetchCategories();
      } else {
        showToast(`❌ ${data.error || 'Lỗi cập nhật'}`);
      }
    } catch {
      showToast('❌ Lỗi kết nối');
    }
  };

  const handleConfirmDeleteCategory = async () => {
    if (!deletingCategory) return;
    try {
      const res = await fetch(
        `/api/categories?id=${deletingCategory.id}&reassignTo=${encodeURIComponent(reassignCatName)}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (data.success) {
        showToast(`🗑️ ${data.message || 'Đã xóa nhóm sản phẩm thành công'}`);
        setDeletingCategory(null);
        fetchCategories();
      } else {
        showToast(`❌ ${data.error || 'Lỗi khi xóa nhóm'}`);
      }
    } catch {
      showToast('❌ Không thể xóa nhóm');
    }
  };

  // Unit handlers
  const handleOpenAddUnit = () => {
    setEditingUnit(null);
    setUnitFormData({ name: '', code: '', type: 'base', description: '' });
    setIsUnitModalOpen(true);
  };

  const handleOpenEditUnit = (unit: UnitOfMeasureItem) => {
    setEditingUnit(unit);
    setUnitFormData({
      name: unit.name,
      code: unit.code || '',
      type: unit.type,
      description: unit.description || '',
    });
    setIsUnitModalOpen(true);
  };

  const handleSaveUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitFormData.name.trim()) {
      showToast('⚠️ Vui lòng nhập tên đơn vị tính');
      return;
    }

    try {
      if (editingUnit) {
        const res = await fetch('/api/units', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingUnit.id,
            oldName: editingUnit.name,
            newName: unitFormData.name.trim(),
            code: unitFormData.code.trim() || undefined,
            type: unitFormData.type,
            description: unitFormData.description.trim() || undefined,
          }),
        });
        const data = await res.json();
        if (data.success) {
          showToast(`✅ Đã cập nhật ĐVT '${unitFormData.name.trim()}'`);
          setIsUnitModalOpen(false);
          setEditingUnit(null);
          fetchUnits();
        } else {
          showToast(`❌ ${data.error || 'Lỗi cập nhật ĐVT'}`);
        }
      } else {
        const res = await fetch('/api/units', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: unitFormData.name.trim(),
            code: unitFormData.code.trim() || undefined,
            type: unitFormData.type,
            description: unitFormData.description.trim() || undefined,
          }),
        });
        const data = await res.json();
        if (data.success) {
          showToast(`✅ Đã tạo mới ĐVT '${unitFormData.name.trim()}'`);
          setIsUnitModalOpen(false);
          setUnitFormData({ name: '', code: '', type: 'base', description: '' });
          fetchUnits();
        } else {
          showToast(`❌ ${data.error || 'Lỗi tạo ĐVT'}`);
        }
      }
    } catch {
      showToast('❌ Lỗi kết nối máy chủ');
    }
  };

  const handleConfirmDeleteUnit = async () => {
    if (!deletingUnit) return;
    try {
      const res = await fetch(`/api/units?id=${deletingUnit.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(`🗑️ ${data.message || 'Đã xóa đơn vị tính'}`);
        setDeletingUnit(null);
        fetchUnits();
      } else {
        showToast(`⚠️ ${data.error || 'Lỗi khi xóa ĐVT'}`);
      }
    } catch {
      showToast('❌ Lỗi kết nối');
    }
  };

  const handleQuickSeedUnit = async (name: string, type: 'base' | 'packaging') => {
    if (unitsList.some(u => u.name.toLowerCase() === name.toLowerCase())) {
      showToast(`ℹ️ ĐVT '${name}' đã có trong hệ thống`);
      return;
    }
    try {
      const res = await fetch('/api/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type,
          code: name.slice(0, 4).toUpperCase(),
          description: `Đơn vị tính ${name} (${type === 'base' ? 'cơ bản' : 'đóng gói/quy đổi'})`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`⚡ Đã thêm nhanh ĐVT '${name}'!`);
        fetchUnits();
      } else {
        showToast(`❌ ${data.error || 'Lỗi'}`);
      }
    } catch {
      showToast('❌ Lỗi kết nối');
    }
  };

  // Export Excel / CSV
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
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 w-full animate-in fade-in duration-200">
      {/* Module Navigation Sub-Tabs (Sản Phẩm - Nhóm SP - Đơn Vị Tính) */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap gap-2.5">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/60 overflow-x-auto no-scrollbar max-w-full">
          <button
            id="tab-products-btn"
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeTab === 'products'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Danh Sách Sản Phẩm</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold">
              {products.length}
            </span>
          </button>

          <button
            id="tab-categories-btn"
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeTab === 'categories'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Quản Lý Nhóm SP</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
              {categoriesList.length}
            </span>
          </button>

          <button
            id="tab-units-btn"
            onClick={() => setActiveTab('units')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeTab === 'units'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Ruler className="w-4 h-4" />
            <span>Quản Lý ĐVT</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
              {unitsList.length}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DANH SÁCH SẢN PHẨM & DANH MỤC HÀNG HÓA                             */}
      {/* ========================================================================= */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Top Header & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>Quản Lý Sản Phẩm & Bảng Giá</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Mã SKU, mã vạch Barcode, nhóm sản phẩm, ĐVT quy đổi đa cấp (Thùng/Lon/Cái) & định mức tồn
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto flex-wrap sm:flex-nowrap">
              {canExportExcel && (
                <button
                  id="export-products-btn"
                  onClick={exportExcel}
                  className="flex-1 sm:flex-none justify-center px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Xuất Excel</span>
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
                className="flex-1 sm:flex-none justify-center px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-xs"
              >
                <ScanBarcode className="w-3.5 h-3.5 text-indigo-500" />
                <span>Quét Mã</span>
              </button>

              {/* Thêm Mới Sản Phẩm Button */}
              <button
                id="create-product-btn"
                onClick={handleOpenAdd}
                className="w-full sm:w-auto justify-center px-3.5 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>+ Thêm Mới Sản Phẩm</span>
              </button>
            </div>
          </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4 lg:gap-6">
        <div className="p-3 sm:p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <span className="text-[11px] sm:text-xs text-slate-500 font-medium">Tổng Sản Phẩm</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</span>
            <span className="text-[11px] sm:text-xs text-indigo-600 dark:text-indigo-400 font-medium">{allCategoryNames.length} nhóm</span>
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <span className="text-[11px] sm:text-xs text-slate-500 font-medium">Đủ Tồn An Toàn</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.inStock}</span>
            <span className="text-[10px] text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded font-medium">Sẵn sàng bán</span>
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <span className="text-[11px] sm:text-xs text-slate-500 font-medium">Cảnh Báo Sắp Hết</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.lowStock}</span>
            <span className="text-[10px] text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded font-medium">≤ Min</span>
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <span className="text-[11px] sm:text-xs text-slate-500 font-medium">Hết Hàng Trong Kho</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400">{stats.outOfStock}</span>
            <span className="text-[10px] text-rose-600 bg-rose-500/10 px-1.5 py-0.5 rounded font-medium">0 tồn kho</span>
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs col-span-2 lg:col-span-1">
          <span className="text-[11px] sm:text-xs text-slate-500 font-medium">Tổng Giá Trị Tồn Kho</span>
          <div className="mt-1">
            <span className="text-base sm:text-lg font-bold text-indigo-600 dark:text-indigo-400">
              {canViewCosts ? `${stats.totalInventoryValue.toLocaleString('vi-VN')} đ` : '•••••••• đ'}
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">Theo giá vốn nhập</p>
          </div>
        </div>
      </div>

      {/* Category Pills Bar (Quick Filter by Nhóm Sản Phẩm) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => {
            setCategoryFilter('all');
            setCurrentPage(1);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all border ${
            categoryFilter === 'all'
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          Tất cả nhóm ({products.length})
        </button>
        {allCategoryNames.map(c => {
          const count = categoryCounts[c] || 0;
          const isSelected = categoryFilter === c;
          return (
            <button
              key={c}
              onClick={() => {
                setCategoryFilter(c);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 border ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{c}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-indigo-800 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs flex flex-col md:flex-row gap-3 sm:gap-4 items-stretch md:items-center justify-between">
        <div className="relative w-full md:w-80 lg:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm tên, mã SKU hoặc barcode..."
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:items-center gap-2 sm:gap-3 w-full md:w-auto">
          {/* Category filter dropdown */}
          <div className="flex items-center gap-1.5 flex-1">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:inline" />
            <select
              value={categoryFilter}
              onChange={e => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">Tất cả nhóm ({products.length})</option>
              {allCategoryNames.map(c => (
                <option key={c} value={c}>
                  {c} ({categoryCounts[c] || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Stock status filter */}
          <div className="flex-1">
            <select
              value={stockStatusFilter}
              onChange={e => {
                setStockStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">Tất cả tình trạng tồn</option>
              <option value="in_stock">Tồn an toàn</option>
              <option value="low_stock">Cảnh báo tồn ít (≤ min)</option>
              <option value="out_of_stock">Đã hết hàng (0 tồn)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold">
                <th className="py-3 px-4">Sản Phẩm & Mã SKU</th>
                <th className="py-3 px-4">Nhóm Sản Phẩm</th>
                <th className="py-3 px-4">Đơn Vị Tính & Quy Đổi</th>
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
                  const secondaryUnits = (product.units || []).filter(u => !u.isBase);

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
                            className="w-11 h-11 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-800"
                          />
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-white block group-hover:text-indigo-600 transition-colors line-clamp-1">
                              {product.name}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
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
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                          {product.category}
                        </span>
                      </td>

                      {/* Packaging Units */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                              {product.baseUnit || 'Cái'}
                            </span>
                            <span className="text-[10px] px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                              (Cơ bản)
                            </span>
                          </div>
                          {secondaryUnits.map((u, i) => (
                            <div key={i} className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                              <span className="font-medium text-indigo-600 dark:text-indigo-400">1 {u.name}</span>
                              <span>=</span>
                              <span className="font-bold">{u.conversionRate}</span>
                              <span>{product.baseUnit}</span>
                              {u.priceWholesale > 0 && (
                                <span className="text-[10px] text-slate-400">
                                  (Sỉ: {u.priceWholesale.toLocaleString('vi-VN')} đ)
                                </span>
                              )}
                            </div>
                          ))}
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
                          {product.priceVip > 0 && (
                            <span className="text-[10px] text-purple-600 dark:text-purple-400 block">
                              VIP: {product.priceVip.toLocaleString('vi-VN')} đ
                            </span>
                          )}
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

                      {/* Stock Status */}
                      <td className="py-3 px-4 text-center">
                        <div>
                          <span
                            className={`font-bold font-mono text-xs ${
                              isOut
                                ? 'text-rose-600 dark:text-rose-400'
                                : isLow
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {product.stockBaseUnits.toLocaleString('vi-VN')} {product.baseUnit}
                          </span>
                          <span
                            className={`block text-[10px] mt-0.5 ${
                              isOut
                                ? 'text-rose-500'
                                : isLow
                                ? 'text-amber-500'
                                : 'text-slate-400'
                            }`}
                          >
                            {isOut ? 'Hết hàng' : isLow ? 'Sắp hết' : 'An toàn'}
                          </span>
                        </div>
                      </td>

                      {/* Serial / FEFO Tracking */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {product.hasExpiry && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                              Lô FEFO
                            </span>
                          )}
                          {product.hasSerial && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                              Serial/IMEI
                            </span>
                          )}
                          {!product.hasExpiry && !product.hasSerial && (
                            <span className="text-slate-400 text-[11px]">-</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <RowActionMenu
                          items={[
                            {
                              id: `edit-${product.id}`,
                              label: 'Chỉnh sửa sản phẩm',
                              icon: Edit2,
                              variant: 'indigo',
                              onClick: () => handleOpenEdit(product),
                            },
                            {
                              id: `copy-sku-${product.id}`,
                              label: `Sao chép mã SKU (${product.sku})`,
                              icon: Copy,
                              onClick: () => navigator.clipboard.writeText(product.sku),
                            },
                            ...(product.barcode
                              ? [
                                  {
                                    id: `copy-barcode-${product.id}`,
                                    label: `Sao chép barcode (${product.barcode})`,
                                    icon: Barcode,
                                    onClick: () => navigator.clipboard.writeText(product.barcode!),
                                  },
                                ]
                              : []),
                            {
                              id: `delete-${product.id}`,
                              label: 'Xóa sản phẩm',
                              icon: Trash2,
                              variant: 'danger',
                              divider: true,
                              onClick: () => handleDelete(product.id, product.name),
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

        {/* Mobile Distilled Cards View (Chắt lọc thông tin cốt lõi: Ảnh, Tên, SKU, Nhóm, Giá lẻ/sỉ, Tồn khả dụng, Quy đổi) */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {paginatedProducts.length === 0 ? (
            <div className="py-12 px-4 text-center text-slate-400">
              <Boxes className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="font-semibold text-xs text-slate-600 dark:text-slate-300">Không tìm thấy sản phẩm nào</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Thử đổi từ khóa hoặc chọn nhóm hàng khác</p>
            </div>
          ) : (
            paginatedProducts.map(product => {
              const isLow = product.stockBaseUnits > 0 && product.stockBaseUnits <= product.minStockAlert;
              const isOut = product.stockBaseUnits <= 0;
              const secondaryUnits = (product.units || []).filter(u => !u.isBase);

              return (
                <div key={product.id} className="p-3.5 space-y-2.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  {/* Top Row: Thumbnail + Name + SKU + Category + 1-Tap Action Menu */}
                  <div className="flex items-start gap-3">
                    <img
                      src={product.imageUrl || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=100&auto=format&fit=crop&q=80'}
                      alt={product.name}
                      className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-800 shadow-xs"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0 pr-1">
                          <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm leading-snug line-clamp-2">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.2 rounded border border-indigo-100 dark:border-indigo-900/40">
                              {product.sku}
                            </span>
                            <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded">
                              {product.category}
                            </span>
                          </div>
                        </div>

                        {/* Action Menu (1 tap) */}
                        <div className="shrink-0 -mr-1">
                          <RowActionMenu
                            items={[
                              {
                                id: `edit-mob-${product.id}`,
                                label: 'Chỉnh sửa sản phẩm',
                                icon: Edit2,
                                variant: 'indigo',
                                onClick: () => handleOpenEdit(product),
                              },
                              {
                                id: `copy-sku-mob-${product.id}`,
                                label: `Sao chép SKU (${product.sku})`,
                                icon: Copy,
                                onClick: () => navigator.clipboard.writeText(product.sku),
                              },
                              ...(product.barcode
                                ? [
                                    {
                                      id: `copy-barcode-mob-${product.id}`,
                                      label: `Sao chép barcode (${product.barcode})`,
                                      icon: Barcode,
                                      onClick: () => navigator.clipboard.writeText(product.barcode!),
                                    },
                                  ]
                                : []),
                              {
                                id: `delete-mob-${product.id}`,
                                label: 'Xóa sản phẩm',
                                icon: Trash2,
                                variant: 'danger',
                                divider: true,
                                onClick: () => handleDelete(product.id, product.name),
                              },
                            ]}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Middle Row: 2-Column Distilled Info Pill (Price & Stock) */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-medium block">Giá bán lẻ:</span>
                      <div className="font-black text-sm text-slate-900 dark:text-white">
                        {product.priceRetail.toLocaleString('vi-VN')} đ
                      </div>
                      {product.priceWholesale > 0 && (
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                          Sỉ: {product.priceWholesale.toLocaleString('vi-VN')} đ
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-medium block">Tồn khả dụng:</span>
                      <div
                        className={`font-mono font-bold text-sm ${
                          isOut
                            ? 'text-rose-600 dark:text-rose-400'
                            : isLow
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {product.stockBaseUnits.toLocaleString('vi-VN')} {product.baseUnit}
                      </div>
                      <div className="mt-0.5 flex justify-end">
                        {isOut ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300">
                            Hết hàng
                          </span>
                        ) : isLow ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                            Sắp hết (≤ {product.minStockAlert})
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                            Tồn an toàn
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Packaging Conversion & Barcode (if any) */}
                  {(secondaryUnits.length > 0 || product.barcode) && (
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5 px-0.5 flex-wrap gap-2">
                      {secondaryUnits.length > 0 ? (
                        <div className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300 text-[10px] sm:text-[11px]">
                          <Boxes className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span>1 {secondaryUnits[0].name} = {secondaryUnits[0].conversionRate} {product.baseUnit}</span>
                          {secondaryUnits.length > 1 && (
                            <span className="text-slate-400 text-[9px]">+{secondaryUnits.length - 1} ĐVT</span>
                          )}
                        </div>
                      ) : <div />}

                      {product.barcode && (
                        <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                          <Barcode className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{product.barcode}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
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
    </div>
  )}

      {/* ========================================================================= */}
      {/* TAB 2: QUẢN LÝ NHÓM SẢN PHẨM (FULL CRUD)                                   */}
      {/* ========================================================================= */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>Quản Lý Nhóm Sản Phẩm (Danh Mục Hàng Hóa)</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Phân loại ngành hàng, mã nhóm, màu sắc nhận diện & liên kết quản lý tồn kho sản phẩm
              </p>
            </div>

            <button
              id="add-category-btn"
              onClick={handleOpenAddCategory}
              className="w-full sm:w-auto justify-center px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Mới Nhóm Sản Phẩm</span>
            </button>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="p-3 sm:p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
              <span className="text-[11px] sm:text-xs text-slate-500 font-medium">Tổng Số Nhóm</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{categoryStats.total}</span>
                <span className="text-[10px] sm:text-xs text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded font-bold">Ngành hàng</span>
              </div>
            </div>

            <div className="p-3 sm:p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
              <span className="text-[11px] sm:text-xs text-slate-500 font-medium">Nhóm Đang Có Hàng</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{categoryStats.active}</span>
                <span className="text-[10px] text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">Hoạt động</span>
              </div>
            </div>

            <div className="p-3 sm:p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
              <span className="text-[11px] sm:text-xs text-slate-500 font-medium">Nhóm Chưa Có Hàng</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-bold text-slate-600 dark:text-slate-400">{categoryStats.empty}</span>
                <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-medium">Trống</span>
              </div>
            </div>

            <div className="p-3 sm:p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
              <span className="text-[11px] sm:text-xs text-slate-500 font-medium">Tổng SP Đã Gán</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">{categoryStats.totalAssigned}</span>
                <span className="text-[10px] sm:text-xs text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded font-bold">Sản phẩm</span>
              </div>
            </div>
          </div>

          {/* Search & Refresh Toolbar */}
          <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm flex items-center justify-between gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={catSearch}
                onChange={e => setCatSearch(e.target.value)}
                placeholder="Tìm kiếm nhóm sản phẩm theo tên, mã viết tắt, mô tả..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchCategories}
                disabled={isLoadingCategories}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCategories ? 'animate-spin' : ''}`} />
                Làm mới
              </button>
            </div>
          </div>

          {/* Category CRUD Table */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4 w-28">Mã Nhóm</th>
                    <th className="py-3 px-4 min-w-[200px]">Tên Nhóm Sản Phẩm</th>
                    <th className="py-3 px-4 w-36">Màu Nhận Diện</th>
                    <th className="py-3 px-4 min-w-[250px]">Mô Tả Ngành Hàng</th>
                    <th className="py-3 px-4 text-center w-36">Số Sản Phẩm</th>
                    <th className="py-3 px-4 text-right w-28">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300 opacity-60" />
                        <p className="font-semibold">Không tìm thấy nhóm sản phẩm nào phù hợp</p>
                        <p className="text-[11px] mt-1">Thử đổi từ khóa tìm kiếm hoặc nhấn nút Thêm Mới Nhóm Sản Phẩm</p>
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map(cat => {
                      const pCount = cat.productCount || 0;
                      const colorKey = cat.color || 'indigo';
                      const badgeStyle = COLOR_CLASSES[colorKey]?.badge || COLOR_CLASSES['indigo'].badge;
                      const bgDot = COLOR_CLASSES[colorKey]?.bg || 'bg-indigo-600';

                      return (
                        <tr key={cat.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] border border-slate-200 dark:border-slate-700">
                              {cat.code || cat.name.slice(0, 3).toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                              {cat.name}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStyle}`}>
                              <span className={`w-2 h-2 rounded-full ${bgDot}`} />
                              {cat.color ? cat.color.toUpperCase() : 'INDIGO'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                            {cat.description || <span className="text-slate-400 italic">Chưa có mô tả</span>}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => {
                                setCategoryFilter(cat.name);
                                setActiveTab('products');
                                showToast(`🔍 Đã lọc sản phẩm thuộc nhóm "${cat.name}"`);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors"
                              title="Nhấn để chuyển sang danh mục sản phẩm của nhóm này"
                            >
                              <span>{pCount}</span>
                              <span className="text-[10px] font-normal">sản phẩm</span>
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenEditCategory(cat)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                                title="Chỉnh sửa thông tin nhóm"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setDeletingCategory(cat);
                                  setReassignCatName(categoriesList.find(c => c.id !== cat.id)?.name || 'Khác');
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                                title="Xóa nhóm sản phẩm"
                              >
                                <Trash2 className="w-4 h-4" />
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

            {/* Mobile Distilled Category Cards */}
            <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCategories.length === 0 ? (
                <div className="py-12 px-4 text-center text-slate-400">
                  <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300 opacity-60" />
                  <p className="font-semibold text-xs text-slate-600 dark:text-slate-300">Không tìm thấy nhóm sản phẩm nào</p>
                </div>
              ) : (
                filteredCategories.map(cat => {
                  const pCount = cat.productCount || 0;
                  const colorKey = cat.color || 'indigo';
                  const bgDot = COLOR_CLASSES[colorKey]?.bg || 'bg-indigo-600';
                  const badgeStyle = COLOR_CLASSES[colorKey]?.badge || COLOR_CLASSES['indigo'].badge;

                  return (
                    <div key={cat.id} className="p-3.5 space-y-2 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-3 h-3 rounded-full shrink-0 ${bgDot}`} />
                          <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                            {cat.name}
                          </span>
                          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0">
                            {cat.code || cat.name.slice(0, 3).toUpperCase()}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleOpenEditCategory(cat)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                            title="Chỉnh sửa nhóm"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDeletingCategory(cat);
                              setReassignCatName(categoriesList.find(c => c.id !== cat.id)?.name || 'Khác');
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                            title="Xóa nhóm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {cat.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {cat.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-0.5">
                        <button
                          onClick={() => {
                            setCategoryFilter(cat.name);
                            setActiveTab('products');
                            showToast(`🔍 Đã lọc sản phẩm thuộc nhóm "${cat.name}"`);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          <Package className="w-3.5 h-3.5" />
                          <span>{pCount} sản phẩm trong nhóm →</span>
                        </button>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${badgeStyle} font-semibold`}>
                          {cat.color ? cat.color.toUpperCase() : 'INDIGO'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: QUẢN LÝ ĐƠN VỊ TÍNH - ĐVT (FULL CRUD)                              */}
      {/* ========================================================================= */}
      {activeTab === 'units' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Ruler className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>Quản Lý Đơn Vị Tính - ĐVT (Units of Measure)</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Quản lý các đơn vị tính cơ bản (nhỏ nhất) và đơn vị đóng gói/quy đổi (Thùng, Lốc, Kiện...)
              </p>
            </div>

            <button
              id="add-unit-btn"
              onClick={handleOpenAddUnit}
              className="w-full sm:w-auto justify-center px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Mới Đơn Vị Tính</span>
            </button>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="p-3 sm:p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
              <span className="text-[11px] sm:text-xs text-slate-500 font-medium">Tổng Đơn Vị Tính</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{unitStats.total}</span>
                <span className="text-[10px] sm:text-xs text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded font-bold">ĐVT</span>
              </div>
            </div>

            <div className="p-3 sm:p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
              <span className="text-[11px] sm:text-xs text-slate-500 font-medium">Đơn Vị Cơ Bản (Base)</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{unitStats.baseCount}</span>
                <span className="text-[10px] text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">Base Units</span>
              </div>
            </div>

            <div className="p-3 sm:p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
              <span className="text-[11px] sm:text-xs text-slate-500 font-medium">Đơn Vị Đóng Gói</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">{unitStats.packagingCount}</span>
                <span className="text-[10px] text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded font-bold">Packaging</span>
              </div>
            </div>

            <div className="p-3 sm:p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
              <span className="text-[11px] sm:text-xs text-slate-500 font-medium">Tổng Lượt Dùng SP</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">{unitStats.totalUsage}</span>
                <span className="text-[10px] sm:text-xs text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded font-bold">Liên kết</span>
              </div>
            </div>
          </div>

          {/* Quick Seed Bar */}
          <div className="p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/20 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Gợi ý thêm nhanh ĐVT bán lẻ phổ biến:
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { name: 'Cái', type: 'base' as const },
                { name: 'Lon', type: 'base' as const },
                { name: 'Chai', type: 'base' as const },
                { name: 'Hộp', type: 'base' as const },
                { name: 'Gói', type: 'base' as const },
                { name: 'Can', type: 'base' as const },
                { name: 'Kg', type: 'base' as const },
                { name: 'Lít', type: 'base' as const },
                { name: 'Thùng', type: 'packaging' as const },
                { name: 'Lốc', type: 'packaging' as const },
                { name: 'Kiện', type: 'packaging' as const },
                { name: 'Két', type: 'packaging' as const },
              ].map(item => {
                const isExisting = unitsList.some(u => u.name.toLowerCase() === item.name.toLowerCase());
                return (
                  <button
                    key={item.name}
                    disabled={isExisting}
                    onClick={() => handleQuickSeedUnit(item.name, item.type)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                      isExisting
                        ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                        : 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-700 hover:border-indigo-500 text-indigo-700 dark:text-indigo-300 hover:shadow-sm'
                    }`}
                    title={isExisting ? `ĐVT "${item.name}" đã có sẵn` : `Nhấn để thêm nhanh ĐVT "${item.name}"`}
                  >
                    + {item.name} {isExisting ? '✓' : ''}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm flex items-center justify-between gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={unitSearch}
                onChange={e => setUnitSearch(e.target.value)}
                placeholder="Tìm kiếm ĐVT theo tên, mã viết tắt, mô tả..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={unitTypeFilter}
                onChange={e => setUnitTypeFilter(e.target.value as any)}
                className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
              >
                <option value="all">Tất Cả Loại ĐVT</option>
                <option value="base">Đơn Vị Cơ Bản (Base)</option>
                <option value="packaging">Đơn Vị Đóng Gói (Packaging)</option>
              </select>

              <button
                onClick={fetchUnits}
                disabled={isLoadingUnits}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingUnits ? 'animate-spin' : ''}`} />
                Làm mới
              </button>
            </div>
          </div>

          {/* Units CRUD Table */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4 w-28">Mã ĐVT</th>
                    <th className="py-3 px-4 min-w-[180px]">Tên Đơn Vị Tính</th>
                    <th className="py-3 px-4 w-48">Phân Loại ĐVT</th>
                    <th className="py-3 px-4 min-w-[250px]">Mô Tả / Ứng Dụng</th>
                    <th className="py-3 px-4 text-center w-36">Sản Phẩm Áp Dụng</th>
                    <th className="py-3 px-4 text-right w-28">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUnits.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Ruler className="w-8 h-8 mx-auto mb-2 text-slate-300 opacity-60" />
                        <p className="font-semibold">Không tìm thấy đơn vị tính nào phù hợp</p>
                        <p className="text-[11px] mt-1">Hãy nhấn nút Thêm Mới ĐVT hoặc dùng các nút gợi ý nhanh ở trên</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUnits.map(unit => {
                      const pCount = unit.productCount || 0;
                      const isBase = unit.type === 'base';

                      return (
                        <tr key={unit.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] border border-slate-200 dark:border-slate-700">
                              {unit.code || unit.name.slice(0, 4).toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                              {unit.name}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {isBase ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                🟢 Đơn vị cơ bản (Base)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                📦 Đóng gói / Quy đổi
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                            {unit.description || <span className="text-slate-400 italic">Chưa có mô tả</span>}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              <span>{pCount}</span>
                              <span className="text-[10px] font-normal text-slate-400">sản phẩm</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenEditUnit(unit)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                                title="Chỉnh sửa ĐVT"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if ((unit.productCount || 0) > 0) {
                                    showToast(`⚠️ Không thể xóa: ĐVT '${unit.name}' đang được áp dụng cho ${unit.productCount} sản phẩm.`);
                                    return;
                                  }
                                  setDeletingUnit(unit);
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                                title="Xóa ĐVT"
                              >
                                <Trash2 className="w-4 h-4" />
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

            {/* Mobile Distilled Unit Cards */}
            <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUnits.length === 0 ? (
                <div className="py-12 px-4 text-center text-slate-400">
                  <Ruler className="w-8 h-8 mx-auto mb-2 text-slate-300 opacity-60" />
                  <p className="font-semibold text-xs text-slate-600 dark:text-slate-300">Không tìm thấy đơn vị tính nào</p>
                </div>
              ) : (
                filteredUnits.map(unit => {
                  const pCount = unit.productCount || 0;
                  const isBase = unit.type === 'base';

                  return (
                    <div key={unit.id} className="p-3.5 space-y-2 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                            {unit.code || unit.name.slice(0, 4).toUpperCase()}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                            {unit.name}
                          </span>
                          {isBase ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                              🟢 Cơ bản
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shrink-0">
                              📦 Đóng gói
                            </span>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleOpenEditUnit(unit)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                            title="Chỉnh sửa ĐVT"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if ((unit.productCount || 0) > 0) {
                                showToast(`⚠️ Không thể xóa: ĐVT '${unit.name}' đang được áp dụng cho ${unit.productCount} sản phẩm.`);
                                return;
                              }
                              setDeletingUnit(unit);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                            title="Xóa ĐVT"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {unit.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {unit.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                        <span>Sản phẩm áp dụng:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {pCount} sản phẩm
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: THÊM MỚI NHÓM SẢN PHẨM                                             */}
      {/* ========================================================================= */}
      {isAddCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Thêm Nhóm Sản Phẩm Mới
              </h3>
              <button
                onClick={() => setIsAddCatModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tên Nhóm Sản Phẩm *
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  placeholder="VD: Điện Gia Dụng, Đồ Uống, Thiết Bị Điện..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mã Viết Tắt (Code)
                </label>
                <input
                  type="text"
                  value={newCatCode}
                  onChange={e => setNewCatCode(e.target.value)}
                  placeholder="VD: DGD, DU, TBD..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono uppercase focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Màu Sắc Nhận Diện
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.keys(COLOR_CLASSES).map(color => {
                    const isSelected = newCatColor === color;
                    const cInfo = COLOR_CLASSES[color];
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewCatColor(color)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold capitalize transition-all ${
                          isSelected
                            ? `${cInfo.badge} ring-2 ring-indigo-500 shadow-sm font-bold`
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${cInfo.bg}`} />
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mô Tả Ngành Hàng
                </label>
                <textarea
                  rows={2}
                  value={newCatDesc}
                  onChange={e => setNewCatDesc(e.target.value)}
                  placeholder="Mô tả ngành hàng, các loại sản phẩm trực thuộc..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddCatModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                >
                  Tạo Nhóm Sản Phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CHỈNH SỬA NHÓM SẢN PHẨM                                            */}
      {/* ========================================================================= */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Chỉnh Sửa Nhóm: {editingCategory.name}
              </h3>
              <button
                onClick={() => setEditingCategory(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tên Nhóm Sản Phẩm *
                </label>
                <input
                  type="text"
                  required
                  value={editingCatName}
                  onChange={e => setEditingCatName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 font-medium"
                />
                <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1">
                  💡 Nếu đổi tên nhóm, toàn bộ sản phẩm đang thuộc nhóm này sẽ tự động được cập nhật theo tên mới.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mã Viết Tắt (Code)
                </label>
                <input
                  type="text"
                  value={editingCatCode}
                  onChange={e => setEditingCatCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono uppercase focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Màu Sắc Nhận Diện
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.keys(COLOR_CLASSES).map(color => {
                    const isSelected = editingCatColor === color;
                    const cInfo = COLOR_CLASSES[color];
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setEditingCatColor(color)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold capitalize transition-all ${
                          isSelected
                            ? `${cInfo.badge} ring-2 ring-indigo-500 shadow-sm font-bold`
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${cInfo.bg}`} />
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mô Tả Ngành Hàng
                </label>
                <textarea
                  rows={2}
                  value={editingCatDesc}
                  onChange={e => setEditingCatDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: XÁC NHẬN XÓA NHÓM SẢN PHẨM                                         */}
      {/* ========================================================================= */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Xác Nhận Xóa Nhóm Sản Phẩm
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bạn có chắc muốn xóa nhóm &quot;{deletingCategory.name}&quot;?
                </p>
              </div>
            </div>

            {(deletingCategory.productCount || 0) > 0 ? (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-2">
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">
                  ⚠️ Nhóm này hiện có {deletingCategory.productCount} sản phẩm.
                </p>
                <label className="block text-[11px] text-slate-600 dark:text-slate-300">
                  Chuyển các sản phẩm hiện có sang nhóm:
                </label>
                <select
                  value={reassignCatName}
                  onChange={e => setReassignCatName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                >
                  <option value="Khác">Khác (Mặc định)</option>
                  {categoriesList
                    .filter(c => c.id !== deletingCategory.id)
                    .map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Nhóm này hiện chưa có sản phẩm nào. Bạn có thể an tâm xóa.
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCategory}
                className="px-5 py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: THÊM / SỬA ĐƠN VỊ TÍNH (ĐVT)                                       */}
      {/* ========================================================================= */}
      {isUnitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Ruler className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                {editingUnit ? `Chỉnh Sửa ĐVT: ${editingUnit.name}` : 'Thêm Mới Đơn Vị Tính'}
              </h3>
              <button
                onClick={() => setIsUnitModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUnit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tên Đơn Vị Tính *
                </label>
                <input
                  type="text"
                  required
                  value={unitFormData.name}
                  onChange={e => setUnitFormData({ ...unitFormData, name: e.target.value })}
                  placeholder="VD: Cái, Lon, Chai, Hộp, Thùng, Lốc, Kg..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mã Viết Tắt (Code / Ký Hiệu)
                </label>
                <input
                  type="text"
                  value={unitFormData.code}
                  onChange={e => setUnitFormData({ ...unitFormData, code: e.target.value })}
                  placeholder="VD: CAI, LON, THUNG, KG..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono uppercase focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Phân Loại Đơn Vị Tính
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUnitFormData({ ...unitFormData, type: 'base' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      unitFormData.type === 'base'
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <span className="block text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      🟢 Đơn Vị Cơ Bản (Base)
                    </span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Đơn vị đo nhỏ nhất (Cái, Lon, Chai, Hộp, Chiếc, Kg, Lít...)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUnitFormData({ ...unitFormData, type: 'packaging' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      unitFormData.type === 'packaging'
                        ? 'border-purple-500 bg-purple-50/60 dark:bg-purple-950/40 ring-2 ring-purple-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <span className="block text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      📦 Đóng Gói / Quy Đổi
                    </span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Bao bì lớn chứa nhiều đơn vị cơ bản (Thùng, Lốc, Kiện, Két, Pallet...)
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mô Tả / Ứng Dụng
                </label>
                <textarea
                  rows={2}
                  value={unitFormData.description}
                  onChange={e => setUnitFormData({ ...unitFormData, description: e.target.value })}
                  placeholder="Ghi chú thêm về quy cách sử dụng ĐVT này..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUnitModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                >
                  {editingUnit ? 'Lưu Thay Đổi' : 'Thêm Đơn Vị Tính'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: XÁC NHẬN XÓA ĐƠN VỊ TÍNH                                           */}
      {/* ========================================================================= */}
      {deletingUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Xác Nhận Xóa Đơn Vị Tính
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bạn có chắc chắn muốn xóa ĐVT &quot;{deletingUnit.name}&quot;?
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Đơn vị tính này hiện không có sản phẩm nào sử dụng. Sau khi xóa, bạn có thể tạo lại bất kỳ lúc nào.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUnit(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUnit}
                className="px-5 py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT PRODUCT MODAL (WITH LOCAL IMAGE PICKER & MULTI PACKAGING UNITS) */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
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

            <form onSubmit={handleSaveProduct} className="p-6 space-y-5">
              {/* Section 1: Product Basic Info */}
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
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono uppercase focus:ring-2 focus:ring-indigo-500 font-semibold"
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
                      title="Quét mã vạch"
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
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 font-medium"
                  placeholder="VD: Smart Tivi Samsung 43 inch Crystal UHD 4K (43CU8000)"
                />
              </div>

              {/* Section 2: Category & Base Unit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nhóm sản phẩm (Managed Dropdown + Quick Add) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Nhóm Sản Phẩm *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsQuickAddCatOpen(!isQuickAddCatOpen)}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" /> Tạo nhóm mới
                    </button>
                  </div>

                  {isQuickAddCatOpen && (
                    <div className="mb-2 p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex gap-1.5 animate-fadeIn">
                      <input
                        type="text"
                        placeholder="Tên nhóm mới..."
                        value={quickCatName}
                        onChange={e => setQuickCatName(e.target.value)}
                        className="flex-1 px-2 py-1 text-xs rounded border border-indigo-300 bg-white dark:bg-slate-900"
                      />
                      <button
                        type="button"
                        onClick={handleQuickAddCategory}
                        className="px-2.5 py-1 text-xs font-bold rounded bg-indigo-600 text-white hover:bg-indigo-700"
                      >
                        Lưu
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsQuickAddCatOpen(false)}
                        className="p-1 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    {allCategoryNames.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Đơn vị tính cơ bản */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Đơn Vị Tính Cơ Bản (Nhỏ nhất) *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={formData.baseUnit}
                      onChange={e => setFormData({ ...formData, baseUnit: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-600 dark:text-indigo-400"
                      placeholder="VD: Cái, Lon, Can, Hộp..."
                    />
                    <select
                      onChange={e => {
                        if (e.target.value) setFormData({ ...formData, baseUnit: e.target.value });
                      }}
                      className="px-2 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 shrink-0"
                    >
                      <option value="">Gợi ý...</option>
                      {unitsList.length > 0
                        ? unitsList.map(u => (
                            <option key={u.id} value={u.name}>
                              {u.name} {u.type === 'base' ? '(Cơ bản)' : '(Đóng gói)'}
                            </option>
                          ))
                        : COMMON_BASE_UNITS.map(u => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Local Image Picker (Chọn từ thư mục máy tính) */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-indigo-600" />
                    Hình Ảnh Sản Phẩm (Chọn Từ Thư Mục Máy Tính)
                  </label>
                  {formData.image && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '' })}
                      className="text-[11px] text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Xóa ảnh
                    </button>
                  )}
                </div>

                {/* Hidden input for local file browser */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Dropzone & Preview Box */}
                {formData.image ? (
                  <div className="flex items-center gap-4 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <img
                      src={formData.image}
                      alt="Xem trước ảnh sản phẩm"
                      className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm shrink-0"
                    />
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đã chọn ảnh sản phẩm
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Ảnh đã sẵn sàng lưu vào hệ thống cơ sở dữ liệu.
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 flex items-center gap-1.5 transition-colors"
                      >
                        <FolderOpen className="w-3.5 h-3.5" /> Đổi Ảnh Khác Từ Máy Tính
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={e => {
                      e.preventDefault();
                      setIsDraggingImage(true);
                    }}
                    onDragLeave={() => setIsDraggingImage(false)}
                    onDrop={handleDropImage}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                      isDraggingImage
                        ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 scale-[1.01]'
                        : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-2">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Nhấn vào đây để chọn ảnh từ thư mục máy tính
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      hoặc kéo thả tệp hình ảnh vào khung này (Hỗ trợ PNG, JPG, WEBP, tối đa 5MB)
                    </span>
                  </div>
                )}

                {/* Quick Presets for Demo */}
                <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-medium">Hoặc chọn ảnh mẫu nhanh:</span>
                  {PRESET_IMAGES.map(p => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setFormData({ ...formData, image: p.url })}
                      className="px-2 py-0.5 text-[10px] rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-600 dark:text-slate-300"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section 4: Base Pricing Policy */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Chính Sách Bảng Giá Cơ Bản (Theo 1 {formData.baseUnit || 'ĐVT'})
                </span>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Giá Vốn Nhập Kho
                    </label>
                    <MoneyInput
                      value={formData.costPrice}
                      onChange={val => setFormData({ ...formData, costPrice: val })}
                      placeholder="0"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Giá Bán Lẻ Quầy *
                    </label>
                    <MoneyInput
                      required
                      value={formData.retailPrice}
                      onChange={val => setFormData({ ...formData, retailPrice: val })}
                      placeholder="0"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Giá Bán Sỉ Đại Lý
                    </label>
                    <MoneyInput
                      value={formData.wholesalePrice}
                      onChange={val => setFormData({ ...formData, wholesalePrice: val })}
                      placeholder="0"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Giá Khách VIP
                    </label>
                    <MoneyInput
                      value={formData.vipPrice}
                      onChange={val => setFormData({ ...formData, vipPrice: val })}
                      placeholder="0"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Stock Thresholds */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Số Lượng Tồn Kho Ban Đầu ({formData.baseUnit})
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.stockBaseUnits}
                    onChange={e => setFormData({ ...formData, stockBaseUnits: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
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

              {/* Section 6: Packaging Units (Quản Lý ĐVT Quy Đổi) */}
              <div className="p-4 rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Boxes className="w-4 h-4 text-indigo-600" />
                      Quản Lý Đơn Vị Tính Quy Đổi (Thùng / Lốc / Hộp / Kiện)
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Khai báo các đơn vị đóng gói lớn hơn {formData.baseUnit}, hệ số quy đổi và bảng giá riêng
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addPackagingUnitRow}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm ĐVT Quy Đổi
                  </button>
                </div>

                {formData.packagingUnits.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-slate-400 text-xs">
                    Sản phẩm này hiện chỉ dùng 1 đơn vị cơ bản là <strong>{formData.baseUnit}</strong>.
                    Bấm "+ Thêm ĐVT Quy Đổi" nếu có bán theo Thùng, Hộp, Lốc, Kiện...
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.packagingUnits.map((unit, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-indigo-600">ĐVT cấp {idx + 2}:</span>
                            <input
                              type="text"
                              required
                              value={unit.name}
                              onChange={e => updatePackagingUnitRow(idx, 'name', e.target.value)}
                              placeholder="VD: Thùng, Lốc, Két..."
                              className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                            />
                            <select
                              onChange={e => {
                                if (e.target.value) updatePackagingUnitRow(idx, 'name', e.target.value);
                              }}
                              className="px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500"
                            >
                              <option value="">Gợi ý...</option>
                              {COMMON_PACKAGING_UNITS.map(pu => (
                                <option key={pu} value={pu}>{pu}</option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => autoFillUnitPrices(idx)}
                              className="px-2 py-1 text-[11px] rounded bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 hover:bg-indigo-100 flex items-center gap-1"
                              title="Tự động nhân giá cơ bản với hệ số quy đổi"
                            >
                              <Calculator className="w-3 h-3" /> Tự tính giá
                            </button>
                            <button
                              type="button"
                              onClick={() => removePackagingUnitRow(idx)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              title="Xóa ĐVT này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Conversion & Prices */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-0.5">
                              Hệ số (1 {unit.name || 'ĐVT'} = ? {formData.baseUnit})
                            </label>
                            <input
                              type="number"
                              min={1}
                              required
                              value={unit.conversionRate}
                              onChange={e => updatePackagingUnitRow(idx, 'conversionRate', Number(e.target.value))}
                              className="w-full px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-indigo-600"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-400 mb-0.5">
                              Giá Bán Lẻ theo {unit.name || 'ĐVT'}
                            </label>
                            <MoneyInput
                              value={unit.priceRetail}
                              onChange={val => updatePackagingUnitRow(idx, 'priceRetail', val)}
                              placeholder="0"
                              className="w-full px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-400 mb-0.5">
                              Giá Bán Sỉ theo {unit.name || 'ĐVT'}
                            </label>
                            <MoneyInput
                              value={unit.priceWholesale}
                              onChange={val => updatePackagingUnitRow(idx, 'priceWholesale', val)}
                              placeholder="0"
                              className="w-full px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-400 mb-0.5">
                              Giá VIP theo {unit.name || 'ĐVT'}
                            </label>
                            <MoneyInput
                              value={unit.priceVip}
                              onChange={val => updatePackagingUnitRow(idx, 'priceVip', val)}
                              placeholder="0"
                              className="w-full px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200"
                            />
                          </div>
                        </div>

                        {/* Conversion helper note */}
                        <div className="text-[10px] text-slate-400 pt-0.5">
                          💡 1 {unit.name || 'ĐVT'} = {unit.conversionRate} {formData.baseUnit} • Bán lẻ:{' '}
                          {(unit.priceRetail || 0).toLocaleString('vi-VN')} đ • Bán sỉ:{' '}
                          {(unit.priceWholesale || 0).toLocaleString('vi-VN')} đ
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 7: Serial / FEFO Tracking */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40">
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
                    <span className="text-[10px] text-slate-500">Bắt buộc nhập số lô & ngày hết hạn khi nhập kho</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40">
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
                    <span className="text-[10px] text-slate-500">Mỗi chiếc có mã định danh duy nhất bảo hành</span>
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
