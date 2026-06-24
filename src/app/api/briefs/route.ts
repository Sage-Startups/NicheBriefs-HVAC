export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { briefs, workspaces } from "@/db/schema";
import { eq, and, ilike, desc } from "drizzle-orm";
import { getCurrentWorkspace } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspace = await getCurrentWorkspace(session.user.id);
  if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const serviceType = searchParams.get("service_type") ?? "";
  const pageType = searchParams.get("page_type") ?? "";
  const projectId = searchParams.get("project_id") ?? "";

  const conditions = [
    eq(briefs.workspaceId, workspace.id),
    // exclude archived
  ];

  const results = await db.query.briefs.findMany({
    where: and(
      eq(briefs.workspaceId, workspace.id),
      search ? ilike(briefs.title, `%${search}%`) : undefined,
      serviceType ? eq(briefs.serviceType, serviceType) : undefined,
      pageType ? eq(briefs.pageType, pageType) : undefined,
      projectId ? eq(briefs.projectId, projectId) : undefined
    ),
    with: { project: true },
    orderBy: [desc(briefs.updatedAt)],
  });

  // Filter out archived in JS (simpler than SQL for now)
  const filtered = results.filter((b) => b.status !== "archived");

  return NextResponse.json({ briefs: filtered });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspace = await getCurrentWorkspace(session.user.id);
  if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });

  const body = await req.json();
  const { primaryKeyword, targetCity, serviceType, pageType, searchIntent, competitorInput, internalLinksInput, clientNotes, projectId } = body;

  if (!primaryKeyword || !serviceType || !pageType || !searchIntent) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const title = `${serviceType}${targetCity ? ` in ${targetCity}` : ""} SEO Brief`;

  const [brief] = await db.insert(briefs).values({
    workspaceId: workspace.id,
    createdByUserId: session.user.id,
    projectId: projectId || null,
    title,
    status: "draft",
    primaryKeyword,
    targetCity: targetCity || null,
    serviceType,
    pageType,
    searchIntent,
    competitorInput: competitorInput || null,
    internalLinksInput: internalLinksInput || null,
    clientNotes: clientNotes || null,
  }).returning();

  return NextResponse.json({ brief }, { status: 201 });
}
