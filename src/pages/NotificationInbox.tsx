import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, CalendarClock, Check, CheckCheck, MessageCircle, ThumbsUp, Trash2, RefreshCw, Inbox as InboxIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import type { Database } from "@/integrations/supabase/types";

type InboxItem = Database["public"]["Tables"]["notification_inbox"]["Row"];
type Filter = "all" | "unread";

const kindDetails: Record<string, { label: string; icon: typeof Bell }> = {
  booking: { label: "Booking deadline", icon: CalendarClock },
  chat: { label: "Trip chat", icon: MessageCircle },
  vote: { label: "Place vote", icon: ThumbsUp },
};

const NotificationInbox = () => {
  const { user } = useAuth();
  const { notifications, unreadCount, remindersEnabled, loading, error, reminderBusy, refresh, markRead, markAllRead, clearAll, setRemindersEnabled } = useNotifications();
  const [filter, setFilter] = useState<Filter>("all");
  const visibleItems = useMemo(
    () => notifications.filter((item) => filter === "all" || !item.read_at),
    [notifications, filter],
  );

  if (!user) {
    return (
      <main className="min-h-screen bg-background px-5 py-16">
        <section className="mx-auto max-w-xl border border-border bg-card px-6 py-10 text-center">
          <Bell className="mx-auto h-8 w-8 text-primary" />
          <h1 className="mt-4 font-display text-2xl font-semibold">Your travel inbox</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to see trip updates and booking reminders.</p>
          <Button asChild className="mt-6"><Link to="/auth">Sign in</Link></Button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Travel updates</p>
            <h1 className="mt-1 font-display text-3xl font-semibold">Inbox</h1>
            <p className="mt-1 text-sm text-muted-foreground">Booking deadlines, trip chat, and place votes.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={loading} aria-label="Refresh inbox">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button variant="outline" size="sm" onClick={() => void markAllRead()} disabled={!unreadCount}>
              <CheckCheck className="h-4 w-4" /> <span className="hidden sm:inline">Mark all read</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => void clearAll()} disabled={!notifications.length} aria-label="Clear inbox">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <section className="flex flex-wrap items-center justify-between gap-4 border-b border-border py-5" aria-label="Booking reminder settings">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold">Daily booking reminders</h2>
            <p className="mt-1 text-sm text-muted-foreground">Check due and near-term bookings once each day when you open the app.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{remindersEnabled ? "On" : "Off"}</span>
            <Switch
              checked={remindersEnabled}
              onCheckedChange={(checked) => void setRemindersEnabled(checked)}
              disabled={reminderBusy}
              aria-label="Daily booking reminders"
            />
          </div>
        </section>

        <div className="flex items-center justify-between gap-4 py-5">
          <Tabs value={filter} onValueChange={(value) => setFilter(value as Filter)}>
            <TabsList>
              <TabsTrigger value="all">All <span className="ml-1.5 text-muted-foreground">{notifications.length}</span></TabsTrigger>
              <TabsTrigger value="unread">Unread <span className="ml-1.5 text-muted-foreground">{unreadCount}</span></TabsTrigger>
            </TabsList>
          </Tabs>
          {unreadCount > 0 && <span className="text-xs text-muted-foreground">{unreadCount} unread</span>}
        </div>

        {error && (
          <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-3 border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={() => void refresh()}>Try again</Button>
          </div>
        )}

        {loading ? (
          <div className="space-y-3" aria-label="Loading inbox">
            {[0, 1, 2].map((item) => <div key={item} className="h-24 animate-pulse border border-border bg-card" />)}
          </div>
        ) : visibleItems.length ? (
          <ul className="divide-y divide-border border-y border-border">
            {visibleItems.map((item) => <NotificationRow key={item.id} item={item} onRead={() => void markRead(item.id)} />)}
          </ul>
        ) : (
          <div className="border-y border-border py-16 text-center">
            <InboxIcon className="mx-auto h-8 w-8 text-muted-foreground/60" />
            <h2 className="mt-4 font-display text-xl font-semibold">{filter === "unread" ? "All caught up" : "Nothing in your inbox yet"}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{filter === "unread" ? "New trip updates will appear here." : "Booking deadlines and group activity will show up here."}</p>
          </div>
        )}
      </div>
    </main>
  );
};

const NotificationRow = ({ item, onRead }: { item: InboxItem; onRead: () => void }) => {
  const details = kindDetails[item.kind] || { label: "Trip update", icon: Bell };
  const Icon = details.icon;
  const time = new Date(item.created_at);
  const relativeTime = Number.isNaN(time.getTime()) ? "Recently" : formatDistanceToNow(time, { addSuffix: true });
  const content = (
    <div className="flex min-w-0 flex-1 items-start gap-3">
      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-secondary/60 text-foreground">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{details.label}</p>
          {!item.read_at && <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-label="Unread" />}
        </div>
        <h3 className={`mt-1 text-sm ${item.read_at ? "font-medium" : "font-semibold"}`}>{item.title}</h3>
        {item.body && <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>}
        <p className="mt-2 text-xs text-muted-foreground">{relativeTime}</p>
      </div>
    </div>
  );

  return (
    <li className={`flex items-start gap-3 px-3 py-4 transition-colors ${item.read_at ? "bg-card" : "bg-primary/[0.035]"}`}>
      {item.href ? (
        <Link to={item.href} onClick={onRead} className="flex min-w-0 flex-1 items-start rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {content}
        </Link>
      ) : <div className="flex min-w-0 flex-1 items-start">{content}</div>}
      {!item.read_at && (
        <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={onRead} aria-label="Mark as read">
          <Check className="h-4 w-4" />
        </Button>
      )}
    </li>
  );
};

export default NotificationInbox;