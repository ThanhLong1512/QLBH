import type { Metadata } from "next";
import { PackageCheck, Filter, ShoppingBag, ShieldCheck, Cpu, Home, Sparkles, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Danh Mục Sản Phẩm Phân Phối - NEXUS ERP",
  description: "Bảng giá và danh mục phân phối sỉ & lẻ: Điện máy, Gia dụng thông minh, Hóa mỹ phẩm và Thiết bị POS chuyên nghiệp.",
};

export const revalidate = 3600; // ISR: 1 hour cache

interface ProductItem {
  id: string;
  name: string;
  sku: string;
  category: "Thiết Bị Số & POS" | "Điện Máy & Công Nghệ" | "Gia Dụng Thông Minh" | "Hóa Mỹ Phẩm";
  tag: string;
  specification: string;
  warranty: string;
  description: string;
  pricePerUnit: string;
}

const mockProducts: ProductItem[] = [
  {
    id: "prod-1",
    name: "Smart TV Crystal UHD 4K 55 inch Samsung",
    sku: "NEX-TV-55UHD",
    category: "Điện Máy & Công Nghệ",
    tag: "Top Seller",
    specification: "4K UHD, HDR10+, Tizen OS",
    warranty: "24 tháng chính hãng",
    description: "Tivi thông minh độ phân giải 4K sắc nét, bảo hành kích hoạt tự động theo Serial/IMEI trên hệ thống NEXUS.",
    pricePerUnit: "11,500,000 đ",
  },
  {
    id: "prod-2",
    name: "Nồi Chiên Không Dầu Điện Tử Philips XXL 7.2L",
    sku: "NEX-AP-PHIL72",
    category: "Gia Dụng Thông Minh",
    tag: "Gia dụng",
    specification: "Dung tích 7.2L, Công nghệ Rapid Air",
    warranty: "12 tháng đổi mới",
    description: "Nồi chiên công suất lớn cho gia đình và nhà hàng, giảm đến 90% lượng mỡ thừa, bảng điều khiển cảm ứng.",
    pricePerUnit: "2,850,000 đ",
  },
  {
    id: "prod-3",
    name: "Máy Quét Mã Vạch 2D Đa Tia Không Dây Bluetooth",
    sku: "NEX-POS-SC2D",
    category: "Thiết Bị Số & POS",
    tag: "Thiết bị POS",
    specification: "Quét mã 1D/2D QR code siêu nhạy",
    warranty: "18 tháng",
    description: "Đầu đọc mã vạch tốc độ cao tích hợp hoàn hảo với hệ thống bán hàng POS và quản lý kho vận NEXUS.",
    pricePerUnit: "1,450,000 đ",
  },
  {
    id: "prod-4",
    name: "Máy In Hóa Đơn Nhiệt K80 Tự Động Cắt Giấy Xprinter",
    sku: "NEX-PRN-K80U",
    category: "Thiết Bị Số & POS",
    tag: "Thiết bị POS",
    specification: "Khổ giấy 80mm, Cổng USB + LAN",
    warranty: "12 tháng",
    description: "Máy in bill nhiệt siêu bền cho thu ngân, in sắc nét logo và mã QR Napas VietQR động theo từng đơn.",
    pricePerUnit: "1,200,000 đ",
  },
  {
    id: "prod-5",
    name: "Thùng Nước Giặt Sinh Học OMO Matic Khử Mùi (4 Can x 3.8kg)",
    sku: "NEX-FMCG-OMO4C",
    category: "Hóa Mỹ Phẩm",
    tag: "Sỉ Thùng",
    specification: "Quy cách: 4 Can/Thùng (15.2kg)",
    warranty: "Hạn dùng 36 tháng",
    description: "Hóa mỹ phẩm phân phối sỉ chính hãng, chiết khấu lũy tiến cho đại lý và cửa hàng tạp hóa bán lẻ.",
    pricePerUnit: "740,000 đ",
  },
  {
    id: "prod-6",
    name: "Tai Nghe Chống Ồn Sony WH-1000XM5 Không Dây",
    sku: "NEX-AUD-XM5BLK",
    category: "Điện Máy & Công Nghệ",
    tag: "Hi-End",
    specification: "Chống ồn chủ động ANC, Pin 30h",
    warranty: "12 tháng chính hãng",
    description: "Tai nghe cao cấp bán lẻ cho phân khúc khách hàng công nghệ, quản lý bảo hành theo Serial duy nhất.",
    pricePerUnit: "6,990,000 đ",
  },
];

export default function CatalogPage() {
  return (
    <div className="container mx-auto px-4 py-10 sm:px-6">
      {/* Catalog Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <Badge className="bg-indigo-100 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300 mb-2 hover:bg-indigo-100">
            Danh Mục Bán Sỉ & Phân Phối
          </Badge>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Danh Mục Sản Phẩm NEXUS ERP</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Hàng chính hãng có sẵn trong kho, quản lý tự động theo Serial/IMEI, Barcode và hỗ trợ bảo hành điện tử.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 text-slate-700 dark:text-slate-200">
            <Filter className="h-4 w-4" />
            Lọc Theo Ngành Hàng
          </Button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProducts.map((p) => (
          <Card key={p.id} className="flex flex-col justify-between border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-2">
                <Badge variant="outline" className="font-mono text-xs border-indigo-200 bg-indigo-50 text-indigo-900 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300">
                  {p.tag}
                </Badge>
                <span className="text-xs font-semibold text-slate-400">{p.sku}</span>
              </div>
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                {p.name}
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                {p.category} &bull; BH: {p.warranty}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 dark:text-slate-300 space-y-2 flex-1">
              <p className="line-clamp-2">{p.description}</p>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Thông số kĩ thuật:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{p.specification}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Giá phân phối:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{p.pricePerUnit}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button size="sm" className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white gap-2">
                <ShoppingBag className="h-3.5 w-3.5" />
                Đặt Hàng Phân Phối
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Technical Standards Bar */}
      <div id="standards" className="mt-14 p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <h2 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Tiêu Chuẩn Quản Lý Kho & Đảm Bảo Chất Lượng
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
          Mọi sản phẩm lưu thông qua NEXUS ERP đều được kiểm soát mã vạch (Barcode), quản lý số sê-ri / IMEI chống hàng giả, tích hợp xuất hóa đơn điện tử VAT và đồng bộ dữ liệu thanh toán VietQR Napas 247 tức thời.
        </p>
      </div>
    </div>
  );
}
