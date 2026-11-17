import { createClient } from "npm:@supabase/supabase-js@2";

const hex = (buffer: ArrayBuffer) =>
  [...new Uint8Array(buffer)].map((value) => value.toString(16).padStart(2, "0")).join("");

const photoSignature = async (reference: string, maxWidth: number, expiresAt: number) => {
  const secret = Deno.env.get("PHOTO_PROXY_SIGNING_SECRET");
  if (!secret) throw new Error("Photo service is not configured");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const payload = `${reference}:${maxWidth}:${expiresAt}`;
  return hex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)));
};

export async function hasValidUserSession(req: Request): Promise<boolean> {
  const authorization = req.headers.get("Authorization") || "";
  const token = authorization.replace(/^Bearer\s+/i, "").trim();
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_ANON_KEY");
  if (!token || !url || !key) return false;

  const client = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await client.auth.getUser(token);
  return !error && !!data.user;
}

export async function signedPhotoUrl(
  reference: string,
  maxWidth: number,
  baseUrl = Deno.env.get("SUPABASE_URL") || "",
): Promise<string> {
  const safeWidth = Math.min(1600, Math.max(100, Math.floor(maxWidth)));
  const expiresAt = Math.floor(Date.now() / 1000) + 3600;
  const signature = await photoSignature(reference, safeWidth, expiresAt);
  const url = new URL("/functions/v1/google-maps-photo", baseUrl);
  url.searchParams.set("photo_reference", reference);
  url.searchParams.set("maxwidth", String(safeWidth));
  url.searchParams.set("expires", String(expiresAt));
  url.searchParams.set("signature", signature);
  return url.toString();
}

export async function hasValidPhotoSignature(
  reference: string,
  maxWidth: number,
  expiresAt: number,
  signature: string,
): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000);
  if (!reference || reference.length > 4096 || !Number.isInteger(maxWidth) || maxWidth < 100 || maxWidth > 1600) return false;
  if (!Number.isInteger(expiresAt) || expiresAt < now || expiresAt > now + 3600) return false;
  if (!/^[a-f0-9]{64}$/i.test(signature)) return false;
  try {
    const expected = await photoSignature(reference, maxWidth, expiresAt);
    let difference = expected.length ^ signature.length;
    for (let index = 0; index < Math.min(expected.length, signature.length); index++) {
      difference |= expected.charCodeAt(index) ^ signature.charCodeAt(index);
    }
    return difference === 0;
  } catch {
    return false;
  }
}