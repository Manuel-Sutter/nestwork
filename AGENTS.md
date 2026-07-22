# Nestwork

Personal project: a shared family task board for two parents, built as a PWA
(installable to Android home screen, Web Push notifications). Sibling project
to `bike-dashboard`, deliberately mirroring its tooling.

## Stack

- Next.js (App Router) + TypeScript, single app — no separate backend.
- Supabase (Postgres). Schema in `supabase/schema.sql`. Server-only client
  (`src/lib/supabase.ts`) uses the service-role key; a browser anon-key client
  is introduced only for Realtime read subscriptions, never for writes.
- No Supabase Auth — a lightweight password gate + "pick your name" identity
  cookie (`src/lib/auth.ts`, `src/middleware.ts`) is enough for 2 known users.
- Package manager: npm.

## Rules

- Solo project — optimize for momentum over process. Small, direct commits.
- Entire UI, voice input, and LLM parsing target German (de-DE). Don't
  hardcode English copy.
- The "notify only the other user, never the actor" rule is the single most
  safety-critical piece of business logic in the app — it lives as its own
  pure, tested function (`src/lib/notifications/getNotificationTargets.ts`),
  never duplicated inline in a route.
- Anything that calls the Anthropic API or sends a push notification is
  isolated to its own file. Everything downstream of it (assignee resolution,
  category validation, notification targeting, board reorder math) is a
  plain, Vitest-tested function with no network calls — same separation
  bike-dashboard enforces between `src/lib/training/` and anything calling an
  LLM.
- No comments unless the WHY is genuinely non-obvious.
