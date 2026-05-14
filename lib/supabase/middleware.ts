import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // Inject x-pathname into request headers so server components can read it
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request: { headers: requestHeaders },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do not write any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Public routes that don't require auth
  const publicRoutes = [
    "/",
    "/about",
    "/solutions",
    "/products",
    "/growth-infrastructure",
    "/peptide-map",
    "/musclelock",
    "/contact",
    "/request-catalog",
    "/privacy",
    "/terms",
    "/login",
    "/signup",
    "/verify-email",
    "/reset-password",
    "/challenge",
    "/challenge/signup",
    "/challenge/login",
  ];
  const isPublicRoute = publicRoutes.some((route) => pathname === route);
  const isStaticAsset = pathname.startsWith("/musclelock/");
  const isApiRoute = pathname.startsWith("/api/");
  const isWebhook = pathname.startsWith("/api/webhooks/");

  // Allow webhooks, API routes, and static assets through
  if (isWebhook || isApiRoute || isStaticAsset) {
    return supabaseResponse;
  }

  // Helper: build a redirect response that preserves any auth cookies the
  // Supabase client just refreshed onto supabaseResponse. Without copying them
  // over, a session refresh during a redirected request gets lost and the next
  // request looks unauthenticated — causing a login → dashboard → login loop.
  const redirectWithCookies = (url: URL) => {
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  };

  // Redirect unauthenticated users to login
  const isChallengeRoute = pathname.startsWith("/challenge");
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = isChallengeRoute ? "/challenge/login" : "/login";
    url.searchParams.set("redirect", pathname);
    return redirectWithCookies(url);
  }

  // Redirect authenticated users away from auth-only pages
  const authOnlyRedirectRoutes = ["/login", "/signup", "/verify-email"];
  const challengeAuthRoutes = ["/challenge/login", "/challenge/signup"];
  if (user && authOnlyRedirectRoutes.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return redirectWithCookies(url);
  }
  if (user && challengeAuthRoutes.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/challenge/dashboard";
    return redirectWithCookies(url);
  }

  return supabaseResponse;
}
