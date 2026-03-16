import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = await auth();
  const sessionUser = session?.user ?? null;

  // Public routes that don't require email verification
  const publicRoutes = ["/login", "/register", "/verify", "/set-password"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Check if user needs to change password (admin-created accounts)
  if (
    sessionUser &&
    sessionUser.requirePasswordChange &&
    !pathname.startsWith("/set-password")
  ) {
    // Redirect to set-password page (action will handle expired deadline)
    return NextResponse.redirect(new URL("/set-password", request.url));
  }

  // Block logged-in users from login & register
  if (sessionUser && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If user is logged in but account is deactivated or email is not verified
  // Both conditions require verification to proceed
  const needsVerification =
    sessionUser && (!sessionUser.active || !sessionUser.emailVerified);

  if (needsVerification) {
    // Allow access to public routes (login, register, verify)
    if (!isPublicRoute) {
      // Redirect to verify page for all other routes
      return NextResponse.redirect(new URL("/verify", request.url));
    }
  }

  // If account is active, email is verified, and trying to access /verify, redirect to home
  if (
    sessionUser &&
    sessionUser.active &&
    sessionUser.emailVerified &&
    pathname === "/verify"
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!sessionUser) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (sessionUser.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (pathname.startsWith("/checkout") || pathname.startsWith("/order")) {
    if (!sessionUser) {
      const url = request.nextUrl.clone();
      const next = `${pathname}${request.nextUrl.search}`;
      url.pathname = "/login";
      url.searchParams.set("next", next);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
