import Link from "next/link";
import { Boxes, ShieldCheck, PhoneCall, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      {/* Top Notification Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800 flex justify-between items-center">
        <div className="container mx-auto flex justify-between items-center">
          <p className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
            <span>NEXUS ERP — Hệ Thống Quản Lý Bán Lẻ & Phân Phối Chuỗi Đa Kênh</span>
          </p>
          <div className="hidden sm:flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <PhoneCall className="h-3 w-3 text-emerald-400" />
              Hotline Hỗ Trợ: (+84) 1900-6868
            </span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-600/30">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <span className="text-slate-950 font-black tracking-tight">NEXUS</span>
              <span className="text-indigo-600 font-black ml-1">ERP</span>
              <span className="text-xs ml-1 px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono font-bold">POS</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/" className="transition-colors hover:text-indigo-600">
              Trang Chủ
            </Link>
            <Link href="/catalog" className="transition-colors hover:text-indigo-600">
              Danh Mục Sản Phẩm
            </Link>
            <Link href="/pos" className="transition-colors hover:text-indigo-600 font-semibold text-indigo-600">
              Quầy POS Bán Hàng
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-semibold shadow-xs">
                <LogIn className="h-4 w-4" />
                Vào Hệ Thống ERP
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-slate-600 text-sm">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Boxes className="h-5 w-5 text-indigo-600" />
            <span className="font-semibold text-slate-800">NEXUS ERP Omnichannel Retail & Distribution</span>
          </div>
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} NEXUS ERP Vietnam. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
