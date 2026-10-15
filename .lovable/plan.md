## Plan: Live In-App Notification Inbox

### User experience
- Add a signed-in notification inbox accessible from the authenticated navigation, with unread count, read/unread state, and links back to the relevant trip or itinerary.
- Deliver live trip chat and place-vote alerts through realtime subscriptions, excluding the current user's own activity.
- Replace browser/Firebase alert behavior in the booking checklist with booking-deadline notifications in the inbox.
- Add a daily reminder toggle. When enabled, due and near-term booking reminders are collected once per local calendar day when the user opens the app; no background or Firebase alerts are included.
- Provide empty, loading, and error states, and let users mark notifications read or clear them.

### Data and access
- Persist notification records and reminder preference in Lovable Cloud, scoped to the signed-in user; use realtime for new records.
- Create and secure any required table through one migration, with explicit grants, row-level security, and realtime publication enabled.
- Add event creation for booking deadlines and relevant chat/vote activity without exposing one traveler's private data to others.

### Validation
- Typecheck and inspect preview build diagnostics.
- Verify inbox updates for new chat and vote events, excludes self-generated events, persists read state, and only creates one daily booking reminder batch per local day.
- Confirm no Firebase or browser notification permission is requested.

### Technical details
- Follow existing Supabase client realtime patterns and authenticated shell conventions.
- Use a user-scoped notification store and an idempotent local-day key for booking reminder deduplication; avoid scheduled jobs because reminders are only required when the app is open.