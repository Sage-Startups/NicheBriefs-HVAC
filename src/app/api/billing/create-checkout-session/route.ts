export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { auth, getCurrentWorkspace } from "@/lib/auth";
import { db } from "@/db";
import { users, subscriptions } from "@/db/schema";
import { stripe } from "@/lib/stripe";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const workspace = await getCurrentWorkspace(session.user.id);
  if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });

  const user = await db.query.users.findFirst({ where: eq(users.id, session.user.id) });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: { userId: user.id, workspaceId: workspace.id },
    });
    customerId = customer.id;
    await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, user.id));
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?billing=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?billing=cancelled`,
    metadata: { workspaceId: workspace.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
