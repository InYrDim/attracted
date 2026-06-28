import { NextResponse, type NextRequest } from "next/server";

const publicApiPaths = ["/api/forms/", "/api/webhooks/", "/api/track"];
function isPublicApi(pathname: string): boolean {
  return publicApiPaths.some((p) => pathname.startsWith(p));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Auth routes always pass through
  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  // Public API endpoints (webhooks, form submissions, tracking)
  if (isPublicApi(pathname)) return NextResponse.next();

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname === "/invite" ||
    (pathname.startsWith("/api") && !isPublicApi(pathname));
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isOnboardingPage = pathname === "/onboarding";

  let isAuthenticated = false;
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token");

  if (sessionCookie) {
    try {
      const res = await fetch(
        new URL("/api/auth/get-session", request.url).toString(),
        {
          headers: { cookie: request.headers.get("cookie") || "" },
        },
      );
      if (res.ok) {
        const data = await res.json();
        isAuthenticated = !!data?.session;
      }
    } catch (e) {
      console.error("Proxy session fetch error:", e);
    }
  }

  if (isProtected && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthPage && isAuthenticated) {
    // Check onboarding status before redirecting auth pages
    if (sessionCookie) {
      try {
        const bizRes = await fetch(
          new URL("/api/auth/get-business-status", request.url).toString(),
          { headers: { cookie: request.headers.get("cookie") || "" } },
        );
        if (bizRes.ok) {
          const biz = await bizRes.json();
          if (biz.exists && !biz.onboardingCompleted) {
            return NextResponse.redirect(new URL("/onboarding", request.url));
          }
        }
      } catch (e) {
        console.error("Proxy business status error:", e);
      }
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect authenticated users to onboarding if they haven't completed it
  if (isProtected && isAuthenticated && !isOnboardingPage && sessionCookie) {
    try {
      const bizRes = await fetch(
        new URL("/api/auth/get-business-status", request.url).toString(),
        { headers: { cookie: request.headers.get("cookie") || "" } },
      );
      if (bizRes.ok) {
        const biz = await bizRes.json();
        if (biz.exists && !biz.onboardingCompleted) {
          return NextResponse.redirect(new URL("/onboarding", request.url));
        }
      }
    } catch (e) {
      console.error("Proxy business status error:", e);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/:path*",
    "/login",
    "/signup",
    "/invite",
    "/onboarding",
  ],
};
