import { auth } from "@/lib/auth";
import { getCurrentWorkspace } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Header } from "@/components/layout/header";
import { NewBriefForm } from "@/components/briefs/new-brief-form";

export default async function NewBriefPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const workspace = await getCurrentWorkspace(session.user.id);
  if (!workspace) redirect("/sign-in");

  const projectList = await db.query.projects.findMany({
    where: eq(projects.workspaceId, workspace.id),
    orderBy: (p, { asc }) => [asc(p.name)],
  });

  return (
    <div className="flex flex-col h-full">
      <Header title="New Brief" description="Generate an HVAC SEO content brief" user={session.user} />
      <div className="flex-1 overflow-auto">
        <NewBriefForm projects={projectList} />
      </div>
    </div>
  );
}
