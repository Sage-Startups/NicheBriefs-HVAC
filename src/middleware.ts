import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const publicPaths = ["/", "/sign-in", "/sign-up", "/terms", "/privacy", "/api/auth", "/api/webhooks"];
  const isPublic = publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (isLoggedIn && (pathname === "/sign-in" || pathname === "/sign-up")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
