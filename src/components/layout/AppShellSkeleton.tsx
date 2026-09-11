import React from 'react';

export const AppShellSkeleton: React.FC = () => {
  return (
    <div className="h-screen w-screen flex bg-slate-950 text-slate-100 font-sans overflow-hidden select-none">
      {/* SIDEBAR SKELETON */}
      <aside className="w-64 border-r border-slate-800/80 bg-slate-900/90 hidden md:flex flex-col justify-between p-4 shrink-0">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-2 pt-1">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 animate-pulse flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/20">
              N
            </div>
            <div>
              <div className="h-4 w-28 rounded-md bg-slate-700/80 animate-pulse" />
              <div className="h-2.5 w-16 rounded mt-1.5 bg-slate-800 animate-pulse" />
            </div>
          </div>

          {/* Nav Items */}
          <div className="space-y-2 pt-2">
            {[
              { w: 'w-24', active: true },
              { w: 'w-32', active: false },
              { w: 'w-28', active: false },
              { w: 'w-36', active: false },
              { w: 'w-24', active: false },
              { w: 'w-30', active: false },
              { w: 'w-28', active: false }
            ].map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${
                  item.active
                    ? 'bg-indigo-600/15 border-indigo-500/30'
                    : 'border-transparent hover:bg-slate-800/40'
                }`}
              >
                <div className="h-4 w-4 rounded bg-slate-700/60 animate-pulse" />
                <div className={`h-3 ${item.w} rounded bg-slate-700/60 animate-pulse`} />
              </div>
            ))}
          </div>
        </div>

        {/* User Card */}
        <div className="p-3 rounded-xl border border-slate-800 bg-slate-800/40 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-700 animate-pulse" />
          <div className="space-y-1">
            <div className="h-3 w-20 rounded bg-slate-700 animate-pulse" />
            <div className="h-2.5 w-14 rounded bg-slate-800 animate-pulse" />
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT SKELETON */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-slate-800 animate-pulse md:hidden" />
            <div className="h-9 w-64 md:w-80 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center px-3 gap-2">
              <div className="h-3.5 w-3.5 rounded-full bg-slate-700 animate-pulse" />
              <div className="h-3 w-32 rounded bg-slate-700/50 animate-pulse" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-slate-800/80 border border-slate-700/60 animate-pulse" />
            <div className="h-8 w-8 rounded-lg bg-slate-800/80 border border-slate-700/60 animate-pulse" />
            <div className="h-8 w-28 rounded-lg bg-indigo-600/20 border border-indigo-500/30 animate-pulse hidden sm:block" />
          </div>
        </header>

        {/* Body Area */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Breadcrumb & Title */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 w-48 rounded-lg bg-slate-800 animate-pulse" />
              <div className="h-3 w-72 rounded bg-slate-800/60 animate-pulse" />
            </div>
            <div className="h-9 w-32 rounded-xl bg-indigo-600/30 border border-indigo-500/40 animate-pulse hidden sm:block" />
          </div>

          {/* Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="h-3 w-24 rounded bg-slate-800 animate-pulse" />
                  <div className="h-7 w-7 rounded-lg bg-slate-800 animate-pulse" />
                </div>
                <div className="h-7 w-32 rounded-lg bg-slate-700/80 animate-pulse" />
                <div className="h-2.5 w-20 rounded bg-slate-800 animate-pulse" />
              </div>
            ))}
          </div>

          {/* Table Container */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 overflow-hidden space-y-3 p-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
              <div className="h-4 w-36 rounded bg-slate-800 animate-pulse" />
              <div className="h-8 w-48 rounded-lg bg-slate-800/60 animate-pulse" />
            </div>

            <div className="space-y-2.5 pt-2">
              {[1, 2, 3, 4, 5].map((row) => (
                <div
                  key={row}
                  className="h-11 rounded-xl bg-slate-800/30 border border-slate-800/50 flex items-center justify-between px-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded bg-slate-700/60 animate-pulse" />
                    <div className="h-3.5 w-40 rounded bg-slate-700/60 animate-pulse" />
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="h-3.5 w-16 rounded bg-slate-700/60 animate-pulse" />
                    <div className="h-3.5 w-24 rounded bg-slate-700/60 animate-pulse" />
                    <div className="h-6 w-16 rounded-full bg-slate-700/40 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Footer info banner */}
        <footer className="h-9 border-t border-slate-800/80 bg-slate-900/90 px-6 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
            <span>NEXUS ERP v2.6 Enterprise • Khởi tạo siêu tốc IndexedDB</span>
          </div>
          <span className="text-slate-500 font-mono">Đang đồng bộ dữ liệu...</span>
        </footer>
      </div>
    </div>
  );
};
