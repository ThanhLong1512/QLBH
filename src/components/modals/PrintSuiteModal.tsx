"use client";
import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Printer, X, Receipt, FileText, Tag, Check, Download } from 'lucide-react';

export const PrintSuiteModal: React.FC = () => {
  const { printModal, closePrintModal, bankConfig, showToast } = useERP();
  const [activeFormat, setActiveFormat] = useState<'k80' | 'a5' | 'a6'>(printModal.mode || 'k80');

  if (!printModal.isOpen || !printModal.order) return null;

  const order = printModal.order;
  const qrUrl = `https://img.vietqr.io/image/${bankConfig.bankId}-${bankConfig.accountNo}-compact2.png?amount=${order.totalAmount}&addInfo=${encodeURIComponent(order.code)}`;

  const handlePrint = () => {
    window.print();
    showToast('🖨️ Đã gửi lệnh in tới thiết bị!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-3 bg-slate-50 dark:bg-slate-950/90 no-print">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
              <Printer className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                Hệ Thống In Ấn Bản Địa 0đ (Native Print Suite)
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-mono">
                  {order.code}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Xem trước & in trực tiếp chuẩn khổ in (@media print)</p>
            </div>
          </div>

          {/* Format Tabs Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
            <button
              onClick={() => setActiveFormat('k80')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeFormat === 'k80'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Receipt className="h-3.5 w-3.5" />
              Bill K80 (80mm)
            </button>
            <button
              onClick={() => setActiveFormat('a5')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeFormat === 'a5'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              Hóa Đơn A5
            </button>
            <button
              onClick={() => setActiveFormat('a6')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeFormat === 'a6'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Tag className="h-3.5 w-3.5" />
              Tem Thùng A6
            </button>
          </div>

          <button
            onClick={closePrintModal}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Preview Workspace */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 dark:bg-slate-950/60 flex justify-center items-start">
          {/* FORMAT 1: K80 THERMAL RECEIPT (80mm) */}
          {activeFormat === 'k80' && (
            <div
              id="printable-k80"
              className="print-k80 w-[320px] bg-white text-slate-950 p-5 rounded-lg shadow-2xl font-mono text-[11px] leading-tight border border-slate-300"
            >
              <div className="text-center pb-2 border-b border-dashed border-slate-400">
                <h2 className="font-extrabold text-sm uppercase tracking-wider">NEXUS RETAIL & DISTRIBUTION</h2>
                <p className="text-[10px] text-slate-600">Tổng kho & Phân phối Thiết bị Toàn Quốc</p>
                <p className="text-[10px] text-slate-600">Hotline: 1900.888.666 - CN: 142 QL1A, Thủ Đức, TP.HCM</p>
              </div>

              <div className="py-2.5 border-b border-dashed border-slate-400 text-[10px] space-y-0.5">
                <div className="flex justify-between">
                  <span>MÃ ĐƠN:</span>
                  <strong className="text-slate-900">{order.code}</strong>
                </div>
                <div className="flex justify-between">
                  <span>NGÀY GIỜ:</span>
                  <span>{order.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span>THU NGÂN:</span>
                  <span>{order.cashierName}</span>
                </div>
                <div className="flex justify-between">
                  <span>KHÁCH HÀNG:</span>
                  <span className="font-semibold truncate max-w-[160px]">{order.customerName}</span>
                </div>
                {order.customerPhone && (
                  <div className="flex justify-between">
                    <span>SĐT KH:</span>
                    <span>{order.customerPhone}</span>
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div className="py-2.5 border-b border-dashed border-slate-400">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="border-b border-slate-300 font-bold">
                      <th className="text-left pb-1">Tên SP / ĐVT</th>
                      <th className="text-center pb-1">SL</th>
                      <th className="text-right pb-1">Đ.Giá</th>
                      <th className="text-right pb-1">T.Tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {order.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-1 pr-1">
                          <div className="font-semibold text-[10.5px] leading-tight">{item.name}</div>
                          <div className="text-[9px] text-slate-500">
                            [{item.selectedUnit}] {item.serialNumbers?.length ? `SN: ${item.serialNumbers[0]}` : ''}
                          </div>
                        </td>
                        <td className="text-center py-1 font-bold">{item.quantity}</td>
                        <td className="text-right py-1">{item.unitPrice.toLocaleString('vi-VN')}</td>
                        <td className="text-right py-1 font-semibold">
                          {item.totalPrice.toLocaleString('vi-VN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="py-2.5 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Cộng tiền hàng:</span>
                  <span>{order.subtotal.toLocaleString('vi-VN')} đ</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-slate-700">
                    <span>Chiết khấu:</span>
                    <span>-{order.discountAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}
                {order.shippingFee > 0 && (
                  <div className="flex justify-between">
                    <span>Phí giao hàng:</span>
                    <span>+{order.shippingFee.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}
                <div className="flex justify-between text-xs font-bold pt-1 border-t border-slate-300">
                  <span>TỔNG THANH TOÁN:</span>
                  <span className="text-sm font-black">{order.totalAmount.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between">
                  <span>Đã thanh toán:</span>
                  <span className="font-semibold">{order.paidAmount.toLocaleString('vi-VN')} đ</span>
                </div>
                {order.debtAmount > 0 && (
                  <div className="flex justify-between font-bold text-red-600">
                    <span>GHI NỢ ĐƠN NÀY:</span>
                    <span>{order.debtAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}
              </div>

              {/* QR Code */}
              <div className="pt-3 pb-2 flex flex-col items-center justify-center text-center">
                <img
                  src={qrUrl}
                  alt="VietQR"
                  className="w-28 h-28 object-contain border border-slate-200 rounded p-1"
                />
                <span className="text-[9px] text-slate-600 mt-1 font-medium">
                  Quét VietQR chuyển khoản chính xác nội dung {order.code}
                </span>
              </div>

              <div className="text-center pt-2 text-[9px] text-slate-500 border-t border-dashed border-slate-300 space-y-0.5">
                <p>Cảm ơn Quý khách & Hẹn gặp lại!</p>
                <p>Hotline hỗ trợ bảo hành: 1900.888.666</p>
                <p className="font-mono text-[8px] text-slate-400">NEXUS ERP v3.0 • Powered by AI Studio</p>
              </div>
            </div>
          )}

          {/* FORMAT 2: A5 FORMAL SALES INVOICE */}
          {activeFormat === 'a5' && (
            <div
              id="printable-a5"
              className="print-a5 w-[560px] bg-white text-slate-950 p-8 rounded-lg shadow-2xl font-sans text-xs leading-normal border border-slate-300"
            >
              {/* Header company info */}
              <div className="flex justify-between items-start pb-4 border-b-2 border-slate-900">
                <div>
                  <h1 className="font-black text-base uppercase text-slate-900 tracking-wide">
                    CÔNG TY CỔ PHẦN PHÂN PHỐI BÁN LẺ NEXUS VIỆT NAM
                  </h1>
                  <p className="text-[11px] text-slate-700">Trụ sở: 142 Quốc Lộ 1A, P. Linh Trung, TP. Thủ Đức, TP. Hồ Chí Minh</p>
                  <p className="text-[11px] text-slate-700">Mã Số Thuế: <strong>0318923418</strong> - Hotline: 1900.888.666</p>
                  <p className="text-[11px] text-slate-700">Email: ketoan@nexusretail.vn - Website: https://nexus-erp.vn</p>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-black text-indigo-950">{order.code}</div>
                  <div className="text-[10px] text-slate-500">Ngày lập: {order.createdAt}</div>
                </div>
              </div>

              {/* Title */}
              <div className="text-center my-4">
                <h2 className="text-lg font-black uppercase tracking-wider text-slate-900">
                  PHIẾU XUẤT KHO KIÊM BÁN HÀNG
                </h2>
                <p className="text-[11px] italic text-slate-600">(Liên 2: Giao cho khách hàng)</p>
              </div>

              {/* Customer info */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200 mb-4 text-[11px]">
                <div>
                  <p><strong className="text-slate-700">Khách hàng / Đại lý:</strong> {order.customerName}</p>
                  <p><strong className="text-slate-700">Điện thoại liên hệ:</strong> {order.customerPhone}</p>
                  <p><strong className="text-slate-700">Địa chỉ giao hàng:</strong> Khu vực nội thành & phân phối</p>
                </div>
                <div>
                  <p><strong className="text-slate-700">Hình thức thanh toán:</strong> {order.paymentMethod.toUpperCase()}</p>
                  <p><strong className="text-slate-700">Thu ngân / Phụ trách:</strong> {order.cashierName}</p>
                  <p><strong className="text-slate-700">Ghi chú đơn:</strong> {order.notes || 'Không có'}</p>
                </div>
              </div>

              {/* Items table */}
              <table className="w-full border-collapse border border-slate-300 text-[11px] mb-4">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold">
                    <th className="border border-slate-300 p-2 text-center w-8">STT</th>
                    <th className="border border-slate-300 p-2 text-left">Tên Hàng Hóa / Quy Cách</th>
                    <th className="border border-slate-300 p-2 text-center w-14">ĐVT</th>
                    <th className="border border-slate-300 p-2 text-center w-12">SL</th>
                    <th className="border border-slate-300 p-2 text-right w-24">Đơn Giá (đ)</th>
                    <th className="border border-slate-300 p-2 text-right w-28">Thành Tiền (đ)</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="border border-slate-300 p-1.5 text-center">{idx + 1}</td>
                      <td className="border border-slate-300 p-1.5">
                        <div className="font-semibold text-slate-900">{it.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">SKU: {it.sku}</div>
                      </td>
                      <td className="border border-slate-300 p-1.5 text-center font-medium">{it.selectedUnit}</td>
                      <td className="border border-slate-300 p-1.5 text-center font-bold">{it.quantity}</td>
                      <td className="border border-slate-300 p-1.5 text-right font-mono">{it.unitPrice.toLocaleString('vi-VN')}</td>
                      <td className="border border-slate-300 p-1.5 text-right font-mono font-bold">
                        {it.totalPrice.toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={5} className="border border-slate-300 p-1.5 text-right font-semibold">
                      Cộng tiền hàng:
                    </td>
                    <td className="border border-slate-300 p-1.5 text-right font-mono font-semibold">
                      {order.subtotal.toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                  {order.discountAmount > 0 && (
                    <tr>
                      <td colSpan={5} className="border border-slate-300 p-1.5 text-right text-slate-600">
                        Chiết khấu thương mại:
                      </td>
                      <td className="border border-slate-300 p-1.5 text-right font-mono text-slate-600">
                        -{order.discountAmount.toLocaleString('vi-VN')} đ
                      </td>
                    </tr>
                  )}
                  {order.shippingFee > 0 && (
                    <tr>
                      <td colSpan={5} className="border border-slate-300 p-1.5 text-right text-slate-600">
                        Cước vận chuyển:
                      </td>
                      <td className="border border-slate-300 p-1.5 text-right font-mono text-slate-600">
                        +{order.shippingFee.toLocaleString('vi-VN')} đ
                      </td>
                    </tr>
                  )}
                  <tr className="bg-slate-100">
                    <td colSpan={5} className="border border-slate-300 p-2 text-right font-black text-slate-900">
                      TỔNG GIÁ TRỊ THANH TOÁN:
                    </td>
                    <td className="border border-slate-300 p-2 text-right font-mono font-black text-indigo-900 text-sm">
                      {order.totalAmount.toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="border border-slate-300 p-1.5 text-right">
                      Đã thực thanh toán:
                    </td>
                    <td className="border border-slate-300 p-1.5 text-right font-mono font-bold text-emerald-800">
                      {order.paidAmount.toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                  {order.debtAmount > 0 && (
                    <tr className="bg-red-50 text-red-800">
                      <td colSpan={5} className="border border-slate-300 p-1.5 text-right font-bold">
                        Số tiền ghi nợ công nợ:
                      </td>
                      <td className="border border-slate-300 p-1.5 text-right font-mono font-black">
                        {order.debtAmount.toLocaleString('vi-VN')} đ
                      </td>
                    </tr>
                  )}
                </tfoot>
              </table>

              {/* VietQR and Signatures */}
              <div className="flex items-center justify-between pt-2 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <img src={qrUrl} alt="VietQR" className="w-20 h-20 object-contain border border-slate-300 rounded" />
                  <div className="text-[10px] text-slate-600 leading-tight">
                    <div className="font-bold text-slate-800">THANH TOÁN CHUYỂN KHOẢN:</div>
                    <div>Ngân hàng: <strong>MBBank</strong></div>
                    <div>STK: <strong>{bankConfig.accountNo}</strong></div>
                    <div>Chủ TK: <strong>{bankConfig.accountName}</strong></div>
                  </div>
                </div>

                <div className="text-right text-[11px] italic text-slate-500">
                  TP.HCM, Ngày {order.createdAt.slice(8, 10)} Tháng {order.createdAt.slice(5, 7)} Năm {order.createdAt.slice(0, 4)}
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-3 gap-4 text-center pt-4 text-[11px]">
                <div>
                  <div className="font-bold uppercase text-slate-800">Người Mua Hàng</div>
                  <div className="text-[10px] italic text-slate-500">(Ký và ghi rõ họ tên)</div>
                  <div className="h-16"></div>
                </div>
                <div>
                  <div className="font-bold uppercase text-slate-800">Người Giao Hàng</div>
                  <div className="text-[10px] italic text-slate-500">(Ký và ghi rõ họ tên)</div>
                  <div className="h-16"></div>
                </div>
                <div>
                  <div className="font-bold uppercase text-slate-800">Thủ Kho / Người Lập</div>
                  <div className="text-[10px] italic text-slate-500">(Ký và đóng dấu)</div>
                  <div className="h-16 flex items-end justify-center font-semibold text-slate-700">
                    {order.cashierName}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FORMAT 3: A6 SHIPPING LABEL (Tem dán thùng carton / chành xe) */}
          {activeFormat === 'a6' && (
            <div
              id="printable-a6"
              className="print-a6 w-[380px] bg-white text-slate-950 p-5 rounded-lg shadow-2xl font-sans text-xs border-2 border-slate-900"
            >
              {/* Top Banner */}
              <div className="flex justify-between items-center pb-2 border-b-2 border-slate-900">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-indigo-900 text-white flex items-center justify-center font-black text-xs">
                    NX
                  </div>
                  <div>
                    <h3 className="font-black text-xs uppercase tracking-wide">NEXUS LOGISTICS</h3>
                    <p className="text-[9px] text-slate-600">Tem Vận Chuyển Chành Xe / Shipper</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-[10px] font-bold font-mono">
                    KIỆN 1/1
                  </span>
                </div>
              </div>

              {/* Barcode & Tracking */}
              <div className="py-2.5 text-center border-b border-dashed border-slate-400">
                <div className="text-[10px] text-slate-500 font-mono tracking-widest">MÃ VẬN ĐƠN NỘI BỘ</div>
                <div className="font-mono text-xl font-black tracking-widest my-1">{order.code}</div>
                {/* Simulated Barcode Stripes */}
                <div className="flex justify-center items-center gap-0.5 h-10 px-4 bg-white">
                  {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 2, 4, 2, 1, 3, 1].map((w, i) => (
                    <div
                      key={i}
                      className="bg-black h-full"
                      style={{ width: `${w * 1.5}px` }}
                    />
                  ))}
                </div>
              </div>

              {/* Sender & Recipient Box */}
              <div className="py-2 border-b border-slate-300 text-[11px] space-y-1.5">
                <div className="p-2 rounded bg-slate-100 border border-slate-200">
                  <div className="font-bold text-[10px] uppercase text-slate-600">NGƯỜI GỬI:</div>
                  <div className="font-bold text-slate-900">TỔNG KHO PHÂN PHỐI NEXUS (TP.HCM)</div>
                  <div className="text-[10px] text-slate-600">SĐT: 1900.888.666 - CN Thủ Đức</div>
                </div>

                <div className="p-2 rounded bg-indigo-50/70 border border-indigo-200">
                  <div className="font-bold text-[10px] uppercase text-indigo-900">NGƯỜI NHẬN HÀNG:</div>
                  <div className="font-black text-sm text-slate-900">{order.customerName}</div>
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    📞 SĐT: {order.customerPhone}
                  </div>
                  <div className="text-[10px] text-slate-700">Đ/C: Giao tận nơi hoặc ký nhận tại Chành xe liên tỉnh</div>
                </div>
              </div>

              {/* Order content brief & Fragile Warning */}
              <div className="py-2 border-b border-slate-300 text-[10px]">
                <div className="font-semibold text-slate-800">DANH MỤC HÀNG HÓA ({order.items.length} mặt hàng):</div>
                <div className="text-slate-600 line-clamp-2">
                  {order.items.map(it => `${it.name} (x${it.quantity} ${it.selectedUnit})`).join(', ')}
                </div>
              </div>

              {/* Bottom Shipping flags & COD */}
              <div className="pt-2 flex justify-between items-center">
                <div>
                  <div className="text-[9px] text-slate-500 uppercase font-semibold">TIỀN THU HỘ (COD):</div>
                  <div className="text-base font-black text-rose-600 font-mono">
                    {order.debtAmount > 0 ? `${order.debtAmount.toLocaleString('vi-VN')} đ` : '0 đ (ĐÃ TT)'}
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="px-2 py-1 rounded bg-amber-100 border border-amber-300 text-amber-900 font-bold text-[9px] text-center">
                    ⚠️ HÀNG DỄ VỠ<br />XIN NHẸ TAY
                  </div>
                  <div className="px-2 py-1 rounded bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold text-[9px] text-center">
                    📦 ĐỒNG KIỂM<br />KHI NHẬN HÀNG
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-6 py-3 bg-slate-50 dark:bg-slate-950/90 no-print">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Tối ưu CSS Print Engine • Không cần cài thêm driver phức tạp
          </div>
          <div className="flex gap-2">
            <button
              onClick={closePrintModal}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Đóng
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-900/20 transition-all active:scale-95"
            >
              <Printer className="h-4 w-4" />
              In Ngay (Print Window)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

