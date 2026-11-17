# Architecture rules

- Shared Edge Function security checks live in `supabase/functions/_shared/security.ts` so authentication and signed media URLs are enforced consistently across handlers.