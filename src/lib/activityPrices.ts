import { supabase } from "@/integrations/supabase/client";

export type ActivityPriceStatus = "verified" | "unavailable" | "no_link";

type PriceResult = {
  key: string;
  status: "verified" | "unavailable";
  amount?: number;
  currency?: string;
  source?: string;
  checkedAt: string;
};

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const matchReservation = (activity: any, reservations: any[]) => {
  const title = normalize(`${activity.title || ""} ${activity.location || ""}`);
  if (!title) return null;
  const best = reservations
    .filter((reservation) => typeof reservation?.bookingUrl === "string" && /^https:\/\//i.test(reservation.bookingUrl))
    .map((reservation) => {
      const words = normalize(reservation.what || "").split(" ").filter((word: string) => word.length > 2);
      const overlap = words.filter((word: string) => title.includes(word)).length;
      return { reservation, score: words.length ? overlap / words.length : 0 };
    })
    .sort((a, b) => b.score - a.score)[0];
  return best && best.score >= 0.5 ? best.reservation : null;
};

export async function enrichDaysWithVerifiedPrices<T extends { activities?: any[]; reservations?: any[] }>(days: T[]) {
  const requests: { key: string; title: string; bookingUrl: string }[] = [];
  const linkByKey = new Map<string, { url: string; provider?: string }>();
  const activityRefs: { dayIndex: number; activityIndex: number; key: string; url?: string; provider?: string }[] = [];

  days.forEach((day, dayIndex) => {
    (day.activities || []).forEach((activity, activityIndex) => {
      const reservation = matchReservation(activity, day.reservations || []);
      const bookingUrl = typeof activity.bookingUrl === "string" && /^https:\/\//i.test(activity.bookingUrl)
        ? activity.bookingUrl
        : reservation?.bookingUrl;
      const provider = activity.bookingProvider || reservation?.bookingProvider;
      const key = `${dayIndex}-${activityIndex}-${normalize(activity.title || "activity")}`;
      activityRefs.push({ dayIndex, activityIndex, key, url: bookingUrl, provider });
      if (bookingUrl && activity.priceStatus !== "verified") {
        requests.push({ key, title: activity.title || "Activity", bookingUrl });
        linkByKey.set(key, { url: bookingUrl, provider });
      }
    });
  });

  let results: PriceResult[] = [];
  if (requests.length) {
    try {
      const { data, error } = await supabase.functions.invoke("activity-prices", { body: { activities: requests } });
      if (!error && Array.isArray(data?.results)) results = data.results as PriceResult[];
    } catch (error) {
      console.warn("Activity price verification failed:", error);
    }
  }
  const resultByKey = new Map(results.map((result) => [result.key, result]));
  const checkedAt = new Date().toISOString();

  return days.map((day, dayIndex) => ({
    ...day,
    activities: (day.activities || []).map((activity, activityIndex) => {
      const ref = activityRefs.find((item) => item.dayIndex === dayIndex && item.activityIndex === activityIndex);
      if (!ref) return activity;
      const link = ref.url ? linkByKey.get(ref.key) : undefined;
      const result = resultByKey.get(ref.key);
      if (activity.priceStatus === "verified" && typeof activity.verifiedCost === "number") return activity;
      if (result?.status === "verified" && typeof result.amount === "number") {
        return {
          ...activity,
          cost: result.amount,
          verifiedCost: result.amount,
          verifiedCurrency: result.currency,
          priceStatus: "verified" as const,
          priceSource: result.source,
          priceCheckedAt: result.checkedAt,
          bookingUrl: link?.url || activity.bookingUrl,
          bookingProvider: link?.provider || activity.bookingProvider,
        };
      }
      return {
        ...activity,
        cost: 0,
        priceStatus: (ref.url ? "unavailable" : "no_link") as ActivityPriceStatus,
        priceCheckedAt: result?.checkedAt || checkedAt,
        bookingUrl: link?.url || activity.bookingUrl,
        bookingProvider: link?.provider || activity.bookingProvider,
      };
    }),
  }));
}