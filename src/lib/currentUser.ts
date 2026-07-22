import { cookies } from "next/headers";
import { IDENTITY_COOKIE_NAME, verifyIdentityCookie } from "@/lib/auth";

// Every mutation route calls this rather than trusting a client-supplied
// body field - it's what makes the "notify the other user, not the actor"
// rule trustworthy.
export async function getCurrentUserId(): Promise<string | null> {
  const password = process.env.NESTWORK_PASSWORD;
  if (!password) return null;
  const cookieStore = await cookies();
  const value = cookieStore.get(IDENTITY_COOKIE_NAME)?.value;
  return verifyIdentityCookie(value, password);
}
