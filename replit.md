# Yastar

Yastar is a reverse profit/target calculator for salon, barbershop, nail studio,
and spa owners: instead of projecting revenue forward, owners enter the monthly
profit they want and Yastar works backward to tell them how many clients they
need, whether that's realistic, and where the plan is fragile.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/yastar run dev` — run the web app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/scripts run seed` — seed demo owner accounts (one per tier) with sample scenarios; safe to re-run
- Required env: `DATABASE_URL` — Postgres connection string
- Required secrets: `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY` (owner sign-in), `ADMIN_PASSWORD` (internal admin dashboard), `SESSION_SECRET` (admin session signing)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Web: React + Vite, wouter routing, TanStack Query, shadcn/ui, Clerk (owner auth)

## Where things live

- `artifacts/api-server/src/lib/calculationEngine.ts` — the reverse-target and break-even math plus the rules-based insight engine
- `artifacts/api-server/src/routes/{calculate,account,scenarios,admin}.ts` — API route handlers
- `artifacts/api-server/src/lib/adminAuth.ts` — HMAC-signed admin session cookie helpers (admin auth is password-only, no DB row)
- `lib/db/src/schema/` — `accounts`, `scenarios`, `accountHistory` Drizzle tables (source of truth for the data model)
- `lib/api-spec` — OpenAPI contract; run its `codegen` script after changing it to regenerate `@workspace/api-client-react`
- `artifacts/yastar/src/pages/` — calculator, scenarios list, user portal shell, admin login/dashboard, marketing home
- `scripts/src/seed.ts` — demo data seeder (`@workspace/scripts`)

## Architecture decisions

- Owner accounts are JIT-provisioned from Clerk on first API call (`getOrCreateAccount`) — there is no separate signup flow, `clerkUserId` is the join key.
- Tiers (`free`/`starter`/`professional`) and scenario limits are managed manually by an admin, not via a payment gateway — `POST /api/admin/accounts/:id` is the only place tier changes happen, and each change is logged to `account_history`.
- The internal admin dashboard uses a single shared password (`ADMIN_PASSWORD` secret) and a signed cookie session — it is intentionally separate from Clerk and has no per-admin accounts.
- Scenario creation enforces `scenarioLimit` server-side (null = unlimited); the frontend also checks it client-side to disable the save button proactively, but the server check is the actual guard.

## Product

- Reverse target calculator: owner enters services, employee count, working hours, fixed costs, commission model (flat / base+commission / tiered), and a target monthly profit; the app returns clients needed, utilization %, margin, and rules-based insights (e.g. "target requires unrealistic utilization").
- Scenario save/compare: owners save named scenarios (tier-limited) and revisit them later, e.g. to compare "before vs. after hiring".
- Admin dashboard: search owner accounts, view/edit tier and scenario limits, see full tier-change history.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After changing `lib/api-spec`'s OpenAPI file, always re-run its `codegen` script — the frontend imports generated hooks/types from `@workspace/api-client-react`, not the spec directly.
- Demo accounts from `scripts/src/seed.ts` use placeholder `clerkUserId`s (`demo_<tier>_owner`) that never match a real Clerk session — they only show up in the admin dashboard, not as owner logins.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
