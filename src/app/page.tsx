import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Wind,
  ArrowRight,
  CheckCircle2,
  FileText,
  Zap,
  MapPin,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Nav */}
      <nav className="border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wind className="h-5 w-5 text-[#2563EB]" />
            <span className="font-semibold text-[#0F172A]">
              NicheBriefs <span className="text-[#2563EB]">HVAC</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 text-center">
        <Badge variant="teal" className="mb-4">Built for HVAC SEO agencies</Badge>
        <h1 className="text-4xl sm:text-5xl font-bold text-[#0F172A] tracking-tight leading-tight max-w-3xl mx-auto">
          Generate HVAC SEO briefs{" "}
          <span className="text-[#2563EB]">in minutes</span>
        </h1>
        <p className="mt-5 text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
          Structured, writer-ready SEO content briefs for HVAC local service pages, cost guides, comparison articles, and more. Built for SEO consultants and content agencies.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link href="/sign-up">
            <Button size="lg" className="gap-2">
              Start generating briefs
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button variant="outline" size="lg">Sign in</Button>
          </Link>
        </div>
        <p className="mt-4 text-xs text-slate-400">No credit card required · Demo mode available</p>
      </section>

      {/* Mock product preview */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm overflow-hidden">
          {/* Mock browser bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#E2E8F0] bg-slate-50">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-amber-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
            <div className="flex-1 mx-4 h-6 rounded bg-white border border-[#E2E8F0] flex items-center px-3">
              <span className="text-xs text-slate-400">nichebriefs.com/briefs/ac-repair-phoenix</span>
            </div>
          </div>
          {/* Mock brief content */}
          <div className="p-6 sm:p-8 font-mono text-sm text-[#334155] leading-relaxed space-y-4">
            <div className="text-[#0F172A] font-bold text-base">AC Repair in Phoenix SEO Brief</div>
            <div className="border-t border-[#E2E8F0] pt-4 space-y-2">
              <div><span className="text-slate-400">## SEO Title</span></div>
              <div className="text-[#2563EB] font-medium">AC Repair in Phoenix, AZ | Fast &amp; Reliable Service</div>
              <div className="text-xs text-slate-400">→ Alt: Phoenix AC Repair — Same-Day Emergency HVAC Service</div>
            </div>
            <div className="space-y-1">
              <div><span className="text-slate-400">## H1</span></div>
              <div>Phoenix AC Repair — Fast, Reliable Service When You Need It Most</div>
            </div>
            <div className="space-y-1">
              <div><span className="text-slate-400">## Content Outline</span></div>
              <div className="text-slate-500">Why Phoenix AC Repairs Can't Wait</div>
              <div className="text-slate-500">Common AC Problems We Fix in Phoenix</div>
              <div className="text-slate-500">Our AC Repair Process</div>
              <div className="text-slate-500">AC Repair Costs in Phoenix</div>
              <div className="text-slate-400 text-xs mt-1">+ local SEO recs · FAQs · CTAs · writer instructions</div>
            </div>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="bg-white border-t border-b border-[#E2E8F0] py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-2xl font-bold text-[#0F172A] text-center mb-2">
            Every HVAC content type covered
          </h2>
          <p className="text-slate-500 text-center mb-10">Generate briefs for the pages that drive HVAC leads</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {USE_CASES.map(({ icon: Icon, title, example }) => (
              <Card key={title} className="border-[#E2E8F0]">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="h-7 w-7 rounded-md bg-[#EFF6FF] flex items-center justify-center">
                      <Icon className="h-3.5 w-3.5 text-[#2563EB]" />
                    </div>
                    <span className="font-medium text-[#0F172A] text-sm">{title}</span>
                  </div>
                  <p className="text-xs text-slate-500">{example}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What's in a brief */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-2xl font-bold text-[#0F172A] text-center mb-2">
            Every brief includes 13 structured sections
          </h2>
          <p className="text-slate-500 text-center mb-10">Hand each brief directly to a writer</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl mx-auto">
            {BRIEF_SECTIONS.map((s) => (
              <div key={s} className="flex items-center gap-2.5 text-sm text-[#334155]">
                <CheckCircle2 className="h-4 w-4 text-[#14B8A6] shrink-0" />
                {s}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="bg-[#0F172A] py-16">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Ready to streamline your HVAC SEO workflow?</h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            One focused tool for HVAC content briefs. No generic AI fluff.
          </p>
          <Link href="/sign-up">
            <Button size="lg" variant="teal" className="gap-2">
              Start generating briefs
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] bg-white py-6">
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Wind className="h-3.5 w-3.5 text-[#2563EB]" />
            NicheBriefs HVAC
          </div>
          <p>HVAC SEO Brief Generator · Built for agencies</p>
        </div>
      </footer>
    </div>
  );
}

const USE_CASES = [
  { icon: MapPin, title: "Local service pages", example: "AC repair in Phoenix, furnace installation Minneapolis" },
  { icon: Zap, title: "Emergency repair pages", example: "24/7 emergency HVAC service, same-day AC repair" },
  { icon: FileText, title: "Cost guides", example: "Furnace installation cost, AC replacement pricing" },
  { icon: Wrench, title: "Maintenance guides", example: "Seasonal HVAC checklist, annual tune-up guide" },
  { icon: ArrowRight, title: "Comparison articles", example: "Heat pump vs furnace, AC brands compared" },
  { icon: CheckCircle2, title: "City/location pages", example: "HVAC services in [city], serving [service area]" },
];

const BRIEF_SECTIONS = [
  "SEO title (primary + alternatives)",
  "Meta description",
  "Recommended H1",
  "URL slug",
  "Search intent analysis",
  "H2/H3 content outline",
  "Local SEO recommendations",
  "HVAC talking points",
  "Competitor angle notes",
  "FAQ ideas (5–8)",
  "Internal link suggestions",
  "CTA recommendations",
  "Writer instructions",
];
