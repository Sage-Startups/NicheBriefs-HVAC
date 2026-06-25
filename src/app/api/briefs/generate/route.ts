export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { auth, getCurrentWorkspace } from "@/lib/auth";
import { db } from "@/db";
import { briefs, usageEvents } from "@/db/schema";
import { openai } from "@/lib/openai";
import { buildHvacBriefPrompt, buildBriefTitle, PROMPT_VERSION } from "@/lib/prompt";
import type { GeneratedBriefJson } from "@/types";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspace = await getCurrentWorkspace(session.user.id);
  if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });

  // Gate generation on subscription status
  const sub = workspace.subscriptions?.[0];
  const subStatus = sub?.status ?? "trialing";
  const canGenerate = subStatus === "trialing" || subStatus === "active";

  if (!canGenerate) {
    const message =
      subStatus === "past_due"
        ? "Your subscription payment is past due. Update your payment method in Settings → Billing to continue."
        : "Your subscription has ended. Upgrade to Pro in Settings → Billing to continue generating briefs.";
    return NextResponse.json({ error: message, code: "subscription_required" }, { status: 403 });
  }

  const body = await req.json();
  const {
    primaryKeyword,
    targetCity,
    serviceType,
    pageType,
    searchIntent,
    competitorInput,
    internalLinksInput,
    clientNotes,
    projectId,
  } = body;

  if (!primaryKeyword || !serviceType || !pageType || !searchIntent) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // When no OpenAI key is configured, fall back to a deterministic demo brief
  // so buyers can test the full flow without an API key.
  const isDemoMode = !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "not-set";

  const promptInput = { primaryKeyword, targetCity, serviceType, pageType, searchIntent, competitorInput, internalLinksInput, clientNotes };
  const baseTitle = buildBriefTitle(promptInput);
  const title = isDemoMode ? `[Demo] ${baseTitle}` : baseTitle;

  let generatedJson: GeneratedBriefJson;
  let modelUsed = "gpt-4o";
  let inputTokens: number | undefined;
  let outputTokens: number | undefined;

  if (isDemoMode) {
    generatedJson = buildDemoBrief(promptInput);
    modelUsed = "demo";
  } else {
    const systemPrompt = buildHvacBriefPrompt(promptInput);
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: systemPrompt }],
        temperature: 0.4,
        response_format: { type: "json_object" },
      });

      const raw = completion.choices[0]?.message?.content ?? "{}";
      generatedJson = JSON.parse(raw) as GeneratedBriefJson;
      modelUsed = completion.model;
      inputTokens = completion.usage?.prompt_tokens;
      outputTokens = completion.usage?.completion_tokens;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Generation failed";
      console.error("[briefs/generate] OpenAI error:", message);
      return NextResponse.json({ error: `AI generation failed: ${message}` }, { status: 500 });
    }
  }

  // Validate that the required sections are present in the generated output
  const REQUIRED_SECTIONS = [
    "summary", "seoTitle", "metaDescription", "urlSlug", "h1",
    "searchIntentAnalysis", "contentOutline", "localSeoRecommendations",
    "requiredTalkingPoints", "competitorAngleNotes", "faqIdeas",
    "internalLinkSuggestions", "ctaRecommendations", "writerInstructions",
  ] as const;

  const missingSections = REQUIRED_SECTIONS.filter(
    (key) => !(generatedJson as unknown as Record<string, unknown>)[key]
  );

  if (missingSections.length > 4) {
    console.error("[briefs/generate] Too many missing sections:", missingSections.join(", "));
    return NextResponse.json(
      { error: `Brief generation incomplete — missing required sections: ${missingSections.join(", ")}. Please try again.` },
      { status: 500 }
    );
  }

  if (missingSections.length > 0) {
    console.warn("[briefs/generate] Some sections missing:", missingSections.join(", "));
  }

  const markdown = generateMarkdown(generatedJson, title);

  const [brief] = await db.insert(briefs).values({
    workspaceId: workspace.id,
    createdByUserId: session.user.id,
    projectId: projectId || null,
    title,
    status: "generated",
    primaryKeyword,
    targetCity: targetCity || null,
    serviceType,
    pageType,
    searchIntent,
    competitorInput: competitorInput || null,
    internalLinksInput: internalLinksInput || null,
    clientNotes: clientNotes || null,
    generatedBriefJson: generatedJson,
    generatedBriefMarkdown: markdown,
    modelUsed,
    promptVersion: PROMPT_VERSION,
  }).returning();

  const totalCents = inputTokens && outputTokens
    ? Math.round((inputTokens * 0.0025 + outputTokens * 0.01) / 1000 * 100)
    : null;

  await db.insert(usageEvents).values({
    workspaceId: workspace.id,
    userId: session.user.id,
    briefId: brief.id,
    eventType: "brief_generated",
    modelUsed,
    inputTokens: inputTokens ?? null,
    outputTokens: outputTokens ?? null,
    estimatedCostCents: totalCents,
  });

  return NextResponse.json({
    brief_id: brief.id,
    status: brief.status,
    generated_brief_markdown: markdown,
    generated_brief_json: generatedJson,
    is_demo: isDemoMode,
  });
}

