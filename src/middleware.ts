import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "typeset-dev-secret-change-in-production"
);

const COOKIE_NAME = "typeset-session";

const protectedPaths = ["/dashboard", "/editor", "/builder"];
const adminPaths = ["/admin"];
const authPaths = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  let user: { role?: string } | null = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET);
      user = payload as { role?: string };
    } catch {
      user = null;
    }
  }

  if (authPaths.some((p) => pathname.startsWith(p)) && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (protectedPaths.some((p) => pathname.startsWith(p)) && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (adminPaths.some((p) => pathname.startsWith(p))) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (user.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/editor/:path*",
    "/builder/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
