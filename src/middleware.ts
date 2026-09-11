import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";

// Public API endpoints that do not require authentication
const PUBLIC_API_ROUTES = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/health",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only intercept /api/* routes
  if (pathname.startsWith("/api/")) {
    // Check if the current route is public
    const isPublic = PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route));
    if (isPublic) {
      return NextResponse.next();
    }

    // Extract token from cookie or Authorization header
    const cookieToken = request.cookies.get("nexus_session")?.value;
    const authHeader = request.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7).trim()
      : null;

    const token = cookieToken || bearerToken;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Thiếu phiên đăng nhập hợp lệ. Vui lòng đăng nhập để tiếp tục.",
        },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);

    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.",
        },
        { status: 401 }
      );
    }

    // Forward enriched user identity in request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.userId);
    requestHeaders.set("x-user-email", payload.email);
    requestHeaders.set("x-user-name", encodeURIComponent(payload.name));
    requestHeaders.set("x-user-role", payload.role);
    if (payload.branchId) requestHeaders.set("x-user-branch", payload.branchId);
    if (payload.warehouseId) requestHeaders.set("x-user-warehouse", payload.warehouseId);
    if (payload.employeeId) requestHeaders.set("x-user-employee", payload.employeeId);
    requestHeaders.set("x-user-permissions", JSON.stringify(payload.permissions));

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
