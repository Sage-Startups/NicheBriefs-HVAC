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
              Start free trial
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/demo">
            <Button variant="outline" size="lg">View demo</Button>
          </Link>
        </div>
        <p className="mt-4 text-xs text-slate-400">
          No credit card required ·{" "}
          <Link href="/sign-in" className="hover:underline">Sign in</Link>
        </p>
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
              <span className="text-xs text-slate-400">sample preview — ac-repair-phoenix</span>
            </div>
          </div>
          {/* Mock brief content */}
          <div className="p-5 sm:p-7 font-mono text-sm text-[#334155] leading-relaxed space-y-3 max-h-[460px] overflow-y-auto">
            <div className="text-[#0F172A] font-bold text-base">AC Repair in Phoenix SEO Brief</div>

            <div className="border-t border-[#E2E8F0] pt-3 space-y-1">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">SEO Title</div>
              <div className="text-[#2563EB] font-medium">AC Repair in Phoenix, AZ | Fast &amp; Reliable Service</div>
              <div className="text-xs text-slate-400">→ Alt: Phoenix AC Repair — Same-Day Emergency HVAC Service</div>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Meta Description</div>
              <div className="text-xs text-slate-600 leading-relaxed">Need AC repair in Phoenix? Our licensed technicians respond fast — available 24/7. Serving Phoenix, Scottsdale &amp; Mesa. Call now for a free estimate.</div>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">URL Slug</div>
              <div className="text-[#14B8A6]">/ac-repair-phoenix</div>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">H1</div>
              <div>Phoenix AC Repair — Fast, Reliable Service When You Need It Most</div>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Search Intent Analysis</div>
              <div className="text-xs text-slate-500 leading-relaxed">Searcher needs same-day AC repair in Phoenix during extreme summer heat. Page must show 24/7 availability, fast contact, and local expertise.</div>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Content Outline</div>
              <div className="text-slate-500">Why Phoenix AC Repairs Can't Wait</div>
              <div className="text-slate-500">Common AC Problems We Fix in Phoenix</div>
              <div className="text-slate-500">Our Phoenix AC Repair Process</div>
              <div className="text-slate-500">AC Repair Costs in Phoenix</div>
              <div className="text-slate-400 text-xs mt-0.5">+ 3 more H2 sections</div>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Required Talking Points</div>
              <div className="text-xs text-slate-500">• Arizona summer heat and AC failure health risks</div>
              <div className="text-xs text-slate-500">• AC units serviced: central, mini-splits, heat pumps</div>
              <div className="text-xs text-slate-500">• AZ ROC contractor license — verify &amp; display</div>
              <div className="text-slate-400 text-xs mt-0.5">+ 7 more talking points</div>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Competitor Angle Notes</div>
              <div className="text-xs text-slate-500">No competitor URLs provided — treated as reference labels only, not crawled or analyzed.</div>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Internal Link Suggestions</div>
              <div className="text-xs text-slate-500">→ /ac-installation-phoenix · /hvac-maintenance · /emergency-hvac-service</div>
            </div>

            <div className="text-xs text-slate-400 pt-1 border-t border-[#E2E8F0] mt-1">
              + FAQs (7 questions) · Local SEO recs (6 items) · CTAs (4) · Writer instructions
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

      {/* Pricing */}
      <section className="bg-white border-t border-[#E2E8F0] py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-2xl font-bold text-[#0F172A] text-center mb-2">
            Simple, transparent pricing
          </h2>
          <p className="text-slate-500 text-center mb-10">Start free. Upgrade when you need unlimited generation.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card className="border-[#E2E8F0]">
              <CardContent className="pt-6 pb-6">
                <div className="mb-5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Trial</p>
                  <p className="text-3xl font-bold text-[#0F172A]">Free</p>
                  <p className="text-sm text-slate-500 mt-1">Explore the full feature set</p>
                </div>
                <ul className="space-y-2 text-sm text-slate-600 mb-6">
                  {[
                    "Full access to all features",
                    "Generate HVAC SEO briefs",
                    "Projects & export tools",
                    "No credit card required",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#14B8A6] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up">
                  <Button variant="outline" className="w-full">Start free trial</Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="border-[#2563EB] shadow-sm">
              <CardContent className="pt-6 pb-6">
                <div className="mb-5">
                  <p className="text-xs font-semibold text-[#2563EB] uppercase tracking-wider mb-1">Pro</p>
                  <p className="text-3xl font-bold text-[#0F172A]">$49<span className="text-base font-normal text-slate-400">/mo</span></p>
                  <p className="text-sm text-slate-500 mt-1">Unlimited brief generation</p>
                </div>
                <ul className="space-y-2 text-sm text-slate-600 mb-6">
                  {[
                    "Everything in Trial",
                    "Unlimited brief generation",
                    "Email support",
                    "Early access to new features",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#14B8A6] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up">
                  <Button className="w-full">Get started</Button>
                </Link>
              </CardContent>
            </Card>
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
      <footer className="border-t border-[#E2E8F0] bg-white py-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Wind className="h-3.5 w-3.5 text-[#2563EB]" />
              <span>NicheBriefs HVAC — HVAC SEO Brief Generator</span>
            </div>
            <nav className="flex items-center gap-4 text-xs text-slate-400">
              <Link href="/sign-in" className="hover:text-[#2563EB] transition-colors">Sign in</Link>
              <Link href="/sign-up" className="hover:text-[#2563EB] transition-colors">Sign up</Link>
              <Link href="/terms" className="hover:text-[#2563EB] transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-[#2563EB] transition-colors">Privacy</Link>
              <a href="mailto:hello@nichebriefs.com" className="hover:text-[#2563EB] transition-colors">Support</a>
            </nav>
          </div>
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
