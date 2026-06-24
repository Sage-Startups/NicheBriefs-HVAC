import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCurrentWorkspace } from "@/lib/auth";
import { db } from "@/db";
import { briefs, projects } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { Header } from "@/components/layout/header";
import { DashboardClient } from "@/components/briefs/dashboard-client";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const workspace = await getCurrentWorkspace(session.user.id);
  if (!workspace) redirect("/sign-in");

  const [recentBriefs, projectList] = await Promise.all([
    db.query.briefs.findMany({
      where: eq(briefs.workspaceId, workspace.id),
      with: { project: true },
      orderBy: [desc(briefs.updatedAt)],
      limit: 100,
    }),
    db.query.projects.findMany({
      where: and(eq(projects.workspaceId, workspace.id), eq(projects.archived, false)),
      orderBy: (p, { asc }) => [asc(p.name)],
    }),
  ]);

  const nonArchived = recentBriefs.filter((b) => b.status !== "archived");

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Dashboard"
        description={workspace.name}
        user={session.user}
      />
      <DashboardClient briefs={nonArchived} projects={projectList} />
    </div>
  );
}
