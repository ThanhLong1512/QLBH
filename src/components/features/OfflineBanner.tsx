"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { WifiOff, RefreshCw, CheckCircle2, ArrowUpRight } from "lucide-react";
import { offlineDB, syncOfflineOrders } from "@/store/offlineDB";

function subscribeOnline(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

export function OfflineBanner() {
  const browserOnline = useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true
  );

  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<string | null>(null);

  const isOnline = browserOnline;

  const refreshPending = async () => {
    try {
      const count = await offlineDB.offlineOrders
        .where("syncStatus")
        .equals("PENDING")
        .count();
      setPendingCount(count);
    } catch {
      // Dexie might be busy
    }
  };

  useEffect(() => {
    let active = true;

    refreshPending();
    const interval = setInterval(() => {
      if (active) refreshPending();
    }, 3000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Automatic sync when connection is restored
  useEffect(() => {
    if (isOnline && pendingCount > 0 && !isSyncing) {
      handleSync();
    }
  }, [isOnline, pendingCount]);

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setLastSyncResult(null);

    try {
      const result = await syncOfflineOrders();
      await refreshPending();
      if (result.syncedCount > 0) {
        setLastSyncResult(`Đã đồng bộ ${result.syncedCount} đơn hàng thành công!`);
        setTimeout(() => setLastSyncResult(null), 4000);
      }
    } catch (err) {
      console.error("Lỗi đồng bộ offline:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isOnline && pendingCount === 0 && !lastSyncResult) return null;

  return (
    <aside
      aria-label="Offline status"
      className={`w-full px-4 py-2 text-xs font-semibold flex flex-wrap items-center justify-between gap-2 shadow-sm transition-colors z-40 ${
        !isOnline
          ? "bg-amber-500 text-amber-950"
          : pendingCount > 0
          ? "bg-indigo-600 text-white"
          : "bg-emerald-600 text-white"
      }`}
    >
      <div className="flex items-center gap-2">
        {!isOnline ? (
          <>
            <WifiOff className="h-4 w-4 shrink-0 animate-pulse" />
            <span>
              Đang hoạt động ở chế độ <strong>Mất Mạng (Offline)</strong>. Đơn hàng mới tại quầy POS sẽ được lưu an toàn vào hàng đợi IndexedDB trên thiết bị.
            </span>
          </>
        ) : pendingCount > 0 ? (
          <>
            <RefreshCw className={`h-4 w-4 shrink-0 ${isSyncing ? "animate-spin" : ""}`} />
            <span>
              Đã khôi phục kết nối! Có <strong>{pendingCount}</strong> đơn hàng offline đang chờ tự động đồng bộ lên máy chủ.
            </span>
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4 shrink-0 text-white" />
            <span>{lastSyncResult || "Hàng đợi offline đã được đồng bộ hoàn toàn với máy chủ!"}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {pendingCount > 0 && (
          <span className="bg-black/20 px-2 py-0.5 rounded text-[11px] font-mono">
            Hàng đợi: {pendingCount} đơn
          </span>
        )}

        {isOnline && pendingCount > 0 && (
          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing}
            className="px-2.5 py-1 rounded bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Đang đồng bộ..." : "Đồng Bộ Ngay"}</span>
          </button>
        )}
      </div>
    </aside>
  );
}
