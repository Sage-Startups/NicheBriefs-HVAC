-- NicheBriefs HVAC — Schema Migration
-- Step 1: Run this FIRST in Neon Console → SQL Editor → Run
-- Step 2: Then run scripts/seed.sql

-- Enable pgcrypto for gen_random_uuid() if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── Users ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email           text NOT NULL UNIQUE,
  name            text,
  "emailVerified" timestamp,
  image           text,
  auth_provider   text,
  stripe_customer_id text,
  created_at      timestamp NOT NULL DEFAULT NOW(),
  updated_at      timestamp NOT NULL DEFAULT NOW()
);

-- ── NextAuth tables ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS accounts (
  user_id            uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type               text NOT NULL,
  provider           text NOT NULL,
  provider_account_id text NOT NULL,
  refresh_token      text,
  access_token       text,
  expires_at         integer,
  token_type         text,
  scope              text,
  id_token           text,
  session_state      text
);

CREATE TABLE IF NOT EXISTS sessions (
  "sessionToken" text PRIMARY KEY,
  "userId"       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires        timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier text NOT NULL,
  token      text NOT NULL UNIQUE,
  expires    timestamp NOT NULL
);

-- ── Workspaces ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workspaces (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES users(id),
  name          text NOT NULL,
  created_at    timestamp NOT NULL DEFAULT NOW(),
  updated_at    timestamp NOT NULL DEFAULT NOW()
);

-- ── Subscriptions ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id           uuid NOT NULL REFERENCES workspaces(id),
  stripe_subscription_id text,
  stripe_price_id        text,
  status                 text NOT NULL DEFAULT 'inactive',
  plan_name              text DEFAULT 'Free',
  current_period_end     timestamp,
  created_at             timestamp NOT NULL DEFAULT NOW(),
  updated_at             timestamp NOT NULL DEFAULT NOW()
);

-- ── Projects ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id         uuid NOT NULL REFERENCES workspaces(id),
  name                 text NOT NULL,
  default_city         text,
  default_service_area text,
  notes                text,
  archived             boolean NOT NULL DEFAULT false,
  created_at           timestamp NOT NULL DEFAULT NOW(),
  updated_at           timestamp NOT NULL DEFAULT NOW()
);

-- ── Briefs ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS briefs (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id            uuid NOT NULL REFERENCES workspaces(id),
  project_id              uuid REFERENCES projects(id) ON DELETE SET NULL,
  created_by_user_id      uuid NOT NULL REFERENCES users(id),
  title                   text NOT NULL,
  status                  text NOT NULL DEFAULT 'draft',
  primary_keyword         text NOT NULL,
  target_city             text,
  service_type            text NOT NULL,
  page_type               text NOT NULL,
  search_intent           text NOT NULL,
  competitor_input        text,
  internal_links_input    text,
  client_notes            text,
  generated_brief_json    jsonb,
  generated_brief_markdown text,
  model_used              text,
  prompt_version          text,
  created_at              timestamp NOT NULL DEFAULT NOW(),
  updated_at              timestamp NOT NULL DEFAULT NOW()
);

-- ── Brief Exports ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brief_exports (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id     uuid NOT NULL REFERENCES briefs(id),
  workspace_id uuid NOT NULL REFERENCES workspaces(id),
  format       text NOT NULL,
  created_at   timestamp NOT NULL DEFAULT NOW()
);

-- ── Usage Events ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usage_events (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id          uuid NOT NULL REFERENCES workspaces(id),
  user_id               uuid NOT NULL REFERENCES users(id),
  brief_id              uuid REFERENCES briefs(id) ON DELETE SET NULL,
  event_type            text NOT NULL,
  model_used            text,
  input_tokens          integer,
  output_tokens         integer,
  estimated_cost_cents  integer,
  created_at            timestamp NOT NULL DEFAULT NOW()
);
