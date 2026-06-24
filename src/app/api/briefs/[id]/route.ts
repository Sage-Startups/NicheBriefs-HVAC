export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { auth, getCurrentWorkspace } from "@/lib/auth";
import { db } from "@/db";
import { briefs } from "@/db/schema";
import { eq, and } from "drizzle-orm";

async function getBriefForWorkspace(briefId: string, workspaceId: string) {
  return db.query.briefs.findFirst({
    where: and(eq(briefs.id, briefId), eq(briefs.workspaceId, workspaceId)),
    with: { project: true },
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspace = await getCurrentWorkspace(session.user.id);
  if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });

  const brief = await getBriefForWorkspace(id, workspace.id);
  if (!brief) return NextResponse.json({ error: "Brief not found" }, { status: 404 });

  return NextResponse.json({ brief });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspace = await getCurrentWorkspace(session.user.id);
  if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });

  const existing = await getBriefForWorkspace(id, workspace.id);
  if (!existing) return NextResponse.json({ error: "Brief not found" }, { status: 404 });

  const body = await req.json();
  const allowed = ["title", "generatedBriefMarkdown", "generatedBriefJson", "status", "projectId", "clientNotes"];
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  for (const key of allowed) {
    if (key in body) updates[key === "generatedBriefMarkdown" ? "generatedBriefMarkdown" : key] = body[key];
  }

  // Map camelCase body fields to DB columns
  const dbUpdates: Record<string, unknown> = { updatedAt: new Date() };
  if ("title" in body) dbUpdates.title = body.title;
  if ("generatedBriefMarkdown" in body) dbUpdates.generatedBriefMarkdown = body.generatedBriefMarkdown;
  if ("generatedBriefJson" in body) dbUpdates.generatedBriefJson = body.generatedBriefJson;
  if ("status" in body) dbUpdates.status = body.status;
  if ("projectId" in body) dbUpdates.projectId = body.projectId;
  if ("clientNotes" in body) dbUpdates.clientNotes = body.clientNotes;

  // If content is being edited, update status
  if ("generatedBriefMarkdown" in body && existing.status === "generated") {
    dbUpdates.status = "edited";
  }

  const [updated] = await db
    .update(briefs)
    .set(dbUpdates)
    .where(and(eq(briefs.id, id), eq(briefs.workspaceId, workspace.id)))
    .returning();

  return NextResponse.json({ brief: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspace = await getCurrentWorkspace(session.user.id);
  if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });

  await db
    .update(briefs)
    .set({ status: "archived", updatedAt: new Date() })
    .where(and(eq(briefs.id, id), eq(briefs.workspaceId, workspace.id)));

  return NextResponse.json({ success: true });
}
