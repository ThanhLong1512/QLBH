import Link from "next/link";
import { Droplet, ShieldCheck, PhoneCall, LogIn } from "lucide-react";
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
            <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
            <span>Authorized Industrial & Automotive Lubricants Master Distributor</span>
          </p>
          <div className="hidden sm:flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <PhoneCall className="h-3 w-3 text-emerald-400" />
              Hotline B2B: (+84) 1900-6868
            </span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
            <div className="h-9 w-9 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 shadow-sm">
              <Droplet className="h-5 w-5 fill-current" />
            </div>
            <div>
              <span className="text-slate-950 font-black tracking-tight">PETRO</span>
              <span className="text-amber-500 font-black">LUB</span>
              <span className="text-xs ml-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">DMS</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/" className="transition-colors hover:text-amber-600">
              Home
            </Link>
            <Link href="/catalog" className="transition-colors hover:text-amber-600">
              Product Catalog
            </Link>
            <Link href="/catalog#standards" className="transition-colors hover:text-amber-600">
              API / SAE Specs
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800 gap-2">
                <LogIn className="h-4 w-4" />
                Staff CRM Portal
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
            <Droplet className="h-5 w-5 text-amber-500 fill-current" />
            <span className="font-semibold text-slate-800">PetroLub DMS Distribution Network</span>
          </div>
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} PetroLub Lubricants Co., Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
