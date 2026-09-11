import { create } from "zustand";
import { CashShift, CashTransaction } from "@/types/erp";

interface CashflowState {
  shifts: CashShift[];
  transactions: CashTransaction[];
  isLoading: boolean;

  setShifts: (shifts: CashShift[]) => void;
  setTransactions: (transactions: CashTransaction[]) => void;
  createTransaction: (txData: any) => Promise<boolean>;
}

export const useCashflowStore = create<CashflowState>((set) => ({
  shifts: [],
  transactions: [],
  isLoading: false,

  setShifts: (shifts) => set({ shifts }),
  setTransactions: (transactions) => set({ transactions }),

  createTransaction: async (txData) => {
    try {
      const res = await fetch("/api/cashflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(txData),
      });
      const data = await res.json();
      if (data.success && data.data) {
        set((state) => ({ transactions: [data.data, ...state.transactions] }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("createTransaction error:", err);
      return false;
    }
  },
}));
