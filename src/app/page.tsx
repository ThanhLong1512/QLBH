"use client";

import dynamic from "next/dynamic";
import { AppShellSkeleton } from "@/components/layout/AppShellSkeleton";

const NexusApp = dynamic(() => import("@/components/NexusApp"), {
  ssr: false,
  loading: () => <AppShellSkeleton />,
});

export default function HomePage() {
  return <NexusApp initialView="dashboard" />;
}
