import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/auth"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow static files
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon") || pathname.endsWith(".png") || pathname.endsWith(".svg") || pathname.endsWith(".mp4") || pathname.endsWith(".gif")) {
    return NextResponse.next();
  }

  // Check session cookie
  const session = request.cookies.get("rohu-session");
  if (!session?.value) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Basic token validation (full validation happens server-side)
  try {
    const decoded = Buffer.from(session.value, "base64").toString();
    const parts = decoded.split(":");
    if (parts.length < 3) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const timestamp = parseInt(parts[1]);
    const age = Date.now() - timestamp;
    if (age > 7 * 24 * 60 * 60 * 1000) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
