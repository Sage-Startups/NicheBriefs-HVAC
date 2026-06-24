import { auth } from "@/lib/auth";
import { getCurrentWorkspace } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/db";
import { briefs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { Header } from "@/components/layout/header";
import { BriefEditor } from "@/components/briefs/brief-editor";

export default async function BriefDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const workspace = await getCurrentWorkspace(session.user.id);
  if (!workspace) redirect("/sign-in");

  const brief = await db.query.briefs.findFirst({
    where: and(eq(briefs.id, id), eq(briefs.workspaceId, workspace.id)),
    with: { project: true },
  });

  if (!brief || brief.status === "archived") notFound();

  return (
    <div className="flex flex-col h-full">
      <Header title={brief.title} description={brief.serviceType} user={session.user} />
      <div className="flex-1 overflow-auto">
        <BriefEditor brief={brief} />
      </div>
    </div>
  );
}
