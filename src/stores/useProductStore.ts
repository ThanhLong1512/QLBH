import { create } from "zustand";
import { Product, ProductBatch, SerialItem } from "@/types/erp";

interface ProductState {
  products: Product[];
  batches: ProductBatch[];
  serials: SerialItem[];
  isLoading: boolean;

  setProducts: (products: Product[]) => void;
  setBatches: (batches: ProductBatch[]) => void;
  setSerials: (serials: SerialItem[]) => void;
  addProduct: (product: Product) => Promise<boolean>;
  updateProduct: (product: Product) => Promise<boolean>;
  deleteProduct: (productId: string) => Promise<boolean>;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  batches: [],
  serials: [],
  isLoading: false,

  setProducts: (products) => set({ products }),
  setBatches: (batches) => set({ batches }),
  setSerials: (serials) => set({ serials }),

  addProduct: async (product) => {
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      const data = await res.json();
      if (data.success && data.data) {
        set((state) => ({ products: [data.data, ...state.products] }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("addProduct error:", err);
      return false;
    }
  },

  updateProduct: async (product) => {
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      const data = await res.json();
      if (data.success && data.data) {
        set((state) => ({
          products: state.products.map((p) => (p.id === product.id ? data.data : p)),
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("updateProduct error:", err);
      return false;
    }
  },

  deleteProduct: async (productId) => {
    try {
      const res = await fetch(`/api/products?id=${productId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        set((state) => ({
          products: state.products.filter((p) => p.id !== productId),
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("deleteProduct error:", err);
      return false;
    }
  },
}));
