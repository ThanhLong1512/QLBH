import Link from "next/link";
import { Droplet, LayoutDashboard, ShoppingCart, Truck, Database, LogOut, UserCheck } from "lucide-react";
import { OfflineBanner } from "@/components/features/OfflineBanner";
import { Badge } from "@/components/ui/badge";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      {/* Offline sync banner alert */}
      <OfflineBanner />

      <div className="flex flex-1">
        {/* CRM / DMS Sidebar */}
        <aside className="w-64 bg-slate-900 text-slate-200 hidden md:flex flex-col justify-between border-r border-slate-800">
          <div>
            {/* Brand */}
            <div className="p-5 border-b border-slate-800 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold shadow">
                <Droplet className="h-5 w-5 fill-current" />
              </div>
              <div>
                <span className="font-extrabold text-white tracking-wide">PETRO</span>
                <span className="text-amber-400 font-extrabold">LUB</span>
                <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                  DMS Enterprise
                </span>
              </div>
            </div>

            {/* Nav Menu */}
            <nav className="p-4 space-y-1.5 text-sm font-medium">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <LayoutDashboard className="h-4 w-4 text-amber-400" />
                <span>Executive Dashboard</span>
              </Link>
              <Link
                href="/sales"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <ShoppingCart className="h-4 w-4 text-emerald-400" />
                <span>Sales & Offline Orders</span>
              </Link>
              <Link
                href="/fleet"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <Truck className="h-4 w-4 text-blue-400" />
                <span>Fleet & GPS Dispatch</span>
              </Link>
            </nav>
          </div>

          {/* User Profile Footer */}
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Nguyen Van Minh</p>
                  <Badge variant="secondary" className="text-[10px] bg-slate-800 text-slate-300 hover:bg-slate-800 px-1.5 py-0">
                    SALES_REP
                  </Badge>
                </div>
              </div>
              <Link href="/" title="Back to Public Site">
                <LogOut className="h-4 w-4 text-slate-400 hover:text-white" />
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">
                DMS Node: HCMC-WH01
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">
                Automotive & Industrial Lubricant Supply Division
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
              <span className="flex items-center gap-1.5 text-emerald-600">
                <Database className="h-3.5 w-3.5" />
                Supabase & Dexie Online
              </span>
            </div>
          </header>

          {/* Subpage Container */}
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
