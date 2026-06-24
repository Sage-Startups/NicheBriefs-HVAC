# NicheBriefs HVAC — Buyer Demo Checklist

A concise walkthrough for buyers and evaluators. For full setup instructions see `README.md`.

---

## Quick Start

1. Clone repo and run `pnpm install`
2. Copy `.env.example` → `.env.local` and fill in at minimum: `DATABASE_URL`, `AUTH_SECRET`, `OPENAI_API_KEY`
3. `pnpm db:push` — create all database tables
4. `pnpm db:seed` — load demo workspace, user, projects, and briefs
5. `pnpm dev` — start at `http://localhost:3000`

---

## Demo Account

| Field | Value |
|---|---|
| Email | `demo@nichebriefs.com` |
| Password | `demo` |
| Workspace | Summit Local SEO |

The seed script creates the database records. The demo password is `"demo"` — any email uses this password in the MVP credentials provider.

---

## Flows to Verify

### Authentication
- [ ] **Sign up** — visit `/sign-up`, enter any email, click Create Account → lands on `/dashboard`
- [ ] **Sign in** — visit `/sign-in`, use `demo@nichebriefs.com` / `demo` → lands on `/dashboard`
- [ ] **Sign out** — click logout icon (top-right of any app page) → redirected to `/sign-in`
- [ ] **Protected routes** — visit `/dashboard` while logged out → redirected to `/sign-in`

### Dashboard
- [ ] Demo briefs load (4 HVAC briefs after seeding)
- [ ] Search by keyword or city filters the list
- [ ] Service type filter works
- [ ] Page type filter works
- [ ] Project filter works (shows projects from seed)
- [ ] City filter works
- [ ] Empty state shows when no briefs match filters

### Brief Generation
- [ ] Click **New Brief** → fill in keyword, city, service type, page type, search intent → click **Generate HVAC SEO Brief**
- [ ] Loading overlay appears during generation (~30–60 seconds)
- [ ] Generated brief appears with all sections: SEO title, meta, H1, slug, outline, local SEO, talking points, FAQs, CTAs, writer instructions
- [ ] Brief saved to dashboard automatically after generation
- [ ] Error toast appears if OpenAI key is missing or generation fails

### Brief Editor
- [ ] Click a brief from dashboard → opens editor
- [ ] Edit the content in the textarea
- [ ] Click **Save** → "Saved" confirmation appears
- [ ] Refresh page → edits persist
- [ ] Status changes from "generated" → "edited" after saving

### Brief Actions
- [ ] **Copy** — copies markdown to clipboard
- [ ] **Download .md** — downloads brief as `.md` file; confirm file contains full brief
- [ ] **Print** — browser print dialog opens with clean NicheBriefs HVAC header
- [ ] **Duplicate** — creates a copy of the brief, navigates to new copy
- [ ] **Archive** — removes brief from dashboard

### Projects
- [ ] Click **Projects** in sidebar → see 3 demo projects (Desert Air Pros, NorthStar, Blue Ridge)
- [ ] Click **New Project** → fill in name and city → creates project
- [ ] Edit project → updates name/city
- [ ] Delete project → removed from list (briefs unassigned)
- [ ] Assign brief to project during New Brief creation via project selector

### Settings
- [ ] **Account** section shows name/email
- [ ] **Workspace** section shows workspace name
- [ ] **Billing** section shows subscription status ("Trial")
- [ ] If Stripe is configured: **Upgrade to Pro** button launches Stripe Checkout test flow
- [ ] If Stripe is configured: **Manage billing** button opens Stripe Customer Portal

### Subscription Gating
- [ ] Users with `trialing` or `active` subscription can generate freely
- [ ] Users with `past_due`, `canceled`, or `inactive` subscription see upgrade error on generation
- [ ] To test blocking: update subscription status to `inactive` directly in DB, then try to generate

---

## Sample Exports

After generating or opening a demo brief:

1. **Clipboard** — click Copy. Paste into any editor to verify full markdown.
2. **Markdown file** — click `.md`. File downloads as `[brief-title].md`.
3. **Print/PDF** — click Print. Use browser "Save as PDF". Verify branded header and full content.

---

## Required Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | JWT signing key (generate: `openssl rand -base64 32`) |
| `OPENAI_API_KEY` | GPT-4o brief generation |
| `NEXT_PUBLIC_APP_URL` | Deployment URL for Stripe callbacks |
| `STRIPE_SECRET_KEY` | Stripe billing (optional for demo) |
| `STRIPE_PRICE_ID` | Stripe Pro plan price ID (optional for demo) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification (optional for demo) |

> **Note:** Stripe vars are optional for demo mode. Without them, the Billing section shows a "Stripe not configured" notice and all trial users can generate freely.

---

## Database Schema (Overview)

| Table | Purpose |
|---|---|
| `users` | Auth users |
| `workspaces` | Tenant container (1 per user) |
| `subscriptions` | Stripe subscription state |
| `projects` | Client/project groupings |
| `briefs` | Generated + edited SEO briefs |
| `brief_exports` | Export event log per brief |
| `usage_events` | Token usage + export activity tracking |

---

## Known Limitations

- **Password auth only** — no full password reset flow (demo uses fixed password `"demo"`). Production deployment should add an email auth provider or password reset.
- **Single workspace per user** — multi-user team workspaces not implemented in this MVP.
- **No usage cap on trial** — trial users can generate unlimited briefs. A generation limit can be added in `/api/briefs/generate/route.ts` by counting `usageEvents` for the workspace.
- **Stripe requires test-mode keys** — use `sk_test_...` and a test mode price ID. Do not use live keys for demo.
- **Google OAuth optional** — set `AUTH_GOOGLE_ID` + `AUTH_GOOGLE_SECRET` to enable Google sign-in alongside credentials.
- **PDF export** — uses browser print-to-PDF. No server-side PDF generation.

---

## Deployment Notes

- Deploy to Vercel: set all env vars in project settings, `pnpm db:push` against your Neon/Postgres DB, `pnpm db:seed` once.
- Stripe webhooks: point to `https://yourdomain.com/api/webhooks/stripe`, select 5 events listed in README.
- The app runs on Next.js 15 with React 19 and the App Router.
