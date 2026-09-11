import { create } from "zustand";
import { Warehouse, Branch } from "@/types/erp";

interface WarehouseState {
  warehouses: Warehouse[];
  branches: Branch[];
  activeWarehouse: Warehouse | null;
  activeBranch: Branch | null;
  isLoading: boolean;

  // Actions
  setWarehouses: (warehouses: Warehouse[]) => void;
  setBranches: (branches: Branch[]) => void;
  setActiveWarehouse: (warehouse: Warehouse | null) => void;
  setActiveBranch: (branch: Branch | null) => void;
  fetchWarehouses: () => Promise<void>;
  fetchBranches: () => Promise<void>;
  createWarehouse: (data: Partial<Warehouse>) => Promise<Warehouse | null>;
  createBranch: (data: Partial<Branch>) => Promise<Branch | null>;
}

export const useWarehouseStore = create<WarehouseState>((set, get) => ({
  warehouses: [],
  branches: [],
  activeWarehouse: null,
  activeBranch: null,
  isLoading: false,

  setWarehouses: (warehouses) => {
    set({ warehouses });
    if (!get().activeWarehouse && warehouses.length > 0) {
      const defaultWh = warehouses.find((w) => w.isDefault) || warehouses[0];
      set({ activeWarehouse: defaultWh });
    }
  },

  setBranches: (branches) => {
    set({ branches });
    if (!get().activeBranch && branches.length > 0) {
      set({ activeBranch: branches[0] });
    }
  },

  setActiveWarehouse: (activeWarehouse) => set({ activeWarehouse }),
  setActiveBranch: (activeBranch) => set({ activeBranch }),

  fetchWarehouses: async () => {
    try {
      set({ isLoading: true });
      const res = await fetch("/api/warehouses");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          get().setWarehouses(json.data);
        }
      }
    } catch (err) {
      console.error("fetchWarehouses error:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchBranches: async () => {
    try {
      set({ isLoading: true });
      const res = await fetch("/api/branches");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          get().setBranches(json.data);
        }
      }
    } catch (err) {
      console.error("fetchBranches error:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  createWarehouse: async (data) => {
    try {
      const res = await fetch("/api/warehouses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const newWh = json.data;
        set((state) => ({ warehouses: [...state.warehouses, newWh] }));
        return newWh;
      }
      return null;
    } catch (err) {
      console.error("createWarehouse error:", err);
      return null;
    }
  },

  createBranch: async (data) => {
    try {
      const res = await fetch("/api/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const newBr = json.data;
        set((state) => ({ branches: [...state.branches, newBr] }));
        return newBr;
      }
      return null;
    } catch (err) {
      console.error("createBranch error:", err);
      return null;
    }
  },
}));
