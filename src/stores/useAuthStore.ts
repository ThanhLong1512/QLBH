import { create } from "zustand";
import { AuthUser, UserRole, PermissionKey, ROLE_PERMISSIONS, ROLE_CONFIG } from "@/types/erp";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  role: UserRole;
  permissions: PermissionKey[];
  isLoading: boolean;

  // Actions
  setUser: (user: AuthUser | null) => void;
  setRole: (role: UserRole) => void;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => Promise<boolean>;
  hasPermission: (permission: PermissionKey) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  role: "admin",
  permissions: ROLE_PERMISSIONS.admin,
  isLoading: true,

  setUser: (user) => {
    if (user) {
      const perms = ROLE_PERMISSIONS[user.role] || [];
      set({
        user,
        role: user.role,
        permissions: perms,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      set({
        user: null,
        role: "cashier",
        permissions: [],
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  setRole: (newRole) => {
    const current = get().user;
    if (current) {
      const updated: AuthUser = {
        ...current,
        role: newRole,
        roleTitle: ROLE_CONFIG[newRole]?.title || newRole,
      };
      set({
        user: updated,
        role: newRole,
        permissions: ROLE_PERMISSIONS[newRole] || [],
      });
    } else {
      set({ role: newRole, permissions: ROLE_PERMISSIONS[newRole] || [] });
    }
    if (typeof document !== "undefined") {
      document.cookie = `nexus_demo_role=${newRole}; path=/; max-age=604800; SameSite=Lax`;
    }
  },

  login: async (email, pass) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        const u = data.data;
        const user: AuthUser = {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone || "",
          role: u.role,
          roleTitle: u.roleTitle,
          businessName: u.businessName || "Tập Đoàn Bán Lẻ & Phân Phối NEXUS",
          businessScale: u.businessScale,
          branchId: u.branchId,
          warehouseId: u.warehouseId,
          employeeId: u.employeeId,
          employeeCode: u.employeeCode,
        };

        const perms: PermissionKey[] = u.permissions || ROLE_PERMISSIONS[u.role as UserRole] || [];

        set({
          user,
          token: data.token || null,
          role: user.role,
          permissions: perms,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error("AuthStore login error:", err);
      return false;
    }
  },

  logout: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      role: "cashier",
      permissions: [],
      isLoading: false,
    });
  },

  checkSession: async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          const u = data.data;
          const user: AuthUser = {
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone || "",
            role: u.role,
            roleTitle: u.roleTitle,
            businessName: u.businessName,
            businessScale: u.businessScale,
            branchId: u.branchId,
            warehouseId: u.warehouseId,
            employeeId: u.employeeId,
            employeeCode: u.employeeCode,
          };
          const perms = u.permissions || ROLE_PERMISSIONS[u.role as UserRole] || [];
          set({
            user,
            role: user.role,
            permissions: perms,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        }
      }
    } catch (err) {
      // ignore fetch error
    }
    set({ isLoading: false });
    return false;
  },

  hasPermission: (permission) => {
    const { role, permissions } = get();
    if (role === "admin") return true;
    return permissions.includes(permission);
  },
}));
