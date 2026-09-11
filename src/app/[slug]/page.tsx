"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { getViewFromSlug } from "@/lib/routes";
import { AppShellSkeleton } from "@/components/layout/AppShellSkeleton";

const NexusApp = dynamic(() => import("@/components/NexusApp"), {
  ssr: false,
  loading: () => <AppShellSkeleton />,
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
