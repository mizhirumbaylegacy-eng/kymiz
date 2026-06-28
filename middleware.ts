import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n";

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
});

// Routes that require authentication
const PROTECTED = /^\/(en\/)?(dashboard|settings|billing)(\/.*)?$/;
// Routes that should redirect authenticated users to dashboard
const AUTH_ROUTES = /^\/(en\/)?(login|register|forgot-password|update-password)(\/.*)?$/;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Track cookies set by Supabase
  let supabaseResponse = NextResponse.next({ request });

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
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — must be called on every request
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect unauthenticated users away from protected routes
  if (PROTECTED.test(pathname) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const res = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  }

  // Redirect authenticated users away from auth pages
  if (AUTH_ROUTES.test(pathname) && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    const res = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  }

  // Apply i18n routing
  const i18nResponse = intlMiddleware(request);

  // Forward Supabase auth cookies to the i18n response
  supabaseResponse.cookies.getAll().forEach((c) => i18nResponse.cookies.set(c));

  return i18nResponse;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
