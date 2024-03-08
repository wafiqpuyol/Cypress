import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { auth } = createMiddlewareClient({ req, res });

  const { data } = await auth.getUser();

  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    if (!data.user) return NextResponse.redirect(new URL("/login", req.url));
  }
  if (["/login", "/signup"].includes(req.nextUrl.pathname)) {
    if (data.user) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }
  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
};
