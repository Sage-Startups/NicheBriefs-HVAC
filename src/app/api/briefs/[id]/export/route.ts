export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { auth, getCurrentWorkspace } from "@/lib/auth";
import { db } from "@/db";
import { briefs, briefExports, usageEvents } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspace = await getCurrentWorkspace(session.user.id);
  if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });

  const brief = await db.query.briefs.findFirst({
    where: and(eq(briefs.id, id), eq(briefs.workspaceId, workspace.id)),
  });
  if (!brief) return NextResponse.json({ error: "Brief not found" }, { status: 404 });

  const { format } = await req.json();
  if (!["markdown", "pdf", "clipboard"].includes(format)) {
    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  }

  await db.insert(briefExports).values({
    briefId: id,
    workspaceId: workspace.id,
    format,
  });

  await db.insert(usageEvents).values({
    workspaceId: workspace.id,
    userId: session.user.id,
    briefId: id,
    eventType: "brief_exported",
  });

  return NextResponse.json({ success: true });
}
