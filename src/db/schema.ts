import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  // NextAuth required fields
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  // App-specific fields
  authProvider: text("auth_provider"),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// NextAuth required tables — column names must match @auth/drizzle-adapter expectations
export const accounts = pgTable("accounts", {
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull().unique(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// ─── Workspaces ───────────────────────────────────────────────────────────────

export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerUserId: uuid("owner_user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Subscriptions ────────────────────────────────────────────────────────────

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripePriceId: text("stripe_price_id"),
  status: text("status").notNull().default("inactive"),
  planName: text("plan_name").default("Free"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Projects ─────────────────────────────────────────────────────────────────

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id),
  name: text("name").notNull(),
  defaultCity: text("default_city"),
  defaultServiceArea: text("default_service_area"),
  notes: text("notes"),
  archived: boolean("archived").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Briefs ───────────────────────────────────────────────────────────────────

export const briefs = pgTable("briefs", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id),
  projectId: uuid("project_id").references(() => projects.id, {
    onDelete: "set null",
  }),
  createdByUserId: uuid("created_by_user_id")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  status: text("status").notNull().default("draft"),
  primaryKeyword: text("primary_keyword").notNull(),
  targetCity: text("target_city"),
  serviceType: text("service_type").notNull(),
  pageType: text("page_type").notNull(),
  searchIntent: text("search_intent").notNull(),
  competitorInput: text("competitor_input"),
  internalLinksInput: text("internal_links_input"),
  clientNotes: text("client_notes"),
  generatedBriefJson: jsonb("generated_brief_json"),
  generatedBriefMarkdown: text("generated_brief_markdown"),
  modelUsed: text("model_used"),
  promptVersion: text("prompt_version"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Brief Exports ────────────────────────────────────────────────────────────

export const briefExports = pgTable("brief_exports", {
  id: uuid("id").primaryKey().defaultRandom(),
  briefId: uuid("brief_id")
    .notNull()
    .references(() => briefs.id),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id),
  format: text("format").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Usage Events ─────────────────────────────────────────────────────────────

export const usageEvents = pgTable("usage_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  briefId: uuid("brief_id").references(() => briefs.id, {
    onDelete: "set null",
  }),
  eventType: text("event_type").notNull(),
  modelUsed: text("model_used"),
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  estimatedCostCents: integer("estimated_cost_cents"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  workspaces: many(workspaces),
  briefs: many(briefs),
  usageEvents: many(usageEvents),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(users, { fields: [workspaces.ownerUserId], references: [users.id] }),
  subscriptions: many(subscriptions),
  projects: many(projects),
  briefs: many(briefs),
  usageEvents: many(usageEvents),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  workspace: one(workspaces, { fields: [projects.workspaceId], references: [workspaces.id] }),
  briefs: many(briefs),
}));

export const briefsRelations = relations(briefs, ({ one, many }) => ({
  workspace: one(workspaces, { fields: [briefs.workspaceId], references: [workspaces.id] }),
  project: one(projects, { fields: [briefs.projectId], references: [projects.id] }),
  createdBy: one(users, { fields: [briefs.createdByUserId], references: [users.id] }),
  exports: many(briefExports),
  usageEvents: many(usageEvents),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Workspace = typeof workspaces.$inferSelect;
export type NewWorkspace = typeof workspaces.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Brief = typeof briefs.$inferSelect;
export type NewBrief = typeof briefs.$inferInsert;
export type BriefExport = typeof briefExports.$inferSelect;
export type UsageEvent = typeof usageEvents.$inferSelect;
