"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { getViewFromSlug } from "@/lib/routes";

const NexusApp = dynamic(() => import("@/components/NexusApp"), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white font-sans">
      <div className="flex flex-col items-center gap-3">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        <p className="text-sm font-medium text-slate-300">Đang tải NEXUS ERP...</p>
      </div>
    </div>
  ),
});

export default function SlugRoutePage() {
  const params = useParams();
  const rawSlug = (params?.slug as string) || "";
  let decodedSlug = "";
  try {
    decodedSlug = decodeURIComponent(rawSlug).toLowerCase();
  } catch {
    decodedSlug = rawSlug.toLowerCase();
  }
  const initialView = getViewFromSlug(decodedSlug);

  return <NexusApp initialView={initialView} />;
}
