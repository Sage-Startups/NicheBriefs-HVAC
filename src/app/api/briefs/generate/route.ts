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

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "not-set") {
    return NextResponse.json(
      { error: "OpenAI API key not configured. Set OPENAI_API_KEY in your environment." },
      { status: 503 }
    );
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

  const promptInput = { primaryKeyword, targetCity, serviceType, pageType, searchIntent, competitorInput, internalLinksInput, clientNotes };
  const systemPrompt = buildHvacBriefPrompt(promptInput);
  const title = buildBriefTitle(promptInput);

  let generatedJson: GeneratedBriefJson;
  let modelUsed = "gpt-4o";
  let inputTokens: number | undefined;
  let outputTokens: number | undefined;

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
    return NextResponse.json({ error: `AI generation failed: ${message}` }, { status: 500 });
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
