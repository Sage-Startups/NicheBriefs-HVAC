export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { auth, getCurrentWorkspace } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { stripe } from "@/lib/stripe";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const user = await db.query.users.findFirst({ where: eq(users.id, session.user.id) });
  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: "No billing account found" }, { status: 404 });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
  });

  return NextResponse.json({ url: portalSession.url });
}
