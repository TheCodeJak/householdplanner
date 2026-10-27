import { auth } from "@/lib/auth";
import { guardRedirect } from "@/lib/routeGuard";
import { NextResponse } from "next/server";

// Die Regeln, wer wohin darf (Login, Onboarding, Dashboard), stehen in
// lib/routeGuard.ts.
export default auth((req) => {
  const target = guardRedirect({
    pathname: req.nextUrl.pathname,
    isLoggedIn: !!req.auth,
    hasFamily: !!req.auth?.user?.familyId,
  });

  if (target) return NextResponse.redirect(new URL(target, req.url));
});

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/onboarding",
    "/onboarding/:path*",
    "/dashboard/:path*",
    "/calendar/:path*",
    "/statistics/:path*",
    "/profile/:path*",
  ],
};
