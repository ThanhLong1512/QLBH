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
