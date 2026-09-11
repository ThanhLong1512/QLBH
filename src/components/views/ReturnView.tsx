"use client";
import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import { ReturnReceipt, ReturnItem } from '../../types/erp';
import { Pagination } from '../common/Pagination';
import {
  RotateCcw,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  AlertCircle,
  CheckCircle2,
  X,
  Eye,
  DollarSign,
  Package,
  ArrowRightLeft,
  User,
  Building2,
  FileText
} from 'lucide-react';

export const ReturnView: React.FC = () => {
  const {
    returns,
    addReturnReceipt,
    orders,
    customers,
    suppliers,
    products,
    canExportExcel,
    showToast,
    currentUser
  } = useERP();

  const [activeTab, setActiveTab] = useState<'customer' | 'supplier'>('customer');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination states
  const [custPage, setCustPage] = useState(1);
  const [custPageSize, setCustPageSize] = useState(8);

  const [supPage, setSupPage] = useState(1);
  const [supPageSize, setSupPageSize] = useState(8);

  // Modals
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [selectedReceiptDetail, setSelectedReceiptDetail] = useState<ReturnReceipt | null>(null);

  // Customer Return Form State
  const [custOrderId, setCustOrderId] = useState('');
  const [custCustomerId, setCustCustomerId] = useState('');
  const [custRefundMethod, setCustRefundMethod] = useState<'cash' | 'debt_deduction'>('cash');
  const [custReason, setCustReason] = useState('Khách hàng đổi ý');
  const [custItems, setCustItems] = useState<
    Array<{
      productId: string;
      productName: string;
      unitName: string;
      quantity: number;
      unitPrice: number;
      restock: boolean;
    }>
  >([]);
  const [custNotes, setCustNotes] = useState('');

  // Supplier Return Form State
  const [supSupplierId, setSupSupplierId] = useState('');
  const [supInboundCode, setSupInboundCode] = useState('');
  const [supReason, setSupReason] = useState('Lỗi từ nhà sản xuất');
  const [supItems, setSupItems] = useState<
    Array<{
      productId: string;
      productName: string;
      unitName: string;
      quantity: number;
      unitPrice: number;
    }>
  >([]);
  const [supNotes, setSupNotes] = useState('');

  // Filtered customer returns
  const customerReturns = useMemo(() => {
    return returns.filter(r => r.type === 'customer_return');
  }, [returns]);

  const filteredCustomerReturns = useMemo(() => {
    return customerReturns.filter(r => {
      return (
        r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.partnerName && r.partnerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.referenceOrderCode && r.referenceOrderCode.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
  }, [customerReturns, searchQuery]);

  const paginatedCustomerReturns = useMemo(() => {
    const start = (custPage - 1) * custPageSize;
    return filteredCustomerReturns.slice(start, start + custPageSize);
  }, [filteredCustomerReturns, custPage, custPageSize]);

  // Filtered supplier returns
  const supplierReturns = useMemo(() => {
    return returns.filter(r => r.type === 'supplier_return');
  }, [returns]);

  const filteredSupplierReturns = useMemo(() => {
    return supplierReturns.filter(r => {
      return (
        r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.partnerName && r.partnerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.referenceOrderCode && r.referenceOrderCode.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
  }, [supplierReturns, searchQuery]);

  const paginatedSupplierReturns = useMemo(() => {
    const start = (supPage - 1) * supPageSize;
    return filteredSupplierReturns.slice(start, start + supPageSize);
  }, [filteredSupplierReturns, supPage, supPageSize]);

  // Statistics
  const totalCustomerRefund = useMemo(() => {
    return customerReturns.reduce((sum, r) => sum + r.totalRefundAmount, 0);
  }, [customerReturns]);

  const totalSupplierCredit = useMemo(() => {
    return supplierReturns.reduce((sum, r) => sum + r.totalRefundAmount, 0);
  }, [supplierReturns]);

  // Open Customer Modal
  const handleOpenCustomerModal = () => {
    const firstOrder = orders[0];
    const defaultCust = customers[0];
    const defaultProd = products[0];

    setCustOrderId(firstOrder ? firstOrder.code : '');
    setCustCustomerId(defaultCust ? defaultCust.id : '');
    setCustRefundMethod('cash');
    setCustReason('Khách hàng đổi ý');
    setCustNotes('');

    if (defaultProd) {
      setCustItems([
        {
          productId: defaultProd.id,
          productName: defaultProd.name,
          unitName: defaultProd.baseUnit,
          quantity: 1,
          unitPrice: defaultProd.priceRetail,
          restock: true
        }
      ]);
    } else {
      setCustItems([]);
    }

    setIsCustomerModalOpen(true);
  };

  const calculateCustomerRefundTotal = useMemo(() => {
    return custItems.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
  }, [custItems]);

  const handleSaveCustomerReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (custItems.length === 0) {
      showToast('⚠️ Phiếu trả hàng phải có ít nhất 1 sản phẩm');
      return;
    }

    const cust = customers.find(c => c.id === custCustomerId);
    const totalRefund = calculateCustomerRefundTotal;

    const itemsPayload: ReturnItem[] = custItems.map(it => {
      const prod = products.find(p => p.id === it.productId)!;
      return {
        productId: it.productId,
        sku: prod.sku,
        productName: prod.name,
        unitName: it.unitName,
        conversionRate: 1,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        totalRefund: it.quantity * it.unitPrice,
        condition: it.restock ? 'restock' : 'damaged',
        reason: custReason
      };
    });

    addReturnReceipt({
      type: 'customer_return',
      date: new Date().toISOString().slice(0, 10),
      referenceOrderCode: custOrderId || undefined,
      partnerId: cust ? cust.id : 'walk-in',
      partnerName: cust ? cust.name : 'Khách lẻ vãng lai',
      partnerPhone: cust?.phone,
      creatorName: currentUser ? currentUser.name : 'Thu Ngân',
      items: itemsPayload,
      totalRefundAmount: totalRefund,
      refundMethod: custRefundMethod,
      notes: custNotes,
      status: 'completed'
    });
    setIsCustomerModalOpen(false);
  };

  // Open Supplier Modal
  const handleOpenSupplierModal = () => {
    const firstSup = suppliers[0];
    const defaultProd = products[0];

    setSupSupplierId(firstSup ? firstSup.id : '');
    setSupInboundCode('PNK-240901');
    setSupReason('Lỗi từ nhà sản xuất');
    setSupNotes('');

    if (defaultProd) {
      setSupItems([
        {
          productId: defaultProd.id,
          productName: defaultProd.name,
          unitName: defaultProd.baseUnit,
          quantity: 1,
          unitPrice: defaultProd.costPrice
        }
      ]);
    } else {
      setSupItems([]);
    }

    setIsSupplierModalOpen(true);
  };

  const calculateSupplierRefundTotal = useMemo(() => {
    return supItems.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
  }, [supItems]);

  const handleSaveSupplierReturn = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find(s => s.id === supSupplierId);
    if (!sup) {
      showToast('⚠️ Vui lòng chọn nhà cung cấp');
      return;
    }
    if (supItems.length === 0) {
      showToast('⚠️ Phiếu trả hàng phải có ít nhất 1 sản phẩm');
      return;
    }

    // Check stock
    for (const item of supItems) {
      const prod = products.find(p => p.id === item.productId);
      if (prod && prod.stockBaseUnits < item.quantity) {
        showToast(`⚠️ Không đủ tồn kho để trả lại hàng: ${prod.name}`);
        return;
      }
    }

    const totalRefund = calculateSupplierRefundTotal;
    const itemsPayload: ReturnItem[] = supItems.map(it => {
      const prod = products.find(p => p.id === it.productId)!;
      return {
        productId: it.productId,
        sku: prod.sku,
        productName: prod.name,
        unitName: it.unitName,
        conversionRate: 1,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        totalRefund: it.quantity * it.unitPrice,
        condition: 'damaged',
        reason: supReason
      };
    });

    addReturnReceipt({
      type: 'supplier_return',
      date: new Date().toISOString().slice(0, 10),
      referenceOrderCode: supInboundCode || undefined,
      partnerId: sup.id,
      partnerName: sup.name,
      partnerPhone: sup.phone,
      creatorName: currentUser ? currentUser.name : 'Thủ Kho',
      items: itemsPayload,
      totalRefundAmount: totalRefund,
      refundMethod: 'debt_deduction',
      notes: supNotes,
      status: 'completed'
    });
    setIsSupplierModalOpen(false);
  };

  const exportExcel = () => {
    const list = activeTab === 'customer' ? customerReturns : supplierReturns;
    const csvContent = [
      ['Mã Phiếu', 'Loại', 'Thời Gian', 'Đối Tác', 'Chứng Từ Gốc', 'Phương Thức Hoàn', 'Tổng Tiền Hoàn', 'Người Lập'].join(','),
      ...list.map(r =>
        [
          `"${r.code}"`,
          r.type === 'customer_return' ? 'Khách trả hàng' : 'Trả hàng NCC',
          `"${new Date(r.date).toLocaleDateString('vi-VN')}"`,
          `"${r.partnerName || ''}"`,
          `"${r.referenceOrderCode || ''}"`,
          r.refundMethod === 'cash' ? 'Tiền mặt' : r.refundMethod === 'vietqr' ? 'Chuyển khoản' : 'Trừ công nợ',
          r.totalRefundAmount,
          `"${r.creatorName}"`
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Danh_Sach_Doi_Tra_Hang_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast('📥 Đã xuất file danh sách đổi trả thành công!');
  };

  return (
    <div className="p-6 space-y-6 w-full">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Quản Lý Trả Hàng & Hoàn Tiền
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Xử lý khách hàng trả lại hàng (nhập lại kho/hàng lỗi, hoàn tiền/trừ công nợ) & xuất trả hàng cho Nhà Cung Cấp
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {canExportExcel && (
            <button
              onClick={exportExcel}
              className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              Xuất Báo Cáo
            </button>
          )}

          <button
            id="create-customer-return-btn"
            onClick={handleOpenCustomerModal}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Khách Trả Hàng (Hoàn Tiền)
          </button>

          <button
            id="create-supplier-return-btn"
            onClick={handleOpenSupplierModal}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Trả Hàng Nhà Cung Cấp
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Khách Trả Hàng</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {customerReturns.length} phiếu
            </span>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Bán lẻ & Đại lý</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Tổng Tiền Đã Hoàn Khách</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {totalCustomerRefund.toLocaleString('vi-VN')} đ
            </span>
            <span className="text-xs text-slate-400 font-mono">Tiền mặt / Trừ nợ</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Xuất Trả Hàng Cho NCC</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {supplierReturns.length} phiếu
            </span>
            <span className="text-xs text-amber-600 font-medium">Hàng lỗi / Hết hạn</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Tổng Tiền NCC Cấn Trừ Nợ</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {totalSupplierCredit.toLocaleString('vi-VN')} đ
            </span>
            <span className="text-[10px] text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              Giảm công nợ NCC
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => {
            setActiveTab('customer');
            setSearchQuery('');
          }}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'customer'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          Khách Hàng Trả Lại Hàng ({customerReturns.length})
        </button>

        <button
          onClick={() => {
            setActiveTab('supplier');
            setSearchQuery('');
          }}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'supplier'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Trả Hàng Cho Nhà Cung Cấp ({supplierReturns.length})
        </button>
      </div>

      {/* Search */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={
              activeTab === 'customer'
                ? 'Tìm theo mã phiếu, tên khách hàng hoặc mã đơn hàng gốc...'
                : 'Tìm theo mã phiếu, tên NCC hoặc mã phiếu nhập gốc...'
            }
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* TAB 1: CUSTOMER RETURNS */}
      {activeTab === 'customer' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold">
                  <th className="py-3 px-4">Mã Phiếu Trả</th>
                  <th className="py-3 px-4">Thời Gian</th>
                  <th className="py-3 px-4">Khách Hàng</th>
                  <th className="py-3 px-4">Đơn Hàng Gốc</th>
                  <th className="py-3 px-4 text-center">Số Mặt Hàng</th>
                  <th className="py-3 px-4 text-right">Tổng Tiền Hoàn</th>
                  <th className="py-3 px-4 text-center">Hình Thức Hoàn</th>
                  <th className="py-3 px-4">Người Lập</th>
                  <th className="py-3 px-4 text-center">Chi Tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {paginatedCustomerReturns.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      Chưa có phiếu khách trả hàng nào
                    </td>
                  </tr>
                ) : (
                  paginatedCustomerReturns.map(ret => (
                    <tr key={ret.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {ret.code}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(ret.date).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {ret.partnerName}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                        {ret.referenceOrderCode || '—'}
                      </td>
                      <td className="py-3 px-4 text-center font-medium">
                        {ret.items.length} món
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-rose-600 dark:text-rose-400">
                        {ret.totalRefundAmount.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ret.refundMethod === 'cash'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : 'bg-indigo-500/10 text-indigo-600'
                          }`}
                        >
                          {ret.refundMethod === 'cash' ? 'Tiền mặt' : ret.refundMethod === 'vietqr' ? 'Chuyển khoản' : 'Trừ công nợ'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {ret.creatorName}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedReceiptDetail(ret)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={custPage}
            totalItems={filteredCustomerReturns.length}
            pageSize={custPageSize}
            onPageChange={setCustPage}
            onPageSizeChange={setCustPageSize}
            itemName="phiếu trả hàng"
            className="border-t border-slate-200 dark:border-slate-800"
          />
        </div>
      )}

      {/* TAB 2: SUPPLIER RETURNS */}
      {activeTab === 'supplier' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold">
                  <th className="py-3 px-4">Mã Phiếu Trả NCC</th>
                  <th className="py-3 px-4">Thời Gian</th>
                  <th className="py-3 px-4">Nhà Cung Cấp</th>
                  <th className="py-3 px-4">Phiếu Nhập Gốc</th>
                  <th className="py-3 px-4 text-center">Số Mặt Hàng</th>
                  <th className="py-3 px-4 text-right">Tổng Tiền Cấn Trừ</th>
                  <th className="py-3 px-4">Người Lập</th>
                  <th className="py-3 px-4 text-center">Chi Tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {paginatedSupplierReturns.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Chưa có phiếu trả hàng nhà cung cấp nào
                    </td>
                  </tr>
                ) : (
                  paginatedSupplierReturns.map(ret => (
                    <tr key={ret.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-rose-600 dark:text-rose-400">
                        {ret.code}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(ret.date).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {ret.partnerName}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                        {ret.referenceOrderCode || '—'}
                      </td>
                      <td className="py-3 px-4 text-center font-medium">
                        {ret.items.length} món
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {ret.totalRefundAmount.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {ret.creatorName}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedReceiptDetail(ret)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={supPage}
            totalItems={filteredSupplierReturns.length}
            pageSize={supPageSize}
            onPageChange={setSupPage}
            onPageSizeChange={setSupPageSize}
            itemName="phiếu trả NCC"
            className="border-t border-slate-200 dark:border-slate-800"
          />
        </div>
      )}

      {/* CREATE CUSTOMER RETURN MODAL */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-6 py-4 backdrop-blur">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-indigo-600" />
                Lập Phiếu Khách Hàng Trả Lại Hàng & Hoàn Tiền
              </h3>
              <button
                onClick={() => setIsCustomerModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomerReturn} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Khách Hàng Trả Hàng *
                  </label>
                  <select
                    value={custCustomerId}
                    onChange={e => setCustCustomerId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone}) - Nợ: {c.currentDebt.toLocaleString('vi-VN')} đ
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mã Đơn Hàng Gốc (Nếu có)
                  </label>
                  <input
                    type="text"
                    value={custOrderId}
                    onChange={e => setCustOrderId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                    placeholder="VD: DH-1002"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Hình Thức Hoàn Tiền *
                  </label>
                  <select
                    value={custRefundMethod}
                    onChange={e => setCustRefundMethod(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="cash">Chi tiền mặt trả lại khách (Tạo phiếu chi PC)</option>
                    <option value="debt_deduction">Trừ vào công nợ của khách hàng</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lý Do Khách Trả Hàng
                  </label>
                  <input
                    type="text"
                    value={custReason}
                    onChange={e => setCustReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    placeholder="VD: Khách đổi ý, không ưng mẫu mã..."
                  />
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Sản Phẩm Khách Trả Lại ({custItems.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const p = products[0];
                      if (p) {
                        setCustItems(prev => [
                          ...prev,
                          {
                            productId: p.id,
                            productName: p.name,
                            unitName: p.baseUnit,
                            quantity: 1,
                            unitPrice: p.priceRetail,
                            restock: true
                          }
                        ]);
                      }
                    }}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm Dòng Sản Phẩm
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {custItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 grid grid-cols-1 sm:grid-cols-5 gap-2 items-center text-xs"
                    >
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-400 block">Sản phẩm</label>
                        <select
                          value={item.productId}
                          onChange={e => {
                            const p = products.find(pr => pr.id === e.target.value);
                            if (p) {
                              const newItems = [...custItems];
                              newItems[idx].productId = p.id;
                              newItems[idx].productName = p.name;
                              newItems[idx].unitName = p.baseUnit;
                              newItems[idx].unitPrice = p.priceRetail;
                              setCustItems(newItems);
                            }
                          }}
                          className="w-full p-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block">Số lượng ({item.unitName})</label>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={e => {
                            const newItems = [...custItems];
                            newItems[idx].quantity = Number(e.target.value);
                            setCustItems(newItems);
                          }}
                          className="w-full p-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block">Đơn giá hoàn (VNĐ)</label>
                        <input
                          type="number"
                          min={0}
                          value={item.unitPrice}
                          onChange={e => {
                            const newItems = [...custItems];
                            newItems[idx].unitPrice = Number(e.target.value);
                            setCustItems(newItems);
                          }}
                          className="w-full p-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0">
                        <label className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.restock}
                            onChange={e => {
                              const newItems = [...custItems];
                              newItems[idx].restock = e.target.checked;
                              setCustItems(newItems);
                            }}
                            className="rounded text-emerald-600"
                          />
                          Nhập lại kho
                        </label>
                        {custItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setCustItems(custItems.filter((_, i) => i !== idx))}
                            className="p-1 text-slate-400 hover:text-rose-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Tổng tiền hoàn lại cho khách hàng:
                </span>
                <span className="text-base font-bold text-rose-600 dark:text-rose-400">
                  {calculateCustomerRefundTotal.toLocaleString('vi-VN')} đ
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ghi Chú Phiếu Trả Hàng
                </label>
                <input
                  type="text"
                  value={custNotes}
                  onChange={e => setCustNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  placeholder="Ghi chú chi tiết..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Xác Nhận Trả Hàng & Hoàn Tiền
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE SUPPLIER RETURN MODAL */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-6 py-4 backdrop-blur">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-rose-600" />
                Lập Phiếu Xuất Trả Hàng Cho Nhà Cung Cấp
              </h3>
              <button
                onClick={() => setIsSupplierModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplierReturn} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nhà Cung Cấp Nhận Lại Hàng *
                  </label>
                  <select
                    value={supSupplierId}
                    onChange={e => setSupSupplierId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} - Nợ NCC: {s.currentDebt.toLocaleString('vi-VN')} đ
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mã Phiếu Nhập Gốc (PNK)
                  </label>
                  <input
                    type="text"
                    value={supInboundCode}
                    onChange={e => setSupInboundCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                    placeholder="VD: PNK-240901"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lý Do Trả Hàng Lại NCC *
                </label>
                <input
                  type="text"
                  required
                  value={supReason}
                  onChange={e => setSupReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  placeholder="VD: Hàng lỗi mạch, cận hạn dùng, giao sai quy cách đóng gói..."
                />
              </div>

              {/* Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Hàng Hóa Xuất Trả NCC ({supItems.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const p = products[0];
                      if (p) {
                        setSupItems(prev => [
                          ...prev,
                          {
                            productId: p.id,
                            productName: p.name,
                            unitName: p.baseUnit,
                            quantity: 1,
                            unitPrice: p.costPrice
                          }
                        ]);
                      }
                    }}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm Dòng Hàng
                  </button>
                </div>

                <div className="space-y-2">
                  {supItems.map((item, idx) => {
                    const prod = products.find(p => p.id === item.productId);
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center text-xs"
                      >
                        <div className="sm:col-span-2">
                          <label className="text-[10px] text-slate-400 block">Sản phẩm</label>
                          <select
                            value={item.productId}
                            onChange={e => {
                              const p = products.find(pr => pr.id === e.target.value);
                              if (p) {
                                const newItems = [...supItems];
                                newItems[idx].productId = p.id;
                                newItems[idx].productName = p.name;
                                newItems[idx].unitName = p.baseUnit;
                                newItems[idx].unitPrice = p.costPrice;
                                setSupItems(newItems);
                              }
                            }}
                            className="w-full p-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                          >
                            {products.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.name} (Tồn: {p.stockBaseUnits})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 block">
                            SL Trả (Tối đa: {prod?.stockBaseUnits || 0})
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={prod?.stockBaseUnits || 9999}
                            value={item.quantity}
                            onChange={e => {
                              const newItems = [...supItems];
                              newItems[idx].quantity = Number(e.target.value);
                              setSupItems(newItems);
                            }}
                            className="w-full p-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                          />
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {(item.quantity * item.unitPrice).toLocaleString('vi-VN')} đ
                          </span>
                          {supItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setSupItems(supItems.filter((_, i) => i !== idx))}
                              className="p-1 text-slate-400 hover:text-rose-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Tổng tiền cấn trừ giảm công nợ NCC:
                </span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {calculateSupplierRefundTotal.toLocaleString('vi-VN')} đ
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ghi Chú
                </label>
                <input
                  type="text"
                  value={supNotes}
                  onChange={e => setSupNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  placeholder="Ghi chú biên bản trả hàng..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Xác Nhận Trả Hàng Cho NCC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedReceiptDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Chi Tiết Phiếu: {selectedReceiptDetail.code}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedReceiptDetail.type === 'customer_return' ? 'Khách trả hàng' : 'Trả hàng NCC'} •{' '}
                  {new Date(selectedReceiptDetail.date).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <button
                onClick={() => setSelectedReceiptDetail(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {selectedReceiptDetail.items.map((it, i) => (
                <div key={i} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white block">{it.productName}</span>
                    <span className="text-slate-500 text-[11px]">
                      SL: {it.quantity} {it.unitName} • Đơn giá: {it.unitPrice.toLocaleString('vi-VN')} đ
                    </span>
                    {it.reason && (
                      <span className="text-[10px] text-slate-400 block">Lý do: {it.reason}</span>
                    )}
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {it.totalRefund.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Tổng giá trị phiếu hoàn:</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">
                {selectedReceiptDetail.totalRefundAmount.toLocaleString('vi-VN')} đ
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedReceiptDetail(null)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

