import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  const isAuth = token === "authenticated";

  const { pathname } = request.nextUrl;

  // Protect /admin
  if (pathname.startsWith("/admin")) {
    if (!isAuth) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Protect write APIs (POST, PUT, DELETE)
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/login") && !pathname.startsWith("/api/logout")) {
    if (request.method !== "GET" && !isAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
