import { NextRequest, NextResponse } from "next/server";
import { IDENTITY_COOKIE_NAME, computeIdentityToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const userId = String(form.get("userId") ?? "");
  const next = String(form.get("next") ?? "/");
  const password = process.env.NESTWORK_PASSWORD;

  if (!password || !userId) {
    return NextResponse.redirect(new URL("/whoami", request.url), { status: 303 });
  }

  const token = await computeIdentityToken(userId, password);
  const response = NextResponse.redirect(new URL(next, request.url), { status: 303 });
  response.cookies.set(IDENTITY_COOKIE_NAME, `${userId}.${token}`, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return response;
}
