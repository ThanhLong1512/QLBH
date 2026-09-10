"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { offlineDB } from "@/store/offlineDB";

function subscribeOnline(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

export function OfflineBanner() {
  const isOnline = useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true
  );

  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    let active = true;

    const checkPending = async () => {
      try {
        const count = await offlineDB.offlineOrders
          .where("syncStatus")
          .equals("PENDING")
          .count();
        if (active) {
          setPendingCount(count);
        }
      } catch {
        // Dexie might not be ready or empty
      }
    };

    checkPending();
    const interval = setInterval(checkPending, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  if (isOnline && pendingCount === 0) return null;

  return (
    <aside
      aria-label="Offline status"
      className={`w-full px-4 py-2 text-sm flex items-center justify-between transition-colors ${
        !isOnline
          ? "bg-amber-500 text-amber-950 font-medium"
          : "bg-blue-600 text-white"
      }`}
    >
      <div className="flex items-center gap-2">
        {!isOnline ? (
          <>
            <WifiOff className="h-4 w-4" />
            <span>
              You are currently working <strong>Offline</strong>. New orders will be stored locally in IndexedDB.
            </span>
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>
              Connection restored! {pendingCount} offline order(s) pending automatic sync.
            </span>
          </>
        )}
      </div>
      {pendingCount > 0 && (
        <span className="bg-black/20 px-2 py-0.5 rounded text-xs">
          Queue: {pendingCount}
        </span>
      )}
    </aside>
  );
}