function generateMarkdown(json: GeneratedBriefJson, title: string): string {
  const lines: string[] = [];
  lines.push(`# ${title}`);
  lines.push(`\n---\n`);

  lines.push(`## Brief Summary`);
  lines.push(`- **Keyword:** ${json.summary?.keyword ?? ""}`);
  lines.push(`- **Target City:** ${json.summary?.targetCity ?? ""}`);
  lines.push(`- **Service Type:** ${json.summary?.serviceType ?? ""}`);
  lines.push(`- **Page Type:** ${json.summary?.pageType ?? ""}`);
  lines.push(`- **Search Intent:** ${json.summary?.searchIntent ?? ""}`);

  lines.push(`\n## SEO Title`);
  lines.push(`**Primary:** ${json.seoTitle?.primary ?? ""}`);
  if (json.seoTitle?.alternatives?.length) {
    lines.push(`\n**Alternatives:**`);
    json.seoTitle.alternatives.forEach((a) => lines.push(`- ${a}`));
  }

  lines.push(`\n## Meta Description`);
  lines.push(json.metaDescription ?? "");

  lines.push(`\n## Suggested URL Slug`);
  lines.push(`\`/${json.urlSlug ?? ""}\``);

  lines.push(`\n## Recommended H1`);
  lines.push(json.h1 ?? "");

  lines.push(`\n## Search Intent Analysis`);
  lines.push(`**What the searcher wants:** ${json.searchIntentAnalysis?.whatSearcherWants ?? ""}`);
  lines.push(`\n**What the page must satisfy:** ${json.searchIntentAnalysis?.whatPageMustSatisfy ?? ""}`);

  lines.push(`\n## Content Outline`);
  (json.contentOutline ?? []).forEach(({ heading, level, notes }) => {
    const prefix = level === "h2" ? "##" : "###";
    lines.push(`${prefix} ${heading}`);
    if (notes) lines.push(`> ${notes}`);
  });

  lines.push(`\n## Local SEO Recommendations`);
  (json.localSeoRecommendations ?? []).forEach((r) => lines.push(`- ${r}`));

  lines.push(`\n## Required Talking Points`);
  (json.requiredTalkingPoints ?? []).forEach((p) => lines.push(`- ${p}`));

  lines.push(`\n## Competitor Angle Notes`);
  lines.push(json.competitorAngleNotes ?? "_No competitor data provided._");

  lines.push(`\n## FAQ Ideas`);
  (json.faqIdeas ?? []).forEach((q) => lines.push(`- ${q}`));

  lines.push(`\n## Internal Link Suggestions`);
  (json.internalLinkSuggestions ?? []).forEach((l) => lines.push(`- ${l}`));

  lines.push(`\n## CTA Recommendations`);
  (json.ctaRecommendations ?? []).forEach((c) => lines.push(`- ${c}`));

  lines.push(`\n## Writer Instructions`);
  lines.push(json.writerInstructions ?? "");

  lines.push(`\n---`);
  lines.push(`*Generated by NicheBriefs HVAC*`);

  return lines.join("\n");
}

