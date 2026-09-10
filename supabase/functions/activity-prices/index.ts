import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

type ActivityRequest = {
  key: string;
  title: string;
  bookingUrl: string;
};

type PriceResult = {
  key: string;
  status: "verified" | "unavailable";
  amount?: number;
  currency?: string;
  source?: string;
  checkedAt: string;
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

const blockedHostname = (hostname: string) => {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  return host === "localhost"
    || host.endsWith(".local")
    || host === "::1"
    || /^127\./.test(host)
    || /^10\./.test(host)
    || /^192\.168\./.test(host)
    || /^169\.254\./.test(host)
    || /^172\.(1[6-9]|2\d|3[0-1])\./.test(host);
};

const safeUrl = (value: unknown): string | null => {
  if (typeof value !== "string" || value.length > 2000) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || blockedHostname(url.hostname)) return null;
    return url.toString();
  } catch {
    return null;
  }
};

const decodeHtml = (value: string) => value
  .replace(/&nbsp;/gi, " ")
  .replace(/&amp;/gi, "&")
  .replace(/&#x27;|&#39;|&apos;/gi, "'")
  .replace(/&quot;/gi, '"')
  .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));

const cleanText = (html: string) => decodeHtml(html
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " "))
  .replace(/\s+/g, " ")
  .trim();

const currencyFromSymbol = (value: string) => {
  if (/₹|INR/i.test(value)) return "INR";
  if (/€|EUR/i.test(value)) return "EUR";
  if (/£|GBP/i.test(value)) return "GBP";
  if (/¥|￥|JPY/i.test(value)) return "JPY";
  if (/₩|KRW/i.test(value)) return "KRW";
  if (/A\$|AUD/i.test(value)) return "AUD";
  if (/C\$|CAD/i.test(value)) return "CAD";
  if (/USD|US\$|\$/i.test(value)) return "USD";
  return undefined;
};

const normalizeAmount = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0 && value < 1_000_000) return value;
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/,/g, "").match(/\d+(?:\.\d{1,2})?/);
  if (!cleaned) return null;
  const amount = Number(cleaned[0]);
  return Number.isFinite(amount) && amount >= 0 && amount < 1_000_000 ? amount : null;
};

const findJsonPrices = (value: unknown): { amount: number; currency?: string }[] => {
  if (!value || typeof value !== "object") return [];
  const object = value as Record<string, unknown>;
  const found: { amount: number; currency?: string }[] = [];
  const currency = typeof object.priceCurrency === "string" ? object.priceCurrency : undefined;
  for (const key of ["price", "lowPrice", "highPrice"]) {
    const amount = normalizeAmount(object[key]);
    if (amount !== null) found.push({ amount, currency });
  }
  for (const key of ["offers", "priceSpecification", "aggregateOffer"]) {
    const child = object[key];
    if (Array.isArray(child)) child.forEach((item) => found.push(...findJsonPrices(item)));
    else found.push(...findJsonPrices(child));
  }
  return found;
};

const extractPrice = (html: string): { amount: number; currency?: string; source: string } | null => {
  const jsonBlocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const block of jsonBlocks) {
    try {
      const parsed = JSON.parse(decodeHtml(block[1]));
      const candidates = Array.isArray(parsed) ? parsed.flatMap(findJsonPrices) : findJsonPrices(parsed);
      const first = candidates.find((candidate) => candidate.amount >= 0);
      if (first) return { ...first, source: "booking page structured data" };
    } catch {
      // Some booking pages embed invalid JSON-LD; fall through to metadata.
    }
  }

  const metadata = [...html.matchAll(/<meta[^>]+(?:property|name)=["']([^"']*(?:price|amount)[^"']*)["'][^>]+content=["']([^"']+)["'][^>]*>/gi)];
  for (const match of metadata) {
    const amount = normalizeAmount(match[2]);
    if (amount !== null) return { amount, currency: currencyFromSymbol(match[2]), source: "booking page price metadata" };
  }

  const text = cleanText(html).slice(0, 250_000);
  const match = text.match(/(?:from\s*)?(USD|EUR|GBP|INR|JPY|AUD|CAD|KRW|US\$|A\$|C\$|[$€£₹¥₩])\s*([0-9]{1,6}(?:[,.][0-9]{1,2})?)/i)
    || text.match(/([0-9]{1,6}(?:[,.][0-9]{1,2})?)\s*(USD|EUR|GBP|INR|JPY|AUD|CAD|KRW)/i);
  if (!match) return null;
  const raw = /\d/.test(match[1]) ? match[1] : match[2];
  const marker = /\d/.test(match[1]) ? match[2] : match[1];
  const amount = normalizeAmount(raw);
  return amount === null ? null : { amount, currency: currencyFromSymbol(marker), source: "booking page text" };
};

const fetchPrice = async (activity: ActivityRequest): Promise<PriceResult> => {
  const checkedAt = new Date().toISOString();
  const url = safeUrl(activity.bookingUrl);
  if (!url) return { key: activity.key, status: "unavailable", checkedAt };
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "VoyageAI price verifier/1.0", Accept: "text/html,application/xhtml+xml" },
      redirect: "follow",
      signal: AbortSignal.timeout(12_000),
    });
    const finalUrl = safeUrl(response.url);
    if (!response.ok || !finalUrl) return { key: activity.key, status: "unavailable", checkedAt };
    const price = extractPrice(await response.text());
    return price
      ? { key: activity.key, status: "verified", amount: price.amount, currency: price.currency, source: price.source, checkedAt }
      : { key: activity.key, status: "unavailable", checkedAt };
  } catch {
    return { key: activity.key, status: "unavailable", checkedAt };
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return json({ error: "Price service is not configured" }, 500);
    const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
    if (!token) return json({ error: "Authentication required" }, 401);
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData.user) return json({ error: "Authentication required" }, 401);

    const body = await req.json().catch(() => null);
    if (!Array.isArray(body?.activities) || body.activities.length > 60) return json({ error: "activities must be an array of up to 60 items" }, 400);
    const activities: ActivityRequest[] = body.activities
      .filter((item: unknown): item is Record<string, unknown> => !!item && typeof item === "object")
      .map((item) => ({
        key: typeof item.key === "string" ? item.key.slice(0, 180) : "",
        title: typeof item.title === "string" ? item.title.slice(0, 180) : "",
        bookingUrl: typeof item.bookingUrl === "string" ? item.bookingUrl : "",
      }))
      .filter((item) => item.key && item.title && item.bookingUrl);

    const results: PriceResult[] = [];
    for (let index = 0; index < activities.length; index += 4) {
      results.push(...await Promise.all(activities.slice(index, index + 4).map(fetchPrice)));
    }
    return json({ results });
  } catch (error) {
    console.error("activity-prices error", error);
    return json({ error: "Could not verify activity prices" }, 500);
  }
});