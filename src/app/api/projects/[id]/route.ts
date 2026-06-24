export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { auth, getCurrentWorkspace } from "@/lib/auth";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspace = await getCurrentWorkspace(session.user.id);
  if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });

  const body = await req.json();
  const { name, defaultCity, defaultServiceArea, notes } = body;

  const [updated] = await db.update(projects).set({
    ...(name && { name: name.trim() }),
    ...(defaultCity !== undefined && { defaultCity }),
    ...(defaultServiceArea !== undefined && { defaultServiceArea }),
    ...(notes !== undefined && { notes }),
    updatedAt: new Date(),
  }).where(and(eq(projects.id, id), eq(projects.workspaceId, workspace.id))).returning();

  if (!updated) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  return NextResponse.json({ project: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspace = await getCurrentWorkspace(session.user.id);
  if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });

  // Soft delete — briefs with this project_id will have project_id set to null (via schema's onDelete: set null)
  await db.update(projects).set({ archived: true, updatedAt: new Date() })
    .where(and(eq(projects.id, id), eq(projects.workspaceId, workspace.id)));

  return NextResponse.json({ success: true });
}
