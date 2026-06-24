# NicheBriefs HVAC

A Next.js SaaS for generating structured, writer-ready SEO content briefs for HVAC local service pages, cost guides, comparison articles, and more. Built for SEO consultants and content agencies.

---

## Tech Stack

- **Next.js 15** — App Router, Server Components, Server Actions
- **TypeScript** — strict mode
- **Tailwind CSS v3** + custom shadcn/ui components
- **Drizzle ORM** + PostgreSQL (Neon-compatible)
- **NextAuth v5** (Auth.js) — credentials + optional Google OAuth
- **OpenAI** (`gpt-4o`) — brief generation
- **Stripe** — subscriptions, checkout, billing portal

---

## Local Development

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL database (local or [Neon](https://neon.tech) free tier)
- OpenAI API key
- Stripe account (test mode for local dev)

### 1. Clone and install

```bash
git clone <repo-url>
cd NicheBriefs-HVAC
pnpm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values (see [Environment Variables](#environment-variables) below).

### 3. Set up the database

Run migrations to create all tables:

```bash
pnpm db:push
```

Seed demo data (workspace, user, projects, sample briefs):

```bash
pnpm db:seed
```

### 4. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in each value.

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string. Format: `postgresql://user:pass@host:5432/dbname` |
| `AUTH_SECRET` | Yes | Random 32-char secret for JWT signing. Generate with: `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | Yes | Full URL of your deployment, e.g. `http://localhost:3000`. Used for Stripe success/cancel redirect URLs. |
| `OPENAI_API_KEY` | Yes | OpenAI API key from [platform.openai.com](https://platform.openai.com). Used for `gpt-4o` brief generation. |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key (`sk_test_...` for test, `sk_live_...` for prod) |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret (`whsec_...`). See Stripe setup below. |
| `STRIPE_PRICE_ID` | Yes | Price ID for the Pro plan (`price_...`). Create in Stripe dashboard. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No | Stripe publishable key (`pk_test_...`). Not required for hosted Checkout flow. |
| `AUTH_GOOGLE_ID` | No | Google OAuth client ID (optional — credentials login works without it) |
| `AUTH_GOOGLE_SECRET` | No | Google OAuth client secret (optional) |

---

## Stripe Setup

### Test mode (local development)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test) → Products
2. Create a product called **"NicheBriefs HVAC Pro"**
3. Add a recurring price (e.g. $99/mo) → copy the **Price ID** (`price_...`)
4. Set `STRIPE_PRICE_ID` in `.env.local`

### Webhook (local development)

Install the Stripe CLI and forward events to your local server:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret printed by the CLI → set `STRIPE_WEBHOOK_SECRET`.

Events handled:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

### Production webhook

In Stripe Dashboard → Webhooks → Add endpoint:
- URL: `https://yourdomain.com/api/webhooks/stripe`
- Events: select all 5 events listed above
- Copy the signing secret → set `STRIPE_WEBHOOK_SECRET` in production env

---

## Database

### Schema

The schema lives in `src/db/schema.ts` and includes:

| Table | Description |
|---|---|
| `users` | Auth users (NextAuth compatible) |
| `accounts` | OAuth provider accounts |
| `sessions` | Active sessions |
| `verification_tokens` | Email verification |
| `workspaces` | Tenant workspace (1:1 with user for MVP) |
| `subscriptions` | Stripe subscription state |
| `projects` | Brief organization containers |
| `briefs` | Generated SEO briefs (markdown + JSON) |
| `usage_events` | Token usage and export tracking |
| `brief_exports` | Export history per brief |

### Commands

```bash
pnpm db:push      # Apply schema to database (no migration files)
pnpm db:migrate   # Run migration files (if using drizzle-kit migrate)
pnpm db:seed      # Seed demo workspace and sample briefs
pnpm db:studio    # Open Drizzle Studio (visual DB browser)
```

---

## Demo Account

After seeding (`pnpm db:seed`), a demo account is created:

| Field | Value |
|---|---|
| Email | `demo@nichebriefs.com` |
| Password | `demo` |
| Workspace | Summit Local SEO |
| Projects | Desert Air Pros (Phoenix), NorthStar HVAC (Minneapolis), Blue Ridge (Asheville) |
| Sample briefs | 4 fully generated briefs |

---

## Brief Generation

Briefs are generated via OpenAI `gpt-4o` using a structured HVAC-specific prompt (`PROMPT_VERSION = "hvac-v1"`).

Each brief includes 13 sections:
1. SEO title (primary + alternatives)
2. Meta description
3. Recommended H1
4. URL slug
5. Search intent analysis
6. H2/H3 content outline
7. Local SEO recommendations
8. HVAC talking points
9. Competitor angle notes
10. FAQ ideas (5–8)
11. Internal link suggestions
12. CTA recommendations
13. Writer instructions

**Cost per brief:** ~2,000–4,000 tokens ≈ $0.01–0.04 with `gpt-4o`.

---

## Production Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add all environment variables in Vercel dashboard
4. Set `NEXT_PUBLIC_APP_URL` to your production domain (e.g. `https://yourdomain.com`)
5. Deploy

### Neon (database)

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the connection string → set `DATABASE_URL`
3. Run `pnpm db:push` against production DB once

---

## Project Structure

```
src/
  app/
    (app)/          # Authenticated app shell (sidebar layout)
      dashboard/
      briefs/
      projects/
      settings/
    (auth)/         # Auth pages (no sidebar)
      sign-in/
      sign-up/
    api/            # API routes
      briefs/
      projects/
      billing/
      webhooks/
    page.tsx        # Landing page (redirects to /dashboard if logged in)
  components/
    briefs/         # Brief-specific UI (form, editor, dashboard list)
    layout/         # Sidebar, header
    projects/       # Projects UI
    shared/         # Settings
    ui/             # Design system primitives (Button, Input, Card, etc.)
  db/
    schema.ts       # Drizzle schema (all tables)
    index.ts        # DB connection
    seed.ts         # Demo data seeder
  lib/
    auth.ts         # NextAuth config + workspace helpers
    openai.ts       # OpenAI client
    prompt.ts       # HVAC brief prompt builder
    stripe.ts       # Stripe client
    utils.ts        # Shared utilities
  middleware.ts     # Route protection
  types/
    index.ts        # HVAC service types, page types, search intents
```

---

## License

Commercial license — all rights reserved. See purchase agreement for terms.
