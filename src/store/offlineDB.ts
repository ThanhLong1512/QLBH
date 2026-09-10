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

export class CRMDmsOfflineDatabase extends Dexie {
  offlineOrders!: Table<OfflineOrder, number>;
  cachedProducts!: Table<CachedProduct, string>;

  constructor() {
    super("CRMDmsOfflineDB");
    this.version(1).stores({
      offlineOrders: "++id, clientOrderId, syncStatus, createdAt",
      cachedProducts: "id, sku, viscosity, brand",
    });
  }
}

export const offlineDB = new CRMDmsOfflineDatabase();
