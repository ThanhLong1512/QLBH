import { create } from "zustand";
import {
  StockBalance,
  StockLedger,
  StockInboundReceipt,
  StockOutboundReceipt,
  StocktakeReport,
  WarehouseTransfer,
} from "@/types/erp";

interface InventoryState {
  stockBalances: StockBalance[];
  stockLedgers: StockLedger[];
  inbounds: StockInboundReceipt[];
  outbounds: StockOutboundReceipt[];
  stocktakes: StocktakeReport[];
  transfers: WarehouseTransfer[];
  isLoading: boolean;

  setStockBalances: (balances: StockBalance[]) => void;
  setStockLedgers: (ledgers: StockLedger[]) => void;
  setInbounds: (inbounds: StockInboundReceipt[]) => void;
  setOutbounds: (outbounds: StockOutboundReceipt[]) => void;
  setStocktakes: (stocktakes: StocktakeReport[]) => void;
  setTransfers: (transfers: WarehouseTransfer[]) => void;

  fetchLedger: (params?: { productId?: string; warehouseId?: string }) => Promise<void>;
  fetchBalances: (warehouseId?: string) => Promise<void>;
  addInbound: (receipt: any) => Promise<boolean>;
  addOutbound: (receipt: any) => Promise<boolean>;
  addStocktake: (report: any) => Promise<boolean>;
  addTransfer: (transfer: any) => Promise<boolean>;
  updateTransferStatus: (transferId: string, status: string, receiverName?: string) => Promise<boolean>;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  stockBalances: [],
  stockLedgers: [],
  inbounds: [],
  outbounds: [],
  stocktakes: [],
  transfers: [],
  isLoading: false,

  setStockBalances: (stockBalances) => set({ stockBalances }),
  setStockLedgers: (stockLedgers) => set({ stockLedgers }),
  setInbounds: (inbounds) => set({ inbounds }),
  setOutbounds: (outbounds) => set({ outbounds }),
  setStocktakes: (stocktakes) => set({ stocktakes }),
  setTransfers: (transfers) => set({ transfers }),

  fetchLedger: async (params) => {
    try {
      const url = new URL("/api/inventory/ledger", window.location.origin);
      if (params?.productId) url.searchParams.set("productId", params.productId);
      if (params?.warehouseId) url.searchParams.set("warehouseId", params.warehouseId);

      const res = await fetch(url.toString());
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.ledgers) {
          set({ stockLedgers: json.data.ledgers });
        }
      }
    } catch (err) {
      console.error("fetchLedger error:", err);
    }
  },

  fetchBalances: async (warehouseId) => {
    try {
      const url = new URL("/api/inventory/balances", window.location.origin);
      if (warehouseId) url.searchParams.set("warehouseId", warehouseId);

      const res = await fetch(url.toString());
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          set({ stockBalances: json.data });
        }
      }
    } catch (err) {
      console.error("fetchBalances error:", err);
    }
  },

  addInbound: async (receipt) => {
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "inbound", ...receipt }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        set((state) => ({ inbounds: [data.data, ...state.inbounds] }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("addInbound error:", err);
      return false;
    }
  },

  addOutbound: async (receipt) => {
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "outbound", ...receipt }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        set((state) => ({ outbounds: [data.data, ...state.outbounds] }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("addOutbound error:", err);
      return false;
    }
  },

  addStocktake: async (report) => {
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stocktake", ...report }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        set((state) => ({ stocktakes: [data.data, ...state.stocktakes] }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("addStocktake error:", err);
      return false;
    }
  },

  addTransfer: async (transfer) => {
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "transfer", ...transfer }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        set((state) => ({ transfers: [data.data, ...state.transfers] }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("addTransfer error:", err);
      return false;
    }
  },

  updateTransferStatus: async (transferId, status, receiverName) => {
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_transfer_status", transferId, status, receiverName }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        set((state) => ({
          transfers: state.transfers.map((t) => (t.id === transferId ? data.data : t)),
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("updateTransferStatus error:", err);
      return false;
    }
  },
}));
