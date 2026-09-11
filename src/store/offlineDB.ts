import Dexie, { type Table } from "dexie";

export interface OfflineOrder {
  id?: number;
  clientOrderId: string; // UUID generated locally on device
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: {
    productId: string;
    productName: string;
    viscosity: string;
    volume: string;
    quantity: number;
    unitPrice: number;
  }[];
  totalAmount: number;
  notes?: string;
  createdAt: string;
  syncStatus: "PENDING" | "SYNCING" | "SYNCED" | "FAILED";
  lastSyncAttempt?: string;
  payload?: any;
}

export interface CachedProduct {
  id: string;
  name: string;
  sku: string;
  brand: string;
  viscosity: string;
  volume: string;
  stockQty: number;
  price: number;
  cachedAt: string;
}

export interface SystemCacheItem {
  key: string;
  data: any;
  updatedAt: number;
}

export class CRMDmsOfflineDatabase extends Dexie {
  offlineOrders!: Table<OfflineOrder, number>;
  cachedProducts!: Table<CachedProduct, string>;
  systemCache!: Table<SystemCacheItem, string>;

  constructor() {
    super("CRMDmsOfflineDB");
    this.version(1).stores({
      offlineOrders: "++id, clientOrderId, syncStatus, createdAt",
      cachedProducts: "id, sku, viscosity, brand",
    });
    this.version(2).stores({
      offlineOrders: "++id, clientOrderId, syncStatus, createdAt",
      cachedProducts: "id, sku, viscosity, brand",
      systemCache: "key, updatedAt",
    });
  }
}

export const offlineDB = new CRMDmsOfflineDatabase();

export async function getCachedData<T>(key: string): Promise<T | null> {
  if (typeof window === "undefined") return null;
  try {
    const item = await offlineDB.systemCache.get(key);
    if (item && item.data) return item.data as T;
  } catch {
    // Fallback to localStorage
  }
  try {
    const saved = localStorage.getItem(`crm_cache_${key}`);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export async function setCachedData<T>(key: string, data: T): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    await offlineDB.systemCache.put({ key, data, updatedAt: Date.now() });
  } catch {
    // Fallback to localStorage
  }
  try {
    localStorage.setItem(`crm_cache_${key}`, JSON.stringify(data));
  } catch {}
}

/**
 * Genuine Offline Queue Sync Engine
 * Iterates through PENDING orders in Dexie IndexedDB and pushes to /api/orders
 */
export async function syncOfflineOrders(): Promise<{ syncedCount: number; errorCount: number }> {
  if (typeof window === "undefined") return { syncedCount: 0, errorCount: 0 };
  try {
    const pending = await offlineDB.offlineOrders
      .where("syncStatus")
      .equals("PENDING")
      .toArray();

    if (!pending || pending.length === 0) {
      return { syncedCount: 0, errorCount: 0 };
    }

    let syncedCount = 0;
    let errorCount = 0;

    for (const item of pending) {
      if (!item.id) continue;
      await offlineDB.offlineOrders.update(item.id, { syncStatus: "SYNCING" });

      try {
        const payload = item.payload || {
          code: `DH-OFFLINE-${item.id}`,
          customerName: item.customerName,
          customerPhone: item.customerPhone,
          totalAmount: item.totalAmount,
          items: item.items.map((i) => ({
            productId: i.productId,
            name: i.productName,
            sku: "OFFLINE",
            selectedUnit: i.volume || "Cái",
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            totalPrice: i.quantity * i.unitPrice,
          })),
        };

        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          await offlineDB.offlineOrders.update(item.id, {
            syncStatus: "SYNCED",
            lastSyncAttempt: new Date().toISOString(),
          });
          syncedCount++;
        } else {
          await offlineDB.offlineOrders.update(item.id, {
            syncStatus: "PENDING",
            lastSyncAttempt: new Date().toISOString(),
          });
          errorCount++;
        }
      } catch {
        await offlineDB.offlineOrders.update(item.id, {
          syncStatus: "PENDING",
          lastSyncAttempt: new Date().toISOString(),
        });
        errorCount++;
      }
    }

    return { syncedCount, errorCount };
  } catch (err) {
    console.error("Offline sync error:", err);
    return { syncedCount: 0, errorCount: 0 };
  }
}
