export const HVAC_SERVICE_TYPES = [
  "AC repair",
  "AC installation",
  "Furnace repair",
  "Furnace installation",
  "Heat pump service",
  "HVAC maintenance",
  "Emergency HVAC service",
  "Duct cleaning",
  "Indoor air quality",
  "Commercial HVAC",
] as const;

export const PAGE_CONTENT_TYPES = [
  "Local service page",
  "City/location page",
  "Emergency repair page",
  "Cost guide",
  "Comparison article",
  "Seasonal maintenance guide",
  "Informational blog post",
] as const;

export const SEARCH_INTENTS = [
  "Emergency service",
  "Repair",
  "Installation",
  "Cost research",
  "Comparison",
  "Maintenance",
  "Local provider research",
] as const;

export const BRIEF_STATUSES = ["draft", "generated", "edited", "archived"] as const;
export const SUBSCRIPTION_STATUSES = ["trialing", "active", "past_due", "canceled", "inactive"] as const;
export const EXPORT_FORMATS = ["markdown", "pdf", "clipboard"] as const;
export const USAGE_EVENT_TYPES = ["brief_generated", "brief_regenerated", "brief_exported"] as const;

export type HvacServiceType = (typeof HVAC_SERVICE_TYPES)[number];
export type PageContentType = (typeof PAGE_CONTENT_TYPES)[number];
export type SearchIntent = (typeof SEARCH_INTENTS)[number];
export type BriefStatus = (typeof BRIEF_STATUSES)[number];
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];
export type ExportFormat = (typeof EXPORT_FORMATS)[number];
export type UsageEventType = (typeof USAGE_EVENT_TYPES)[number];

export interface BriefSummary {
  keyword: string;
  targetCity: string;
  serviceType: string;
  pageType: string;
  searchIntent: string;
}

export interface GeneratedBriefJson {
  summary: BriefSummary;
  seoTitle: { primary: string; alternatives: string[] };
  metaDescription: string;
  urlSlug: string;
  h1: string;
  searchIntentAnalysis: { whatSearcherWants: string; whatPageMustSatisfy: string };
  contentOutline: { heading: string; level: "h2" | "h3"; notes?: string }[];
  localSeoRecommendations: string[];
  requiredTalkingPoints: string[];
  competitorAngleNotes: string;
  faqIdeas: string[];
  internalLinkSuggestions: string[];
  ctaRecommendations: string[];
  writerInstructions: string;
}

export interface BriefFormValues {
  primaryKeyword: string;
  targetCity: string;
  serviceType: HvacServiceType;
  pageType: PageContentType;
  searchIntent: SearchIntent;
  competitorInput: string;
  internalLinksInput: string;
  clientNotes: string;
  projectId?: string;
}
