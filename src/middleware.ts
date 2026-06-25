import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  }).catch(() => null);

  const isLoggedIn = !!token;
  const { pathname } = req.nextUrl;

  const publicPaths = ["/", "/sign-in", "/sign-up", "/demo", "/terms", "/privacy", "/api/auth", "/api/webhooks"];
  const isPublic = publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (isLoggedIn && (pathname === "/sign-in" || pathname === "/sign-up" || pathname === "/demo")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
