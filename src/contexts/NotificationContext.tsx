import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { buildBookingReminderDrafts } from "@/lib/bookingReminders";
import type { Database } from "@/integrations/supabase/types";

type InboxItem = Database["public"]["Tables"]["notification_inbox"]["Row"];
type InboxContextValue = {
  notifications: InboxItem[];
  unreadCount: number;
  remindersEnabled: boolean;
  loading: boolean;
  error: string | null;
  reminderBusy: boolean;
  refresh: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  setRemindersEnabled: (enabled: boolean) => Promise<void>;
};

const NotificationContext = createContext<InboxContextValue | null>(null);

const localDayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<InboxItem[]>([]);
  const [remindersEnabled, setRemindersEnabledState] = useState(true);
  const [lastReminderDate, setLastReminderDate] = useState<string | null>(null);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reminderBusy, setReminderBusy] = useState(false);
  const processedDay = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("notification_inbox")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(250);
    if (fetchError) {
      setError("Your inbox could not be loaded. Please try again.");
    } else {
      setNotifications((data || []) as InboxItem[]);
      setError(null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    let active = true;
    processedDay.current = null;
    setError(null);
    if (!user) {
      setNotifications([]);
      setRemindersEnabledState(true);
      setLastReminderDate(null);
      setPreferencesLoaded(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setPreferencesLoaded(false);
    const load = async () => {
      const [inboxResult, preferenceResult] = await Promise.all([
        supabase.from("notification_inbox").select("*").order("created_at", { ascending: false }).limit(250),
        supabase.from("notification_preferences").select("booking_reminders_enabled,last_booking_reminder_date").eq("user_id", user.id).maybeSingle(),
      ]);
      if (!active) return;
      if (inboxResult.error) {
        setError("Your inbox could not be loaded. Please try again.");
      } else {
        setNotifications((inboxResult.data || []) as InboxItem[]);
        setError(null);
      }
      if (preferenceResult.error) {
        setError("Notification settings could not be loaded. Please try again.");
      } else {
        setRemindersEnabledState(preferenceResult.data?.booking_reminders_enabled ?? true);
        setLastReminderDate(preferenceResult.data?.last_booking_reminder_date ?? null);
      }
      setPreferencesLoaded(true);
      setLoading(false);
    };
    void load();
    return () => { active = false; };
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`inbox-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notification_inbox", filter: `user_id=eq.${user.id}` }, (payload) => {
        if (payload.eventType === "DELETE") {
          const removed = payload.old as Partial<InboxItem>;
          if (removed.id) setNotifications((current) => current.filter((item) => item.id !== removed.id));
          return;
        }
        const next = payload.new as InboxItem;
        if (!next?.id) return;
        setNotifications((current) => [next, ...current.filter((item) => item.id !== next.id)]
          .sort((a, b) => b.created_at.localeCompare(a.created_at)));
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [user?.id]);

  useEffect(() => {
    if (!user || !preferencesLoaded || !remindersEnabled) return;
    const today = localDayKey(new Date());
    const dayKey = `${user.id}:${today}`;
    if (lastReminderDate === today || processedDay.current === dayKey) return;
    processedDay.current = dayKey;
    let active = true;
    setReminderBusy(true);

    const collect = async () => {
      const { data: trips, error: tripsError } = await supabase
        .from("trips")
        .select("id,destination,title,itinerary_data")
        .in("status", ["planned", "active"]);
      if (!active) return;
      if (tripsError) {
        processedDay.current = null;
        setError("Booking reminders could not be checked. Please try again.");
        setReminderBusy(false);
        return;
      }

      const drafts = buildBookingReminderDrafts((trips || []) as { id: string; destination: string; title: string; itinerary_data: unknown }[], new Date());
      if (drafts.length) {
        const { error: insertError } = await supabase.from("notification_inbox").upsert(
          drafts.map((draft) => ({ ...draft, user_id: user.id })),
          { onConflict: "user_id,dedupe_key", ignoreDuplicates: true },
        );
        if (!active) return;
        if (insertError) {
          processedDay.current = null;
          setError("Booking reminders could not be saved. Please try again.");
          setReminderBusy(false);
          return;
        }
      }

      const { error: preferenceError } = await supabase.from("notification_preferences").upsert({
        user_id: user.id,
        booking_reminders_enabled: true,
        last_booking_reminder_date: today,
      }, { onConflict: "user_id" });
      if (!active) return;
      if (preferenceError) {
        processedDay.current = null;
        setError("The daily reminder check could not be saved. Please try again.");
      } else {
        setLastReminderDate(today);
        if (drafts.length) {
          toast(`${drafts.length} booking ${drafts.length === 1 ? "reminder" : "reminders"} added to your inbox`);
        }
        await refresh();
      }
      setReminderBusy(false);
    };

    void collect();
    return () => { active = false; };
  }, [user?.id, preferencesLoaded, remindersEnabled, lastReminderDate, refresh]);

  const markRead = useCallback(async (id: string) => {
    if (!user) return;
    const readAt = new Date().toISOString();
    const { error: updateError } = await supabase.from("notification_inbox").update({ read_at: readAt }).eq("id", id).eq("user_id", user.id);
    if (updateError) {
      toast.error("This notification could not be marked as read");
      return;
    }
    setNotifications((current) => current.map((item) => item.id === id ? { ...item, read_at: readAt } : item));
  }, [user?.id]);

  const markAllRead = useCallback(async () => {
    if (!user) return;
    const readAt = new Date().toISOString();
    const { error: updateError } = await supabase.from("notification_inbox").update({ read_at: readAt }).eq("user_id", user.id).is("read_at", null);
    if (updateError) {
      toast.error("Notifications could not be marked as read");
      return;
    }
    setNotifications((current) => current.map((item) => ({ ...item, read_at: item.read_at || readAt })));
  }, [user?.id]);

  const clearAll = useCallback(async () => {
    if (!user) return;
    const { error: deleteError } = await supabase.from("notification_inbox").delete().eq("user_id", user.id);
    if (deleteError) {
      toast.error("Your inbox could not be cleared");
      return;
    }
    setNotifications([]);
  }, [user?.id]);

  const setRemindersEnabled = useCallback(async (enabled: boolean) => {
    if (!user) return;
    setReminderBusy(true);
    const { error: saveError } = await supabase.from("notification_preferences").upsert({
      user_id: user.id,
      booking_reminders_enabled: enabled,
    }, { onConflict: "user_id" });
    setReminderBusy(false);
    if (saveError) {
      toast.error("Reminder settings could not be saved");
      return;
    }
    setRemindersEnabledState(enabled);
    toast.success(enabled ? "Daily booking reminders are on" : "Daily booking reminders are off");
  }, [user?.id]);

  const value = useMemo<InboxContextValue>(() => ({
    notifications,
    unreadCount: notifications.filter((item) => !item.read_at).length,
    remindersEnabled,
    loading,
    error,
    reminderBusy,
    refresh,
    markRead,
    markAllRead,
    clearAll,
    setRemindersEnabled,
  }), [notifications, remindersEnabled, loading, error, reminderBusy, refresh, markRead, markAllRead, clearAll, setRemindersEnabled]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const value = useContext(NotificationContext);
  if (!value) throw new Error("useNotifications must be used within NotificationProvider");
  return value;
};