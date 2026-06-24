export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { auth, getCurrentWorkspace } from "@/lib/auth";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspace = await getCurrentWorkspace(session.user.id);
  if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });

  const results = await db.query.projects.findMany({
    where: and(eq(projects.workspaceId, workspace.id), eq(projects.archived, false)),
    with: { briefs: true },
    orderBy: (p, { asc }) => [asc(p.name)],
  });

  return NextResponse.json({ projects: results });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspace = await getCurrentWorkspace(session.user.id);
  if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });

  const body = await req.json();
  const { name, defaultCity, defaultServiceArea, notes } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Project name is required" }, { status: 400 });
  }

  const [project] = await db.insert(projects).values({
    workspaceId: workspace.id,
    name: name.trim(),
    defaultCity: defaultCity || null,
    defaultServiceArea: defaultServiceArea || null,
    notes: notes || null,
  }).returning();

  return NextResponse.json({ project }, { status: 201 });
}
