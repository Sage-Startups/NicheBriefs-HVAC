"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { HVAC_SERVICE_TYPES, PAGE_CONTENT_TYPES, SEARCH_INTENTS } from "@/types";
import type { Project } from "@/db/schema";

interface NewBriefFormProps {
  projects: Project[];
}

export function NewBriefForm({ projects }: NewBriefFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [primaryKeyword, setPrimaryKeyword] = useState("");
  const [targetCity, setTargetCity] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [pageType, setPageType] = useState("");
  const [searchIntent, setSearchIntent] = useState("");
  const [competitorInput, setCompetitorInput] = useState("");
  const [internalLinksInput, setInternalLinksInput] = useState("");
  const [clientNotes, setClientNotes] = useState("");
  const [projectId, setProjectId] = useState("none");

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!primaryKeyword || !serviceType || !pageType || !searchIntent) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/briefs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryKeyword,
          targetCity,
          serviceType,
          pageType,
          searchIntent,
          competitorInput,
          internalLinksInput,
          clientNotes,
          projectId: projectId === "none" ? undefined : projectId,
        }),
      });
      const data = await res.json();
      if (res.status === 403) {
        toast({
          title: "Upgrade required",
          description: (data.error ?? "Upgrade to Pro to continue generating briefs.") + " Go to Settings → Billing.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      router.push(`/briefs/${data.brief_id}`);
    } catch (err) {
      toast({
        title: "Generation failed",
        description: err instanceof Error ? err.message : "An error occurred. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <form onSubmit={handleGenerate}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Inputs (3 cols) */}
          <div className="lg:col-span-3 space-y-5">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Brief Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="keyword">
                    Primary keyword <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="keyword"
                    placeholder="e.g. ac repair phoenix"
                    value={primaryKeyword}
                    onChange={(e) => setPrimaryKeyword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="city">Target city / service area</Label>
                  <Input
                    id="city"
                    placeholder="e.g. Phoenix, AZ"
                    value={targetCity}
                    onChange={(e) => setTargetCity(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>
                      HVAC service type <span className="text-red-500">*</span>
                    </Label>
                    <Select value={serviceType} onValueChange={setServiceType} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select service…" />
                      </SelectTrigger>
                      <SelectContent>
                        {HVAC_SERVICE_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>
                      Page / content type <span className="text-red-500">*</span>
                    </Label>
                    <Select value={pageType} onValueChange={setPageType} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type…" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAGE_CONTENT_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>
                    Search intent <span className="text-red-500">*</span>
                  </Label>
                  <Select value={searchIntent} onValueChange={setSearchIntent} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select intent…" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEARCH_INTENTS.map((i) => (
                        <SelectItem key={i} value={i}>{i}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {projects.length > 0 && (
                  <div className="space-y-1.5">
                    <Label>Project / client</Label>
                    <Select value={projectId} onValueChange={setProjectId}>
                      <SelectTrigger>
                        <SelectValue placeholder="No project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No project</SelectItem>
                        {projects.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Optional Context</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="competitor">Competitor notes / URLs</Label>
                  <Textarea
                    id="competitor"
                    placeholder="Paste competitor URLs or notes. These are used as reference labels — not crawled or scraped."
                    value={competitorInput}
                    onChange={(e) => setCompetitorInput(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="internal">Internal link suggestions</Label>
                  <Textarea
                    id="internal"
                    placeholder="/services/ac-installation&#10;/services/hvac-maintenance"
                    value={internalLinksInput}
                    onChange={(e) => setInternalLinksInput(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="notes">Client / project notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Family-owned company, 20 years in business, focused on emergency repairs…"
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating brief… (30–60 seconds)
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate HVAC SEO Brief
                </>
              )}
            </Button>
          </div>

          {/* Right: Guidance (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-[#E2E8F0] bg-[#F8FAFC]">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-[#2563EB]" />
                  <CardTitle className="text-sm text-[#334155]">What you'll get</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  {[
                    "SEO title (primary + 2 alternatives)",
                    "Meta description",
                    "Recommended H1 and URL slug",
                    "Search intent analysis",
                    "H2/H3 content outline",
                    "Local SEO recommendations",
                    "HVAC-specific talking points",
                    "5–8 FAQ ideas",
                    "Internal link suggestions",
                    "CTA recommendations",
                    "Writer tone instructions",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#14B8A6] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-4">
                <p className="text-xs text-amber-700 leading-relaxed">
                  <strong>Note:</strong> Competitor URLs are treated as reference labels only — they are not crawled or scraped. Paste actual competitor content if you want it analyzed.
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#E2E8F0]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[#334155]">Example inputs</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-slate-500 space-y-2">
                <div><strong className="text-slate-700">Keyword:</strong> ac repair phoenix</div>
                <div><strong className="text-slate-700">City:</strong> Phoenix, AZ</div>
                <div><strong className="text-slate-700">Service:</strong> AC repair</div>
                <div><strong className="text-slate-700">Page type:</strong> Local service page</div>
                <div><strong className="text-slate-700">Intent:</strong> Emergency service</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xl p-8 max-w-sm w-full mx-4 text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="h-12 w-12 rounded-full border-4 border-[#EFF6FF] border-t-[#2563EB] animate-spin" />
              </div>
            </div>
            <h3 className="font-semibold text-[#0F172A] mb-1">Generating your brief…</h3>
            <p className="text-sm text-slate-500">
              Crafting HVAC-specific SEO content outline. This takes 30–60 seconds.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
