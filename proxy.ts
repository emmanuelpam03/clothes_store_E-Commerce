import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function proxy(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  let validSession = session;

  // HARD CHECK: user must exist
  if (session?.user?.id) {
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        requirePasswordChange: true,
        passwordChangeDeadline: true,
      },
    });

    if (!userExists) {
      validSession = null;
    } else {
      // Add password change info to session
      if (validSession && validSession.user) {
        (validSession.user as any).requirePasswordChange =
          userExists.requirePasswordChange;
        (validSession.user as any).passwordChangeDeadline =
          userExists.passwordChangeDeadline;
      }
    }
  }

  // Public routes that don't require email verification
  const publicRoutes = ["/login", "/register", "/verify", "/set-password"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Check if user needs to change password (admin-created accounts)
  if (
    validSession &&
    (validSession.user as any).requirePasswordChange &&
    !pathname.startsWith("/set-password")
  ) {
    // Redirect to set-password page (action will handle expired deadline)
    return NextResponse.redirect(new URL("/set-password", request.url));
  }

  // Block logged-in users from login & register
  if (validSession && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If user is logged in but account is deactivated or email is not verified
  // Both conditions require verification to proceed
  const needsVerification =
    validSession &&
    (!validSession.user.active || !validSession.user.emailVerified);

  if (needsVerification) {
    // Allow access to public routes (login, register, verify)
    if (!isPublicRoute) {
      // Redirect to verify page for all other routes
      return NextResponse.redirect(new URL("/verify", request.url));
    }
  }

  // If account is active, email is verified, and trying to access /verify, redirect to home
  if (
    validSession &&
    validSession.user.active &&
    validSession.user.emailVerified &&
    pathname === "/verify"
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!validSession) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (validSession.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (pathname.startsWith("/checkout") || pathname.startsWith("/order")) {
    if (!validSession) {
      return NextResponse.redirect(new URL("/404", request.url));
    }
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
