import { create } from "zustand";
import { Order } from "@/types/erp";

interface OrderState {
  orders: Order[];
  isLoading: boolean;

  setOrders: (orders: Order[]) => void;
  createOrder: (orderData: any) => Promise<Order | null>;
  updateOrderStatus: (id: string, status: string) => Promise<boolean>;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  isLoading: false,

  setOrders: (orders) => set({ orders }),

  createOrder: async (orderData) => {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      const data = await res.json();
      if (data.success && data.data) {
        set((state) => ({ orders: [data.data, ...state.orders] }));
        return data.data;
      }
      return null;
    } catch (err) {
      console.error("createOrder error:", err);
      return null;
    }
  },

  updateOrderStatus: async (id, status) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? data.data : o)),
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("updateOrderStatus error:", err);
      return false;
    }
  },
}));
