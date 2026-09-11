import { NextResponse } from "next/server";
import { verifyJWT, JWTPayload } from "@/lib/jwt";
import { PermissionKey, UserRole, ROLE_PERMISSIONS } from "@/types/erp";

export interface ServerUserContext {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  branchId?: string;
  warehouseId?: string;
  employeeId?: string;
  permissions: PermissionKey[];
}

/**
 * Extracts authenticated user context from request headers (forwarded by middleware)
 * or falls back to direct JWT verification.
 */
export async function getCurrentUser(request: Request): Promise<ServerUserContext | null> {
  const headers = request.headers;

  // 1. Check headers enriched by middleware
  const userId = headers.get("x-user-id");
  if (userId) {
    let permissions: PermissionKey[] = [];
    try {
      const rawPerms = headers.get("x-user-permissions");
      if (rawPerms) permissions = JSON.parse(rawPerms);
    } catch {
      // ignore JSON parse error
    }

    const role = (headers.get("x-user-role") as UserRole) || "cashier";
    if (!permissions.length && role) {
      permissions = ROLE_PERMISSIONS[role] || [];
    }

    return {
      userId,
      email: headers.get("x-user-email") || "",
      name: decodeURIComponent(headers.get("x-user-name") || ""),
      role,
      branchId: headers.get("x-user-branch") || undefined,
      warehouseId: headers.get("x-user-warehouse") || undefined,
      employeeId: headers.get("x-user-employee") || undefined,
      permissions,
    };
  }

  // 2. Direct token verification fallback
  const authHeader = headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7).trim()
    : null;

  const cookieHeader = headers.get("cookie");
  let cookieToken: string | null = null;
  if (cookieHeader) {
    const match = cookieHeader.match(/nexus_session=([^;]+)/);
    if (match) cookieToken = match[1];
  }

  const token = bearerToken || cookieToken;
  if (token) {
    const payload = await verifyJWT(token);
    if (payload) {
      return {
        userId: payload.userId,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        branchId: payload.branchId,
        warehouseId: payload.warehouseId,
        employeeId: payload.employeeId,
        permissions: payload.permissions || ROLE_PERMISSIONS[payload.role] || [],
      };
    }
  }

  return null;
}

/**
 * Ensures user is authenticated; returns error response if not.
 */
export async function requireAuth(
  request: Request
): Promise<{ user: ServerUserContext | null; errorResponse: NextResponse | null }> {
  const user = await getCurrentUser(request);
  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Vui lòng đăng nhập để thực hiện thao tác này.",
        },
        { status: 401 }
      ),
    };
  }
  return { user, errorResponse: null };
}

/**
 * Ensures user has the required permission; returns error response if forbidden.
 */
export async function requirePermission(
  request: Request,
  permission: PermissionKey
): Promise<{ user: ServerUserContext | null; errorResponse: NextResponse | null }> {
  const { user, errorResponse } = await requireAuth(request);
  if (errorResponse) return { user: null, errorResponse };

  if (user?.role === "admin") {
    return { user, errorResponse: null };
  }

  const hasPerm = user?.permissions?.includes(permission);
  if (!hasPerm) {
    return {
      user,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: `Forbidden: Bạn không có quyền truy cập chức năng này (${permission}).`,
        },
        { status: 403 }
      ),
    };
  }

  return { user, errorResponse: null };
}
