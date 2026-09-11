"use client";

import dynamic from "next/dynamic";

const NexusApp = dynamic(() => import("@/components/NexusApp"), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white font-sans">
      <div className="flex flex-col items-center gap-3">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        <p className="text-sm font-medium text-slate-300">Đang tải Quản Lý Đơn Vị Tính...</p>
      </div>
    </div>
  ),
});

export default function DonViTinhPage() {
  return <NexusApp initialView="units" />;
}
