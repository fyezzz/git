import { NextResponse, type NextRequest } from "next/server";

/** Cheap edge check: send visitors without a session cookie to /login. The server re-verifies the signature. */
export function middleware(req: NextRequest) {
  if (!process.env.APP_PASSWORD && process.env.NODE_ENV !== "production") return NextResponse.next();
  if (req.cookies.get("cops_session")?.value) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/app/:path*"] };
