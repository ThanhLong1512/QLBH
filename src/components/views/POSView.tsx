"use client";
import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Product, CartItem, TierPriceType, Customer } from '../../types/erp';
import { Pagination } from '../common/Pagination';
import { MoneyInput } from '../common/MoneyInput';
import {
  Plus,
  X,
  Search,
  ScanBarcode,
  QrCode,
  Lock,
  Unlock,
  AlertTriangle,
  CreditCard,
  Banknote,
  FileCheck,
  Trash2,
  Package,
  Layers,
  Sparkles,
  Printer,
  ChevronDown,
  ShieldAlert,
  ShieldCheck,
  Loader2,
  Send,
  ShoppingCart,
  ArrowRight,
  ArrowLeft,
  Cpu,
  Tag,
  AlertCircle
} from 'lucide-react';

export const POSView: React.FC = () => {
  const {
    products,
    customers,
    serials,
    tabs,
    activeTabId,
    setActiveTabId,
    addTab,
    closeTab,
    setTabCustomer,
    setTabTierPrice,
    addItemToTab,
    updateCartItemSerials,
    updateCartItemQty,
    updateCartItemPrice,
    updateCartItemUnit,
    removeItemFromTab,
    setTabDiscount,
    setTabShipping,
    setTabPaidAmount,
    setTabNotes,
    checkoutTab,
    openVietQrModal,
    openPinModal,
    openScannerModal,
    openPrintModal,
    createCreditApprovalRequest,
    grantCreditApprovalForTab,
    approvalRequests,
    getConvertedStockText,
    canViewCosts,
    showToast
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất Cả');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Serial Selection Modal State
  const [serialPickerItem, setSerialPickerItem] = useState<{
    product: Product;
    unitName?: string;
    existingSerials: string[];
    isEditingCartItem?: boolean;
  } | null>(null);
  const [selectedSerialNums, setSelectedSerialNums] = useState<string[]>([]);
  const [customSerialInput, setCustomSerialInput] = useState('');

  // Mobile responsive view toggle
  const [mobileTab, setMobileTab] = useState<'catalog' | 'cart'>('catalog');

  // Product Catalog Pagination state
  const [posPage, setPosPage] = useState(1);
  const [posPageSize, setPosPageSize] = useState(9);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const fallbackGuestCustomer: Customer = {
    id: 'cust-guest',
    code: 'KH-000',
    name: 'Khách Lẻ Mua Trực Tiếp',
    phone: '0900.000.000',
    address: 'Tại quầy',
    tier: 'dong',
    creditLimit: 0,
    currentDebt: 0,
    debtAging: { within30: 0, days31to60: 0, days61to90: 0, over90: 0 }
  };

  const activeTab = (tabs && tabs.length > 0)
    ? (tabs.find(t => t.id === activeTabId) || tabs[0])
    : {
        id: 'tab-default',
        name: 'Đơn 1',
        customerId: 'cust-guest',
        tierPrice: 'retail' as const,
        items: [],
        discountAmount: 0,
        shippingFee: 0,
        paidAmount: 0,
        notes: '',
        requiresManagerPin: false,
        pinOverrideGranted: false,
        requiresCreditApproval: false,
        creditApprovalGranted: false,
      };

  const currentCustomer: Customer = (customers && customers.length > 0)
    ? (customers.find(c => c.id === activeTab?.customerId) || customers[0] || fallbackGuestCustomer)
    : fallbackGuestCustomer;

  const categories = ['Tất Cả', 'Điện Máy', 'Gia Dụng', 'Hóa Mỹ Phẩm', 'Vật Liệu'];

  // Filter products by category and search
  const filteredProducts = (products || []).filter(prod => {
    const matchCat = selectedCategory === 'Tất Cả' || prod.category === selectedCategory;
    const matchSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.barcode && prod.barcode.includes(searchQuery));
    return matchCat && matchSearch;
  });

  // Paginate products
  const totalPosPages = Math.ceil(filteredProducts.length / posPageSize) || 1;
  const paginatedProducts = filteredProducts.slice(
    (posPage - 1) * posPageSize,
    posPage * posPageSize
  );

  // Calculate Subtotal & Totals
  const subtotal = (activeTab?.items || []).reduce((sum, item) => sum + item.totalPrice, 0);
  const totalAmount = Math.max(0, subtotal - (activeTab?.discountAmount || 0) + (activeTab?.shippingFee || 0));
  const remainingDebt = Math.max(0, totalAmount - (activeTab?.paidAmount || 0));

  // Wholesale / VIP savings calculation
  const retailSubtotal = (activeTab?.items || []).reduce((sum, item) => {
    const prod = products.find(p => p.id === item.productId);
    if (!prod) return sum + item.totalPrice;
    const unit = prod.units.find(u => u.name === item.selectedUnit) || prod.units[0];
    return sum + (unit.priceRetail * item.quantity * (1 - item.discountPercent / 100));
  }, 0);
  const wholesaleSavings = Math.max(0, retailSubtotal - subtotal);

  // Serial Selection Triggers
  const handleProductClick = (prod: Product) => {
    if (prod.hasSerial) {
      const available = serials
        .filter(s => (s.productId === prod.id || s.sku === prod.sku) && s.status === 'in_stock')
        .map(s => s.serialNumber);
      setSerialPickerItem({
        product: prod,
        existingSerials: [],
        isEditingCartItem: false
      });
      setSelectedSerialNums(available.length > 0 ? [available[0]] : []);
      setCustomSerialInput('');
    } else {
      addItemToTab(activeTab.id, prod);
    }
  };

  const handleOpenCartItemSerialPicker = (item: CartItem) => {
    const prod = products.find(p => p.id === item.productId);
    if (!prod) return;
    setSerialPickerItem({
      product: prod,
      unitName: item.selectedUnit,
      existingSerials: item.serialNumbers || [],
      isEditingCartItem: true
    });
    setSelectedSerialNums(item.serialNumbers || []);
    setCustomSerialInput('');
  };

  const handleConfirmSerialSelect = () => {
    if (!serialPickerItem) return;
    if (selectedSerialNums.length === 0) {
      showToast('⚠️ Vui lòng chọn ít nhất 1 mã Serial/IMEI hoặc thêm mã mới');
      return;
    }

    if (serialPickerItem.isEditingCartItem) {
      updateCartItemSerials(
        activeTab.id,
        serialPickerItem.product.id,
        serialPickerItem.unitName || serialPickerItem.product.units[0].name,
        selectedSerialNums
      );
      showToast(`✅ Đã cập nhật ${selectedSerialNums.length} Serial/IMEI`);
    } else {
      addItemToTab(
        activeTab.id,
        serialPickerItem.product,
        serialPickerItem.unitName,
        selectedSerialNums
      );
      showToast(`✅ Đã thêm ${serialPickerItem.product.name} kèm ${selectedSerialNums.length} Serial/IMEI`);
    }
    setSerialPickerItem(null);
  };

  // Credit calculation
  const isCreditExceeded =
    Boolean(currentCustomer?.creditLimit && currentCustomer.creditLimit > 0) &&
    remainingDebt > 0 &&
    ((currentCustomer?.currentDebt || 0) + remainingDebt > (currentCustomer?.creditLimit || 0));

  // Handle Quick Payment Chips
  const handleQuickCashChip = (chip: 'full' | 'plus50' | 'plus100' | 'plus500' | 'plus1m' | 'debt100') => {
    if (chip === 'full') {
      setTabPaidAmount(activeTab.id, totalAmount);
    } else if (chip === 'debt100') {
      setTabPaidAmount(activeTab.id, 0);
    } else if (chip === 'plus50') {
      setTabPaidAmount(activeTab.id, activeTab.paidAmount + 50000);
    } else if (chip === 'plus100') {
      setTabPaidAmount(activeTab.id, activeTab.paidAmount + 100000);
    } else if (chip === 'plus500') {
      setTabPaidAmount(activeTab.id, activeTab.paidAmount + 500000);
    } else if (chip === 'plus1m') {
      setTabPaidAmount(activeTab.id, activeTab.paidAmount + 1000000);
    }
  };

  // Perform Checkout
  const handleCheckout = async (method: 'cash' | 'vietqr' | 'debt') => {
    if (isProcessingPayment) return;

    if (activeTab.items.length === 0) {
      showToast('⚠️ Giỏ hàng hiện đang trống!');
      return;
    }

    if (activeTab.requiresManagerPin && !activeTab.pinOverrideGranted) {
      openPinModal(
        'Phát hiện mặt hàng có giá bán thấp hơn giá vốn hoặc chiết khấu > 10%!',
        () => {
          showToast('🔓 Đã xác thực quyền Quản Lý, bạn có thể hoàn tất thanh toán');
        }
      );
      return;
    }

    if (isCreditExceeded && !activeTab.creditApprovalGranted) {
      showToast('⚠️ Đơn hàng vượt hạn mức tín dụng khách hàng! Vui lòng bấm "Gửi Yêu Cầu Duyệt Nợ"');
      return;
    }

    if (method === 'vietqr') {
      const orderCode = `DH-${Date.now().toString().slice(-6)}`;
      openVietQrModal(
        activeTab.paidAmount > 0 ? activeTab.paidAmount : totalAmount,
        orderCode,
        currentCustomer?.name || 'Khách lẻ trực tiếp',
        async () => {
          try {
            setIsProcessingPayment(true);
            const completedOrder = await checkoutTab(activeTab.id, 'vietqr');
            if (completedOrder) {
              openPrintModal('k80', completedOrder);
            }
          } finally {
            setIsProcessingPayment(false);
          }
        }
      );
      return;
    }

    try {
      setIsProcessingPayment(true);
      const order = await checkoutTab(activeTab.id, method);
      if (order) {
        openPrintModal('k80', order);
      }
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-100 dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100">
      {/* 1. TOP TAB BAR */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-3 sm:px-4 py-2 bg-white dark:bg-slate-950/80 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab.id;
            return (
              <div
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl cursor-pointer text-xs font-semibold transition-all select-none border shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-600/30'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span>{tab.name}</span>
                {tab.items.length > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                      isActive ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {tab.items.length}
                  </span>
                )}
                {tabs.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                    className="p-0.5 rounded-md hover:bg-black/10 dark:hover:bg-black/30 text-slate-400 hover:text-rose-500 dark:hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })}

          <button
            onClick={addTab}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-800 text-xs font-semibold transition-all shrink-0"
            title="Thêm tab đơn mới"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Thêm Đơn</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Layers className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" /> Bàn Bán Hàng
          </span>
        </div>
      </div>

      {/* MOBILE SCREEN SWITCHER TAB (CHỈ HIỆN TRÊN MOBILE < LG) */}
      <div className="lg:hidden flex items-center border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 gap-2">
        <button
          type="button"
          onClick={() => setMobileTab('catalog')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            mobileTab === 'catalog'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          <Package className="h-3.5 w-3.5" />
          <span>Mặt Hàng ({filteredProducts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('cart')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
            mobileTab === 'cart'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          <span>Giỏ Đơn ({activeTab.items.length})</span>
          {totalAmount > 0 && (
            <span className="font-mono text-[11px] text-emerald-400 dark:text-emerald-300">
              • {totalAmount.toLocaleString('vi-VN')}đ
            </span>
          )}
        </button>
      </div>

      {/* 2. MAIN SPLIT SCREEN WORKSPACE */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden relative">
        {/* LEFT PANEL: PRODUCT CATALOG (7 COLS) */}
        <div
          className={`lg:col-span-7 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0E1320] overflow-hidden ${
            mobileTab === 'cart' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Search Bar & Barcode Scanner trigger */}
          <div className="p-2.5 sm:p-3 border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/40 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPosPage(1);
                }}
                placeholder="Tìm tên sản phẩm, SKU hoặc Barcode..."
                className="w-full rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setPosPage(1);
                  }}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() =>
                openScannerModal((code) => {
                  const matched = products.find(
                    (p) => p.barcode === code || p.sku.toLowerCase() === code.toLowerCase()
                  );
                  if (matched) {
                    addItemToTab(activeTab.id, matched);
                  } else {
                    showToast(`⚠️ Không tìm thấy sản phẩm có mã: ${code}`);
                  }
                })
              }
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-600/20 hover:bg-indigo-100 dark:hover:bg-indigo-600/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 text-xs font-semibold transition-all active:scale-95 shrink-0"
            >
              <ScanBarcode className="h-4 w-4" />
              <span className="hidden sm:inline">Quét Mã</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-1.5 px-3 py-2 border-b border-slate-200 dark:border-slate-800/60 overflow-x-auto no-scrollbar bg-slate-100/60 dark:bg-slate-950/20">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setPosPage(1);
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Cards Grid */}
          <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 content-start">
            {paginatedProducts.length === 0 ? (
              <div className="col-span-2 sm:col-span-3 text-center py-12 text-slate-400 dark:text-slate-500 text-xs">
                Không tìm thấy sản phẩm nào phù hợp bộ lọc.
              </div>
            ) : (
              paginatedProducts.map((prod) => {
                // Calculate price based on selected tier
                const primaryUnit = prod.units[0];
                const price =
                  activeTab.tierPrice === 'vip'
                    ? primaryUnit.priceVip
                    : activeTab.tierPrice === 'wholesale'
                    ? primaryUnit.priceWholesale
                    : primaryUnit.priceRetail;

                const isLowStock = prod.stockBaseUnits <= prod.minStockAlert;

                return (
                  <div
                    key={prod.id}
                    onClick={() => handleProductClick(prod)}
                    className="flex flex-col justify-between rounded-xl bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 p-2.5 sm:p-3 cursor-pointer shadow-xs transition-all duration-150 group active:scale-[0.98]"
                  >
                    <div className="space-y-1.5">
                      {/* Tags */}
                      <div className="flex items-center justify-between gap-1 text-[10px]">
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                          {prod.sku}
                        </span>
                        {prod.hasSerial && (
                          <span className="px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold">
                            Serial
                          </span>
                        )}
                        {prod.hasExpiry && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
                            Date
                          </span>
                        )}
                      </div>

                      {/* Name */}
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 leading-snug">
                        {prod.name}
                      </h4>

                      {/* Multi-tier packaging conversion preview */}
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        Tồn:{' '}
                        <span className={isLowStock ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-700 dark:text-slate-200 font-medium'}>
                          {getConvertedStockText(prod)}
                        </span>
                      </div>
                    </div>

                    {/* Pricing & Units trigger */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-mono font-black text-indigo-600 dark:text-indigo-400">
                          {price.toLocaleString('vi-VN')} <span className="text-[9px] font-normal">đ</span>
                        </div>
                        <div className="text-[9px] text-slate-400 dark:text-slate-500">
                          ĐVT: {primaryUnit.name}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="h-7 w-7 rounded-lg bg-indigo-50 dark:bg-indigo-600/20 group-hover:bg-indigo-600 text-indigo-600 dark:text-indigo-400 group-hover:text-white flex items-center justify-center transition-colors shadow-xs"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Product Catalog Pagination */}
          {filteredProducts.length > posPageSize && (
            <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 p-2">
              <Pagination
                currentPage={posPage}
                totalItems={filteredProducts.length}
                pageSize={posPageSize}
                onPageChange={(page) => setPosPage(page)}
                onPageSizeChange={(sz) => {
                  setPosPageSize(sz);
                  setPosPage(1);
                }}
                pageSizeOptions={[6, 9, 12, 18]}
              />
            </div>
          )}

          {/* Mobile Sticky Floating Cart Bar (Khi đang xem mặt hàng và giỏ có đồ) */}
          {activeTab.items.length > 0 && (
            <div className="lg:hidden sticky bottom-0 left-0 right-0 p-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-lg flex items-center justify-between z-10">
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <ShoppingCart className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span>{activeTab.items.reduce((s, i) => s + i.quantity, 0)} món</span>
                  <span>•</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-black">
                    {totalAmount.toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="text-[10px] text-slate-500">Đơn: {activeTab.name}</div>
              </div>

              <button
                type="button"
                onClick={() => setMobileTab('cart')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <span>Thanh Toán</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: CART, BILLING & CREDIT GUARD (5 COLS) */}
        <div
          className={`lg:col-span-5 flex flex-col bg-white dark:bg-[#0B0F19] border-l border-slate-200 dark:border-slate-800 overflow-hidden ${
            mobileTab === 'catalog' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Mobile Back to Catalog Button */}
          <div className="lg:hidden p-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setMobileTab('catalog')}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline py-1 px-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Tiếp tục chọn sản phẩm</span>
            </button>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Giỏ: {activeTab.items.length} món
            </span>
          </div>

          {/* Customer & Price Tier Header */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-2">
            {/* Customer Dropdown */}
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <select
                  value={activeTab.customerId}
                  onChange={(e) => setTabCustomer(activeTab.id, e.target.value)}
                  className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-medium"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone}) - Hạng {c.tier.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Tier Selector */}
              <div className="flex rounded-xl bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-0.5 text-[11px] font-semibold">
                {(['retail', 'wholesale', 'vip'] as TierPriceType[]).map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setTabTierPrice(activeTab.id, tier)}
                    className={`px-2 py-1 rounded-lg transition-all ${
                      activeTab.tierPrice === tier
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tier === 'retail' ? 'Lẻ' : tier === 'wholesale' ? 'Sỉ' : 'VIP'}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Tier Savings Pill */}
            {wholesaleSavings > 0 && (
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[11px]">
                <span className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  Bảng giá: {activeTab.tierPrice === 'vip' ? 'Đại Lý VIP' : 'Bán Sỉ Cấp 2'}
                </span>
                <span className="font-mono font-black text-emerald-700 dark:text-emerald-400">
                  Tiết kiệm: {wholesaleSavings.toLocaleString('vi-VN')} đ
                </span>
              </div>
            )}

            {/* Customer Credit Status Bar */}
            {(currentCustomer?.creditLimit || 0) > 0 && (
              <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 dark:text-slate-400">Hạn mức nợ:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {(currentCustomer?.creditLimit || 0).toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 dark:text-slate-400">Dư nợ:</span>
                  <span
                    className={`font-mono font-bold ${
                      (currentCustomer?.currentDebt || 0) > (currentCustomer?.creditLimit || 0)
                        ? 'text-rose-600 dark:text-rose-400'
                        : (currentCustomer?.currentDebt || 0) > (currentCustomer?.creditLimit || 0) * 0.8
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {(currentCustomer?.currentDebt || 0).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {activeTab.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
                <Package className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Chưa có sản phẩm trong đơn</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-600">Chọn sản phẩm bên trái hoặc quét mã vạch</p>
              </div>
            ) : (
              activeTab.items.map((item) => {
                const prod = products.find((p) => p.id === item.productId);
                const isLoss = item.unitPrice < item.costPricePerUnit;
                const isHighDiscount = item.discountPercent > 10;

                return (
                  <div
                    key={`${item.productId}-${item.selectedUnit}`}
                    className={`rounded-xl border p-2.5 transition-all space-y-2 ${
                      isLoss || isHighDiscount
                        ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                        : 'bg-slate-50 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {/* Item Top: Name, Unit Dropdown, Delete */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 truncate">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">SKU: {item.sku}</div>
                        {/* Serial / IMEI Tags in Cart Item */}
                        {(prod?.hasSerial || (item.serialNumbers && item.serialNumbers.length > 0)) && (
                          <div className="flex flex-wrap items-center gap-1 mt-1">
                            {item.serialNumbers && item.serialNumbers.length > 0 ? (
                              item.serialNumbers.map((sn, snIdx) => (
                                <button
                                  key={snIdx}
                                  type="button"
                                  onClick={() => handleOpenCartItemSerialPicker(item)}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 font-mono text-[9.5px] font-bold border border-indigo-200 dark:border-indigo-700/60 hover:bg-indigo-200"
                                  title="Nhấp để đổi Serial/IMEI"
                                >
                                  <Cpu className="h-2.5 w-2.5" />
                                  <span>{sn}</span>
                                </button>
                              ))
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenCartItemSerialPicker(item)}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300 font-mono text-[9.5px] font-bold border border-amber-300 dark:border-amber-700 animate-pulse hover:bg-amber-200"
                              >
                                <AlertCircle className="h-2.5 w-2.5" />
                                <span>+ Gắn Serial / IMEI</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Multi-tier packaging unit selector */}
                      {prod && prod.units.length > 1 && (
                        <select
                          value={item.selectedUnit}
                          onChange={(e) =>
                            updateCartItemUnit(
                              activeTab.id,
                              item.productId,
                              item.selectedUnit,
                              e.target.value
                            )
                          }
                          className="rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[11px] text-indigo-700 dark:text-indigo-300 font-semibold focus:outline-none"
                        >
                          {prod.units.map((u) => (
                            <option key={u.name} value={u.name}>
                              {u.name} (x{u.conversionRate})
                            </option>
                          ))}
                        </select>
                      )}

                      <button
                        onClick={() => removeItemFromTab(activeTab.id, item.productId, item.selectedUnit)}
                        className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-0.5"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Item Bottom: Qty controls, Price, Total */}
                    <div className="flex items-center justify-between gap-2 text-xs">
                      {/* Qty +/- */}
                      <div className="flex items-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <button
                          onClick={() =>
                            updateCartItemQty(
                              activeTab.id,
                              item.productId,
                              item.selectedUnit,
                              item.quantity - 1
                            )
                          }
                          className="px-2 py-0.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateCartItemQty(
                              activeTab.id,
                              item.productId,
                              item.selectedUnit,
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="w-10 bg-transparent text-center text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
                        />
                        <button
                          onClick={() =>
                            updateCartItemQty(
                              activeTab.id,
                              item.productId,
                              item.selectedUnit,
                              item.quantity + 1
                            )
                          }
                          className="px-2 py-0.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                        >
                          +
                        </button>
                      </div>

                      {/* Price input / display */}
                      <div className="flex items-center gap-1.5 w-24">
                        <MoneyInput
                          value={item.unitPrice}
                          onChange={(val) =>
                            updateCartItemPrice(
                              activeTab.id,
                              item.productId,
                              item.selectedUnit,
                              val,
                              item.discountPercent
                            )
                          }
                          suffix=""
                          className="w-full bg-transparent text-right text-xs font-mono font-bold text-slate-800 dark:text-slate-200 focus:outline-none border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700"
                        />
                        <span className="text-[11px] text-slate-400">đ</span>
                      </div>

                      {/* Line total */}
                      <div className="font-mono font-bold text-slate-900 dark:text-white text-right">
                        {item.totalPrice.toLocaleString('vi-VN')} đ
                      </div>
                    </div>

                    {/* Anti-Loss Warning Pill */}
                    {(isLoss || isHighDiscount) && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-rose-700 dark:text-rose-400 bg-rose-100/80 dark:bg-rose-950/40 p-1.5 rounded-lg border border-rose-300 dark:border-rose-900/50">
                        <ShieldAlert className="h-3 w-3 shrink-0" />
                        <span>
                          {isLoss
                            ? `Bán lỗ! Đơn giá < Giá vốn (${item.costPricePerUnit.toLocaleString('vi-VN')} đ). Cần PIN Quản Lý.`
                            : 'Chiết khấu > 10%! Cần PIN Quản Lý.'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Billing & Payment Actions */}
          <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/90 p-3 space-y-3">
            {/* Calculation summary */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Tiền hàng:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{subtotal.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400 items-center">
                <span>Chiết khấu:</span>
                <div className="w-28">
                  <MoneyInput
                    value={activeTab.discountAmount}
                    onChange={(val) => setTabDiscount(activeTab.id, val)}
                    placeholder="0"
                    suffix="đ"
                    className="w-full text-right bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-0.5 text-xs font-mono text-slate-900 dark:text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400 items-center">
                <span>Phí giao hàng:</span>
                <div className="w-28">
                  <MoneyInput
                    value={activeTab.shippingFee}
                    onChange={(val) => setTabShipping(activeTab.id, val)}
                    placeholder="0"
                    suffix="đ"
                    className="w-full text-right bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-0.5 text-xs font-mono text-slate-900 dark:text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-800">
                <span>TỔNG CỘNG:</span>
                <span className="font-mono text-lg font-black text-indigo-600 dark:text-indigo-400">
                  {totalAmount.toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>

            {/* Payment: Khách trả & Quick Cash Chips */}
            <div className="space-y-1.5 pt-1 border-t border-slate-200 dark:border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 dark:text-slate-300 font-medium">Khách thanh toán:</span>
                <div className="w-36">
                  <MoneyInput
                    value={activeTab.paidAmount}
                    onChange={(val) => setTabPaidAmount(activeTab.id, val)}
                    suffix="đ"
                    className="w-full text-right bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Quick Cash Chips */}
              <div className="flex gap-1 overflow-x-auto no-scrollbar py-0.5">
                {[
                  { label: 'Đủ', id: 'full' },
                  { label: '+50k', id: 'plus50' },
                  { label: '+100k', id: 'plus100' },
                  { label: '+500k', id: 'plus500' },
                  { label: '+1Tr', id: 'plus1m' },
                  { label: 'Nợ 100%', id: 'debt100' }
                ].map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => handleQuickCashChip(chip.id as Parameters<typeof handleQuickCashChip>[0])}
                    className="px-2 py-0.5 rounded-md bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap border border-slate-200 dark:border-slate-700 shadow-2xs"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Remaining Debt notification */}
              {remainingDebt > 0 && (
                <div className="flex justify-between text-xs text-rose-600 dark:text-rose-400 font-semibold">
                  <span>Còn nợ đơn này:</span>
                  <span className="font-mono font-bold">{remainingDebt.toLocaleString('vi-VN')} đ</span>
                </div>
              )}
            </div>

            {/* DYNAMIC CREDIT GUARD WORKFLOW */}
            {isCreditExceeded && (
              activeTab?.creditApprovalGranted ? (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Quản lý đã duyệt hạn mức ngoại lệ (Bán tiếp)</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-bold">
                    Đã duyệt
                  </span>
                </div>
              ) : activeTab?.approvalRequestId ? (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                      <Loader2 className="h-4 w-4 animate-spin text-amber-600 shrink-0" />
                      <span>Đang chờ Quản lý duyệt yêu cầu nợ...</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-mono font-bold">
                      Chờ duyệt
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      openPinModal(
                        'Quản lý nhập mã PIN để duyệt nợ trực tiếp tại quầy POS',
                        () => grantCreditApprovalForTab(activeTab.id, 'Duyệt tại quầy bằng PIN')
                      )
                    }
                    className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all active:scale-95 text-center flex items-center justify-center gap-1.5"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    Quản Lý Duyệt Tại Quầy (Nhập PIN 8888)
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    Cảnh báo: Dư nợ vượt trần tín dụng (+
                    {Math.max(0, (currentCustomer?.currentDebt || 0) + remainingDebt - (currentCustomer?.creditLimit || 0)).toLocaleString('vi-VN')} đ)!
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() =>
                        openPinModal(
                          'Quản lý xác thực cấp nợ vượt trần trực tiếp',
                          () => grantCreditApprovalForTab(activeTab.id, 'Duyệt trực tiếp tại quầy')
                        )
                      }
                      className="py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all active:scale-95 text-center flex items-center justify-center gap-1"
                    >
                      <Lock className="h-3.5 w-3.5" />
                      Duyệt Tại Quầy (PIN)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        createCreditApprovalRequest(
                          activeTab.id,
                          `Đại lý ${currentCustomer?.name || 'Khách hàng'} xin ghi nợ đơn ${totalAmount.toLocaleString('vi-VN')} đ vượt trần hạn mức.`
                        )
                      }
                      className="py-1.5 px-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xs transition-all active:scale-95 text-center flex items-center justify-center gap-1"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Gửi Yêu Cầu Duyệt Nợ
                    </button>
                  </div>
                </div>
              )
            )}

            {/* Anti-Loss PIN Lock Button Trigger */}
            {activeTab.requiresManagerPin && !activeTab.pinOverrideGranted && (
              <button
                type="button"
                onClick={() =>
                  openPinModal(
                    'Đơn hàng có mặt hàng bán dưới giá vốn hoặc chiết khấu > 10%!',
                    () => {}
                  )
                }
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-600/20 dark:hover:bg-rose-600/30 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 text-xs font-bold transition-all"
              >
                <Lock className="h-4 w-4" />
                Đang Khóa Chống Bán Lỗ • Bấm Nhập PIN Mở Khóa
              </button>
            )}

            {/* ACTION CHECKOUT BUTTONS */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={() => handleCheckout('vietqr')}
                className={`flex flex-col items-center justify-center py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all active:scale-95 ${
                  isProcessingPayment ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                <QrCode className="h-4 w-4 mb-0.5" />
                <span>VietQR 0đ</span>
              </button>

              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={() => handleCheckout('cash')}
                className={`flex flex-col items-center justify-center py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95 ${
                  isProcessingPayment ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                <Banknote className="h-4 w-4 mb-0.5" />
                <span>{isProcessingPayment ? 'Đang lưu...' : 'Tiền Mặt'}</span>
              </button>

              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={() => handleCheckout('debt')}
                className={`flex flex-col items-center justify-center py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs transition-all active:scale-95 ${
                  isProcessingPayment ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                <FileCheck className="h-4 w-4 mb-0.5 text-amber-500 dark:text-amber-400" />
                <span>{isProcessingPayment ? 'Đang lưu...' : 'Ghi Nợ'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SERIAL / IMEI SELECTION MODAL */}
      {serialPickerItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                  <Cpu className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Chọn Mã Serial / IMEI Thiết Bị</h3>
                  <p className="text-[11px] text-slate-500 truncate max-w-[240px]">{serialPickerItem.product.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSerialPickerItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick manual serial input / scanner */}
            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                <span>Nhập mã mới hoặc quét Barcode / QR:</span>
                <span className="text-[10px] text-indigo-600 font-mono font-bold">Đã chọn: {selectedSerialNums.length}</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customSerialInput}
                  onChange={(e) => setCustomSerialInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customSerialInput.trim()) {
                      e.preventDefault();
                      const sn = customSerialInput.trim().toUpperCase();
                      if (!selectedSerialNums.includes(sn)) {
                        setSelectedSerialNums([...selectedSerialNums, sn]);
                      }
                      setCustomSerialInput('');
                    }
                  }}
                  placeholder="Gõ mã Serial / IMEI rồi bấm Enter..."
                  className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-mono font-bold uppercase focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customSerialInput.trim()) {
                      const sn = customSerialInput.trim().toUpperCase();
                      if (!selectedSerialNums.includes(sn)) {
                        setSelectedSerialNums([...selectedSerialNums, sn]);
                      }
                      setCustomSerialInput('');
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                >
                  Thêm
                </button>
              </div>
            </div>

            {/* Available in-stock serials */}
            <div className="space-y-2 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Serial / IMEI có sẵn trong kho ({serials.filter(s => (s.productId === serialPickerItem.product.id || s.sku === serialPickerItem.product.sku) && s.status === 'in_stock').length}):
              </span>
              <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                {serials.filter(s => (s.productId === serialPickerItem.product.id || s.sku === serialPickerItem.product.sku) && s.status === 'in_stock').length > 0 ? (
                  serials
                    .filter(s => (s.productId === serialPickerItem.product.id || s.sku === serialPickerItem.product.sku) && s.status === 'in_stock')
                    .map(s => {
                      const isSelected = selectedSerialNums.includes(s.serialNumber);
                      return (
                        <label
                          key={s.serialNumber}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer border transition-colors ${
                            isSelected
                              ? 'bg-indigo-50 border-indigo-300 dark:bg-indigo-950/40 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                if (isSelected) {
                                  setSelectedSerialNums(selectedSerialNums.filter(x => x !== s.serialNumber));
                                } else {
                                  setSelectedSerialNums([...selectedSerialNums, s.serialNumber]);
                                }
                              }}
                              className="rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="font-mono font-bold text-xs">{s.serialNumber}</span>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                            Trong kho
                          </span>
                        </label>
                      );
                    })
                ) : (
                  <div className="text-center py-4 text-slate-400 text-xs">
                    Chưa có Serial nào trong kho cho sản phẩm này. Bạn có thể tự gõ mã Serial/IMEI vào ô phía trên.
                  </div>
                )}
              </div>
            </div>

            {/* Currently selected serials tags */}
            {selectedSerialNums.length > 0 && (
              <div className="space-y-1 text-xs">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Đang gắn cho đơn ({selectedSerialNums.length}):</span>
                <div className="flex flex-wrap gap-1">
                  {selectedSerialNums.map(sn => (
                    <span
                      key={sn}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-mono text-[11px] font-bold"
                    >
                      {sn}
                      <button
                        type="button"
                        onClick={() => setSelectedSerialNums(selectedSerialNums.filter(x => x !== sn))}
                        className="text-indigo-500 hover:text-rose-600 ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSerialPickerItem(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmSerialSelect}
                className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md active:scale-95 transition-all"
              >
                Xác Nhận ({selectedSerialNums.length} Serial)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

