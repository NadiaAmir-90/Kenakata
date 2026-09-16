// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = ["/checkout", "/profile", "/account"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const isProtected = PROTECTED_PATHS.some((p) => request.nextUrl.pathname.startsWith(p));

  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/checkout/:path*", "/profile/:path*", "/account/:path*"],
};