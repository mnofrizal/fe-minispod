import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Allow access to auth pages and API routes
    if (
      pathname.startsWith("/auth/") ||
      pathname.startsWith("/api/auth/") ||
      pathname === "/"
    ) {
      return NextResponse.next();
    }

    // Check if user is trying to access dashboard routes
    if (pathname.startsWith("/dashboard")) {
      // If no token, redirect to login
      if (!token) {
        const loginUrl = new URL("/auth/login", req.url);
        return NextResponse.redirect(loginUrl);
      }

      // Check if token is marked as invalid (from our JWT callback)
      if (token.isValid === false) {
        const loginUrl = new URL("/auth/login", req.url);
        return NextResponse.redirect(loginUrl);
      }

      // Check if user is inactive
      if (token.isActive === false) {
        const loginUrl = new URL("/auth/login", req.url);
        return NextResponse.redirect(loginUrl);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow access to public routes
        if (
          pathname.startsWith("/auth/") ||
          pathname.startsWith("/api/auth/") ||
          pathname === "/"
        ) {
          return true;
        }

        // For dashboard routes, require valid token
        if (pathname.startsWith("/dashboard")) {
          return !!token && token.isValid !== false && token.isActive !== false;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
