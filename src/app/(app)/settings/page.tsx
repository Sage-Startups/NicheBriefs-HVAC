import { auth } from "@/lib/auth";
import { getCurrentWorkspace } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Header } from "@/components/layout/header";
import { SettingsClient } from "@/components/shared/settings-client";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const workspace = await getCurrentWorkspace(session.user.id);
  if (!workspace) redirect("/sign-in");

  const user = await db.query.users.findFirst({ where: eq(users.id, session.user.id) });
  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.workspaceId, workspace.id),
  });

  return (
    <div className="flex flex-col h-full">
      <Header title="Settings" user={session.user} />
      <div className="flex-1 overflow-auto">
        <SettingsClient
          user={{ name: user?.name ?? null, email: user?.email ?? "" }}
          workspace={{ name: workspace.name }}
          subscription={subscription ?? null}
          stripeConfigured={!!process.env.STRIPE_SECRET_KEY && !!process.env.STRIPE_PRICE_ID}
        />
      </div>
    </div>
  );
}
