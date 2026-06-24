export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { auth, getCurrentWorkspace } from "@/lib/auth";
import { db } from "@/db";
import { briefs } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspace = await getCurrentWorkspace(session.user.id);
  if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });

  const original = await db.query.briefs.findFirst({
    where: and(eq(briefs.id, id), eq(briefs.workspaceId, workspace.id)),
  });
  if (!original) return NextResponse.json({ error: "Brief not found" }, { status: 404 });

  const { id: _id, createdAt, updatedAt, ...rest } = original;
  const [duplicate] = await db.insert(briefs).values({
    ...rest,
    title: `${original.title} (Copy)`,
    status: "generated",
  }).returning();

  return NextResponse.json({ brief: duplicate }, { status: 201 });
}
