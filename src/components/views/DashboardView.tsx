"use client";
import React from 'react';
import { useERP } from '../../context/ERPContext';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  ArrowUpRight,
  PackageCheck,
  Clock,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Printer
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

const REVENUE_7_DAYS = [
  { day: 'T5 (04/09)', doanhThu: 92400000, loiNhuan: 21500000, donHang: 24 },
  { day: 'T6 (05/09)', doanhThu: 115800000, loiNhuan: 26800000, donHang: 31 },
  { day: 'T7 (06/09)', doanhThu: 138200000, loiNhuan: 31200000, donHang: 36 },
  { day: 'CN (07/09)', doanhThu: 104500000, loiNhuan: 23400000, donHang: 27 },
  { day: 'T2 (08/09)', doanhThu: 126900000, loiNhuan: 28600000, donHang: 33 },
  { day: 'T3 (09/09)', doanhThu: 132400000, loiNhuan: 29800000, donHang: 35 },
  { day: 'Hôm Nay', doanhThu: 148950000, loiNhuan: 32400000, donHang: 38 }
];

const CATEGORY_SALES = [
  { name: 'Điện Máy', doanhThu: 68500000, tyLe: 46 },
  { name: 'Gia Dụng', doanhThu: 32400000, tyLe: 22 },
  { name: 'Hóa Mỹ Phẩm', doanhThu: 26800000, tyLe: 18 },
  { name: 'Vật Liệu', doanhThu: 21250000, tyLe: 14 }
];

