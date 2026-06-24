export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { subscriptions, workspaces } from "@/db/schema";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!process.env.STRIPE_WEBHOOK_SECRET || !sig) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const workspaceId = ((event.data.object as any)?.metadata?.workspaceId) as string | undefined;

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const wId = session.metadata?.workspaceId;
      if (wId && session.subscription) {
        await upsertSubscription(wId, session.subscription as string, "active");
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const wId = sub.metadata?.workspaceId;
      if (wId) {
        await upsertSubscription(wId, sub.id, sub.status, sub.items.data[0]?.price?.id, sub.current_period_end);
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const wId = sub.metadata?.workspaceId;
      if (wId) {
        await db.update(subscriptions).set({ status: "canceled", updatedAt: new Date() })
          .where(eq(subscriptions.workspaceId, wId));
      }
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.subscription) {
        await db.update(subscriptions).set({ status: "past_due", updatedAt: new Date() })
          .where(eq(subscriptions.stripeSubscriptionId, invoice.subscription as string));
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

async function upsertSubscription(
  workspaceId: string,
  stripeSubscriptionId: string,
  status: string,
  stripePriceId?: string,
  periodEnd?: number
) {
  const existing = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.workspaceId, workspaceId),
  });

  const values = {
    stripeSubscriptionId,
    status,
    planName: "Pro",
    stripePriceId: stripePriceId ?? null,
    currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
    updatedAt: new Date(),
  };

  if (existing) {
    await db.update(subscriptions).set(values).where(eq(subscriptions.workspaceId, workspaceId));
  } else {
    await db.insert(subscriptions).values({ workspaceId, ...values });
  }
}
