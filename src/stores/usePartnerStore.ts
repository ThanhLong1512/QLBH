import { create } from "zustand";
import { Customer, Supplier } from "@/types/erp";

interface PartnerState {
  customers: Customer[];
  suppliers: Supplier[];
  isLoading: boolean;

  setCustomers: (customers: Customer[]) => void;
  setSuppliers: (suppliers: Supplier[]) => void;
  addCustomer: (customer: Customer) => Promise<boolean>;
  updateCustomer: (customer: Customer) => Promise<boolean>;
  addSupplier: (supplier: Supplier) => Promise<boolean>;
  updateSupplier: (supplier: Supplier) => Promise<boolean>;
}

export const usePartnerStore = create<PartnerState>((set) => ({
  customers: [],
  suppliers: [],
  isLoading: false,

  setCustomers: (customers) => set({ customers }),
  setSuppliers: (suppliers) => set({ suppliers }),

  addCustomer: async (customer) => {
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer),
      });
      const data = await res.json();
      if (data.success && data.data) {
        set((state) => ({ customers: [data.data, ...state.customers] }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("addCustomer error:", err);
      return false;
    }
  },

  updateCustomer: async (customer) => {
    try {
      const res = await fetch("/api/customers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer),
      });
      const data = await res.json();
      if (data.success && data.data) {
        set((state) => ({
          customers: state.customers.map((c) => (c.id === customer.id ? data.data : c)),
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("updateCustomer error:", err);
      return false;
    }
  },

  addSupplier: async (supplier) => {
    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supplier),
      });
      const data = await res.json();
      if (data.success && data.data) {
        set((state) => ({ suppliers: [data.data, ...state.suppliers] }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("addSupplier error:", err);
      return false;
    }
  },

  updateSupplier: async (supplier) => {
    try {
      const res = await fetch("/api/suppliers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supplier),
      });
      const data = await res.json();
      if (data.success && data.data) {
        set((state) => ({
          suppliers: state.suppliers.map((s) => (s.id === supplier.id ? data.data : s)),
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("updateSupplier error:", err);
      return false;
    }
  },
}));
