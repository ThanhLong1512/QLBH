import type { Metadata } from "next";
import Link from "next/link";
import { Boxes, ShieldCheck, QrCode, TrendingDown, ArrowRight, CheckCircle2, ShieldAlert, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "NEXUS ERP - Nền Tảng Quản Trị Bán Lẻ & Phân Phối Đa Kênh Toàn Diện",
  description: "Giải pháp ERP toàn diện: POS quầy bán hàng, VietQR 0đ Napas, quản trị công nợ & tuổi nợ B2B, Credit Guard chống bán lỗ, tồn kho đa đơn vị tính.",
  keywords: ["NEXUS ERP", "POS bán lẻ", "quản lý công nợ", "tuổi nợ", "VietQR 0đ", "quản lý kho", "chống bán lỗ"],
};

export const revalidate = 3600; // ISR: 1 hour cache

export default function LandingPage() {
  const featuredProducts = [
    {
      name: "Smart Tivi Samsung 43 inch Crystal UHD 4K",
      category: "Điện Máy",
      sku: "DM-SAM-43CU8000",
      price: "7,650,000 đ",
      unit: "Chiếc",
      badge: "Bán Chạy Nhất",
    },
    {
      name: "Tai Nghe True Wireless Sony WF-1000XM5",
      category: "Thiết Bị Công Nghệ",
      sku: "DM-SONY-WF1000XM5",
      price: "4,850,000 đ",
      unit: "Cái",
      badge: "Công Nghệ Cao Cấp",
    },
    {
      name: "Bộ Nồi Inox 5 Đáy Sunhouse SHD300",
      category: "Gia Dụng",
      sku: "GD-SUNHOUSE-SHD300",
      price: "720,000 đ",
      unit: "Bộ",
      badge: "Gia Đình Ưa Chuộng",
    },
    {
      name: "Nước Giặt OMO Matic Chuyên Dụng Can 5L",
      category: "Hóa Mỹ Phẩm",
      sku: "HMP-OMO-MATIC-5L",
      price: "865,000 đ",
      unit: "Thùng (4 Can)",
      badge: "Đại Lý Sỉ & Lẻ",
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 py-20 px-4 text-white sm:px-6 lg:py-28">
        <div className="container mx-auto max-w-5xl text-center">
          <Badge variant="outline" className="mb-4 border-indigo-400/50 text-indigo-300 px-3 py-1 font-semibold">
            Nền Tảng ERP Chuyên Biệt Cho Chuỗi Bán Lẻ & Phân Phối Đa Kênh
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-slate-100">
            Hệ Thống Quản Trị <span className="text-indigo-400">NEXUS ERP</span> Toàn Diện
          </h1>
          <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Vận hành POS quầy thu ngân tốc độ cao, thanh toán VietQR động 0đ chuẩn Napas 247, kiểm soát trần công nợ Credit Guard và báo cáo phân tích tuổi nợ minh bạch từng hóa đơn.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pos">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 shadow-lg shadow-indigo-600/30">
                Mở Quầy POS Bán Hàng
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-800">
                Khám Phá Cổng Quản Trị ERP
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-indigo-100 text-indigo-700 rounded-2xl">
                <QrCode className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">POS & VietQR 0đ Napas</h3>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                  Tự động sinh mã QR đúng số tài khoản và số tiền, khớp lệnh tức thời qua cổng Napas 247 mà không tốn phí thuê bên thứ 3.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-3 bg-rose-100 text-rose-700 rounded-2xl">
                <TrendingDown className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Công Nợ & Tuổi Nợ Khớp Đơn</h3>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                  Quản trị 4 phân nhóm tuổi nợ (0-30, 31-60, 61-90, &gt;90 ngày). Từng đồng dư nợ đều có sổ hóa đơn giải trình chi tiết, không số ảo.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Credit Guard & Chống Bán Lỗ</h3>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                  Tự động khóa đơn khi khách vượt trần nợ hoặc bán dưới giá vốn, mở khóa trơn tru qua mã PIN hoặc phê duyệt quản lý tức thời.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Preview */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
            <div>
              <span className="text-indigo-600 text-sm font-semibold tracking-wider uppercase">Hàng Hóa Tiêu Biểu</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                Danh Mục Sản Phẩm Đang Phân Phối
              </h2>
            </div>
            <Link href="/catalog">
              <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700 gap-1 p-0 font-semibold">
                Xem Tất Cả Sản Phẩm <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((prod, idx) => (
              <Card key={idx} className="hover:shadow-md transition-shadow border-slate-200">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-800 border-indigo-200 text-xs font-semibold">
                      {prod.category}
                    </Badge>
                    <span className="text-[11px] font-medium text-slate-400">{prod.badge}</span>
                  </div>
                  <CardTitle className="text-base font-bold text-slate-900 mt-2 leading-snug">
                    {prod.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 font-mono">
                    SKU: {prod.sku}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 text-xs text-slate-600 space-y-2">
                  <div className="flex justify-between items-center text-slate-900">
                    <span className="text-slate-500">Đơn vị:</span>
                    <span className="font-semibold">{prod.unit}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-900 font-mono font-bold text-sm">
                    <span className="text-slate-500 font-normal text-xs font-sans">Giá bán lẻ:</span>
                    <span className="text-indigo-600">{prod.price}</span>
                  </div>
                  <div className="pt-2 flex items-center gap-1 text-emerald-700 border-t border-slate-100 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Sẵn sàng xuất kho tức thì</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
