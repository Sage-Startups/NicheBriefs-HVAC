"use client";

import { useState } from "react";
import { CreditCard, User, Building2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { formatDate } from "@/lib/utils";
import type { Subscription } from "@/db/schema";

interface SettingsClientProps {
  user: { name: string | null; email: string };
  workspace: { name: string };
  subscription: Subscription | null;
  stripeConfigured: boolean;
}

const STATUS_BADGE: Record<string, "green" | "amber" | "red" | "secondary"> = {
  active: "green",
  trialing: "amber",
  past_due: "red",
  canceled: "secondary",
  inactive: "secondary",
};

export function SettingsClient({ user, workspace, subscription, stripeConfigured }: SettingsClientProps) {
  const { toast } = useToast();
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);

  const isActive = subscription?.status === "active" || subscription?.status === "trialing";

  async function handleUpgrade() {
    setLoadingCheckout(true);
    try {
      const res = await fetch("/api/billing/create-checkout-session", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error(data.error);
    } catch (e) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Could not start checkout.", variant: "destructive" });
      setLoadingCheckout(false);
    }
  }

  async function handlePortal() {
    setLoadingPortal(true);
    try {
      const res = await fetch("/api/billing/create-portal-session", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error(data.error);
    } catch (e) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Could not open portal.", variant: "destructive" });
      setLoadingPortal(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-slate-400" />
            <CardTitle className="text-base">Account</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Row label="Name" value={user.name ?? "—"} />
          <Separator />
          <Row label="Email" value={user.email} />
        </CardContent>
      </Card>

      {/* Workspace */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-slate-400" />
            <CardTitle className="text-base">Workspace</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Row label="Name" value={workspace.name} />
        </CardContent>
      </Card>

      {/* Billing */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-slate-400" />
            <CardTitle className="text-base">Billing</CardTitle>
            <CardDescription className="ml-auto">NicheBriefs HVAC Pro</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Plan</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{subscription.planName ?? "Free"}</span>
                  <Badge variant={STATUS_BADGE[subscription.status] ?? "secondary"} className="capitalize">
                    {subscription.status}
                  </Badge>
                </div>
              </div>
              {subscription.currentPeriodEnd && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Current period ends</span>
                    <span className="text-sm">{formatDate(subscription.currentPeriodEnd)}</span>
                  </div>
                </>
              )}
              <Separator />
              {isActive && subscription.status === "active" ? (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  Subscription active
                </div>
              ) : subscription.status === "trialing" ? (
                <div className="flex items-center gap-2 text-amber-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  Trial active
                </div>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-slate-500">No active subscription.</p>
          )}

          {!stripeConfigured ? (
            <p className="text-xs text-slate-400 bg-slate-50 rounded-md p-3">
              Stripe is not configured. Set STRIPE_SECRET_KEY and STRIPE_PRICE_ID to enable billing.
            </p>
          ) : subscription?.status === "active" ? (
            <Button variant="outline" onClick={handlePortal} disabled={loadingPortal}>
              {loadingPortal && <Loader2 className="h-4 w-4 animate-spin" />}
              Manage billing
            </Button>
          ) : (
            <Button onClick={handleUpgrade} disabled={loadingCheckout}>
              {loadingCheckout && <Loader2 className="h-4 w-4 animate-spin" />}
              Upgrade to Pro
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-[#0F172A]">{value}</span>
    </div>
  );
}