export const DashboardView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const { canViewCosts, orders, products, batches, openPrintModal } = useERP();

  const urgentBatches = batches.filter((b) => b.daysRemaining <= 30);
  const lowStockProducts = products.filter((p) => p.stockBaseUnits <= p.minStockAlert);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200 text-slate-800 dark:text-slate-100">
      {/* 4 Master KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Doanh Thu */}
        <div
          onClick={() => onNavigate('reports')}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-xs relative overflow-hidden cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-indigo-600 transition-colors">Doanh Thu Hôm Nay</span>
            <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/30 group-hover:scale-105 transition-transform">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              148.950.000 <span className="text-sm font-semibold text-slate-400">đ</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="h-4 w-4" />
              <span>+18.4%</span>
              <span className="text-slate-400 font-normal">so với hôm qua</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Lợi Nhuận Gộp (Masked if Thu Ngân) */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lợi Nhuận Gộp Ước Tính</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/30">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            {canViewCosts ? (
              <>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                  32.400.000 <span className="text-sm font-semibold text-slate-400">đ</span>
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Tỷ suất biên: 21.7%</span>
                </div>
              </>
            ) : (
              <>
                <div className="text-2xl font-black text-slate-400 dark:text-slate-600 font-mono tracking-wider py-1">
                  •••••••••••
                </div>
                <div className="mt-2 text-xs text-amber-600 dark:text-amber-400/80 italic flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5" /> Ẩn với vai trò Thu Ngân
                </div>
              </>
            )}
          </div>
        </div>

        {/* KPI 3: Đơn Hàng Hôm Nay */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Đơn Hàng Hôm Nay</span>
            <div className="h-8 w-8 rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400 flex items-center justify-center border border-violet-200 dark:border-violet-500/30">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              38 <span className="text-sm font-semibold text-slate-400">đơn</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">28 hoàn tất</span> •
              <span className="text-amber-600 dark:text-amber-400 font-medium">8 đang giao</span> •
              <span className="text-rose-600 dark:text-rose-400 font-medium">2 duyệt nợ</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Cảnh Báo Vận Hành */}
        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-white dark:bg-slate-900/90 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Cảnh Báo Vận Hành</span>
            <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-500/30">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 space-y-1">
              <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                24 Mã sắp hết hàng tồn kho
              </div>
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                5 Đại lý chạm trần tín dụng
              </div>
              <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                3 Lô hàng FEFO cận hạn dùng
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Curved AreaChart - 7 Days Revenue Trend */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Biến Thiên Doanh Thu 7 Ngày Gần Nhất</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Theo dõi doanh số bán lẻ và kênh phân phối đại lý</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                <span className="text-slate-600 dark:text-slate-300">Doanh Thu (VNĐ)</span>
              </div>
              {canViewCosts && (
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-600 dark:text-slate-300">Lợi Nhuận Gộp</span>
                </div>
              )}
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_7_DAYS} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" strokeOpacity={0.2} vertical={false} />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(0)}Tr`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#FFF'
                  }}
                  formatter={(val: any) => [
                    typeof val === 'number' ? `${val.toLocaleString('vi-VN')} đ` : String(val),
                    ''
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="doanhThu"
                  name="Doanh thu"
                  stroke="#6366F1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#revenueGrad)"
                />
                {canViewCosts && (
                  <Area
                    type="monotone"
                    dataKey="loiNhuan"
                    name="Lợi nhuận"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#profitGrad)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Bar Chart */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Doanh Số Theo Nhóm Ngành Hàng</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Phân bổ tỷ trọng nhóm sản phẩm</p>

            <div className="h-60 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CATEGORY_SALES} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" strokeOpacity={0.2} horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="#94A3B8"
                    fontSize={10}
                    tickFormatter={(val) => `${(val / 1000000).toFixed(0)}Tr`}
                  />
                  <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={11} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#FFF'
                    }}
                    formatter={(val: any) => [
                      typeof val === 'number' ? `${val.toLocaleString('vi-VN')} đ` : String(val),
                      'Doanh số'
                    ]}
                  />
                  <Bar dataKey="doanhThu" fill="#4F46E5" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px]">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
              <span className="text-slate-500 dark:text-slate-400">Top ngành hàng:</span>
              <div className="font-bold text-slate-900 dark:text-white">Điện Máy (46%)</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
              <span className="text-slate-500 dark:text-slate-400">Tốc độ quay vòng:</span>
              <div className="font-bold text-emerald-600 dark:text-emerald-400">14.2 ngày/vòng</div>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Split-View Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table 1: Latest Orders */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Đơn Hàng Mới Nhất
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Các giao dịch phát sinh gần đây</p>
            </div>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 font-semibold"
            >
              Xem tất cả <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {orders.slice(0, 4).map((order) => (
              <div key={order.id} className="py-3 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{order.code}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      order.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                        : order.status === 'shipping'
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'
                    }`}>
                      {order.status === 'completed' ? 'Hoàn thành' : order.status === 'shipping' ? 'Đang giao' : 'Chờ duyệt'}
                    </span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 truncate max-w-xs">{order.customerName}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{order.createdAt}</div>
                </div>

                <div className="text-right space-y-1">
                  <div className="font-mono font-black text-sm text-slate-900 dark:text-white">
                    {order.totalAmount.toLocaleString('vi-VN')} đ
                  </div>
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400">
                      {order.paymentMethod === 'vietqr' ? 'VietQR 0đ' : order.paymentMethod === 'cash' ? 'Tiền mặt' : 'Ghi nợ'}
                    </span>
                    <button
                      onClick={() => openPrintModal('k80', order)}
                      className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                      title="In hóa đơn K80"
                    >
                      <Printer className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Table 2: Urgent Stock & FEFO Batch Alerts */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                Cảnh Báo Kho Khẩn (Tồn Thấp & Cận Date)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Ưu tiên FEFO và cảnh báo chạm mức an toàn</p>
            </div>
            <button
              onClick={() => onNavigate('warehouse')}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 font-semibold"
            >
              Vào Kho Hàng <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {/* Urgent Batches */}
            {urgentBatches.map((batch) => (
              <div
                key={batch.batchId}
                className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-800 dark:text-amber-300">{batch.batchId}</span>
                    <span className="px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-[10px] font-bold">
                      {batch.daysRemaining <= 0 ? 'ĐÃ HẾT HẠN' : `Còn ${batch.daysRemaining} ngày`}
                    </span>
                  </div>
                  <div className="text-slate-700 dark:text-slate-300">SKU: {batch.sku}</div>
                  <div className="text-[10px] text-slate-500">{batch.warehouseLocation}</div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                    {batch.quantityBaseUnits} đơn vị
                  </div>
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Ưu tiên xuất FEFO</div>
                </div>
              </div>
            ))}

            {/* Low stock products */}
            {lowStockProducts.map((prod) => (
              <div
                key={prod.id}
                className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900 dark:text-white truncate max-w-xs">{prod.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">SKU: {prod.sku}</div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-black text-rose-600 dark:text-rose-400 text-sm">
                    {prod.stockBaseUnits} {prod.baseUnit}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Tồn an toàn: {prod.minStockAlert} {prod.baseUnit}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

