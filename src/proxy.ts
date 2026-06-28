import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
  const isAuthPage = request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup";

  let isAuthenticated = false;
  const sessionCookie = request.cookies.get("better-auth.session_token") || request.cookies.get("__Secure-better-auth.session_token");
  
  if (sessionCookie) {
    try {
      const res = await fetch(new URL("/api/auth/get-session", request.url).toString(), {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      });
      if (res.ok) {
        const data = await res.json();
        isAuthenticated = !!data?.session;
      }
    } catch (e) {
      console.error("Middleware session fetch error:", e);
    }
  }

  if (isDashboard && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard/overview", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
};