function buildDemoBrief(input: {
  primaryKeyword: string;
  targetCity?: string;
  serviceType: string;
  pageType: string;
  searchIntent: string;
  competitorInput?: string;
  internalLinksInput?: string;
  clientNotes?: string;
}): GeneratedBriefJson {
  const city = input.targetCity || "your area";
  const kw = input.primaryKeyword;
  const service = input.serviceType;
  const toSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const slug = input.targetCity ? `${toSlug(kw)}-${toSlug(input.targetCity)}` : toSlug(kw);

  return {
    summary: {
      keyword: kw,
      targetCity: city,
      serviceType: service,
      pageType: input.pageType,
      searchIntent: input.searchIntent,
    },
    seoTitle: {
      primary: `${kw.charAt(0).toUpperCase() + kw.slice(1)} | ${service} in ${city}`,
      alternatives: [
        `${service} in ${city} — Trusted Local HVAC Experts`,
        `Best ${service} Near ${city} | Free Estimates`,
      ],
    },
    metaDescription: `Looking for ${kw} in ${city}? Our certified HVAC technicians deliver fast, reliable ${service.toLowerCase()} with upfront pricing. Serving ${city} and surrounding areas. Call today for a free estimate.`,
    urlSlug: slug,
    h1: `${service} in ${city} — Fast, Reliable Local HVAC Service`,
    searchIntentAnalysis: {
      whatSearcherWants: `The searcher needs ${kw.toLowerCase()} in ${city}. They are in-market and comparing local HVAC providers based on trust signals, response time, and pricing.`,
      whatPageMustSatisfy: `Clear phone number and CTA above the fold, transparent pricing or free estimate offer, trust signals (reviews, licensing, years in business), and local area references for ${city}.`,
    },
    contentOutline: [
      { heading: `Why ${city} Residents Trust Us for ${service}`, level: "h2", notes: "Highlight years in business, certifications, and local reputation" },
      { heading: `Common ${service} Issues We Solve`, level: "h2", notes: "List 5–7 specific problems your technicians handle" },
      { heading: `Our ${service} Process`, level: "h2", notes: "Step-by-step: diagnosis → transparent quote → work → follow-up" },
      { heading: `${service} Pricing in ${city}`, level: "h2", notes: "Provide ranges and emphasize free estimates — no hidden fees" },
      { heading: `Serving ${city} and Surrounding Areas`, level: "h2", notes: "List specific neighborhoods and suburbs in your service area" },
      { heading: `Frequently Asked Questions`, level: "h2", notes: "Answer the top questions homeowners ask before calling" },
    ],
    localSeoRecommendations: [
      `Include "${city}" and nearby neighborhood names throughout the page`,
      `Add LocalBusiness and Service schema markup`,
      `Embed a Google Maps service area section`,
      `Display verified customer reviews from ${city} homeowners`,
      `Show contractor license number prominently — verify with client before publishing`,
      `NAP (name, address, phone) must be consistent with Google Business Profile`,
    ],
    requiredTalkingPoints: [
      `Licensed, bonded, and insured HVAC technicians in ${city}`,
      `Fast response times — verify actual SLAs with client`,
      `Upfront, flat-rate pricing with no surprise charges`,
      `Factory-authorized for leading HVAC brands`,
      `Warranty on all ${service.toLowerCase()} work — verify exact terms with client`,
      input.clientNotes ? `Client context: ${input.clientNotes.slice(0, 120)}` : `Years in business and local credentials — verify with client`,
    ],
    competitorAngleNotes: input.competitorInput
      ? `Competitor reference provided: "${input.competitorInput.slice(0, 200)}". Focus differentiators on: response time, certifications, warranties, and local tenure.`
      : `No competitor data provided. Competitor URLs are treated as reference labels only — not crawled or analyzed. Focus on key differentiators: response time, certifications, warranties, and local tenure.`,
    faqIdeas: [
      `How much does ${kw} cost in ${city}?`,
      `How quickly can you respond to ${kw.toLowerCase()} requests in ${city}?`,
      `Do you offer emergency ${service.toLowerCase()} in ${city}?`,
      `What HVAC brands do you service?`,
      `Is your ${service.toLowerCase()} work guaranteed?`,
      `Do you offer financing for ${service.toLowerCase()}?`,
      `Are you licensed and insured in ${city}?`,
    ],
    internalLinkSuggestions: input.internalLinksInput
      ? input.internalLinksInput.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 5)
      : [
          `/services/${toSlug(service)}`,
          `/service-areas/${toSlug(city)}`,
          `/about`,
          `/contact`,
        ],
    ctaRecommendations: [
      `"Call Now for Fast ${service}" — hero section above the fold with phone number`,
      `"Get a Free Estimate" — after the pricing/process section`,
      `"Schedule Service Online" — mid-page form`,
      `"Read Our ${city} Reviews" — after the testimonials section`,
    ],
    writerInstructions: `Write for homeowners in ${city} searching for ${kw.toLowerCase()}. Use a confident, helpful, and locally aware tone. Avoid unexplained HVAC jargon. Target 1,200–1,800 words. Include at least 3 natural mentions of ${city} for local SEO. Label all pricing as estimates — verify exact figures with the client before publishing. Confirm contractor license and insurance status before the page goes live.\n\n⚠️ DEMO BRIEF: Generated using the demo fallback (no OpenAI API key configured). Add OPENAI_API_KEY to generate AI-powered briefs.`,
  };
}
