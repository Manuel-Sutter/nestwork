import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, IDENTITY_COOKIE_NAME, computeSessionToken, verifyIdentityCookie } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/api/login"];
const WHOAMI_PATHS = ["/whoami", "/api/whoami"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const password = process.env.NESTWORK_PASSWORD;
  const expectedSession = password ? await computeSessionToken(password) : null;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!expectedSession || sessionCookie !== expectedSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (WHOAMI_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const identityCookie = request.cookies.get(IDENTITY_COOKIE_NAME)?.value;
  const userId = password ? await verifyIdentityCookie(identityCookie, password) : null;

  if (!userId) {
    const whoamiUrl = new URL("/whoami", request.url);
    whoamiUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(whoamiUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
