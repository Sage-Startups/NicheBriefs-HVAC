import { auth } from "@/lib/auth";
import { getCurrentWorkspace } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { projects, briefs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { Header } from "@/components/layout/header";
import { ProjectsClient } from "@/components/projects/projects-client";

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const workspace = await getCurrentWorkspace(session.user.id);
  if (!workspace) redirect("/sign-in");

  const projectList = await db.query.projects.findMany({
    where: and(eq(projects.workspaceId, workspace.id), eq(projects.archived, false)),
    with: {
      briefs: {
        where: (b, { ne }) => ne(b.status, "archived"),
        orderBy: (b, { desc }) => [desc(b.updatedAt)],
        limit: 5,
      },
    },
    orderBy: (p, { asc }) => [asc(p.name)],
  });

  return (
    <div className="flex flex-col h-full">
      <Header title="Projects" description="Organize briefs by client or project" user={session.user} />
      <div className="flex-1 overflow-auto">
        <ProjectsClient projects={projectList} />
      </div>
    </div>
  );
}
