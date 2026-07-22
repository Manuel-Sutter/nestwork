export const SESSION_COOKIE_NAME = "nestwork_session";
export const IDENTITY_COOKIE_NAME = "nestwork_user_id";

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Web Crypto (not Node's `crypto` module) so this works unchanged whether
// middleware runs on the Edge or Node.js runtime.
export async function computeSessionToken(password: string): Promise<string> {
  return sha256Hex(`Nestwork:${password}`);
}

export async function computeIdentityToken(userId: string, password: string): Promise<string> {
  return sha256Hex(`Nestwork:${userId}:${password}`);
}

// Not meant to resist a sophisticated attacker - just enough that a
// trivially-edited cookie value can't impersonate the other spouse.
export async function verifyIdentityCookie(
  value: string | undefined,
  password: string,
): Promise<string | null> {
  if (!value) return null;
  const [userId, token] = value.split(".");
  if (!userId || !token) return null;
  const expected = await computeIdentityToken(userId, password);
  return token === expected ? userId : null;
}
