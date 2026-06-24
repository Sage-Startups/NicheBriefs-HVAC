"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, PlusCircle, FileText, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatRelative } from "@/lib/utils";
import { HVAC_SERVICE_TYPES, PAGE_CONTENT_TYPES } from "@/types";
import type { Brief, Project } from "@/db/schema";

type BriefWithProject = Brief & { project: Project | null };

interface DashboardClientProps {
  briefs: BriefWithProject[];
  projects: Project[];
}

const STATUS_COLORS: Record<string, "secondary" | "teal" | "amber" | "green"> = {
  draft: "secondary",
  generated: "teal",
  edited: "green",
};

export function DashboardClient({ briefs, projects }: DashboardClientProps) {
  const [search, setSearch] = useState("");
  const [serviceType, setServiceType] = useState("all");
  const [pageType, setPageType] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");

  const cities = useMemo(() => {
    const s = new Set<string>();
    briefs.forEach((b) => { if (b.targetCity) s.add(b.targetCity); });
    return Array.from(s).sort();
  }, [briefs]);

  const filtered = useMemo(() => {
    return briefs.filter((b) => {
      const matchSearch =
        !search ||
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.primaryKeyword.toLowerCase().includes(search.toLowerCase()) ||
        (b.targetCity?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchService = serviceType === "all" || b.serviceType === serviceType;
      const matchPage = pageType === "all" || b.pageType === pageType;
      const matchProject = projectFilter === "all" || b.projectId === projectFilter;
      const matchCity = cityFilter === "all" || b.targetCity === cityFilter;
      return matchSearch && matchService && matchPage && matchProject && matchCity;
    });
  }, [briefs, search, serviceType, pageType, projectFilter, cityFilter]);

  const hasActiveFilters = search || serviceType !== "all" || pageType !== "all" || projectFilter !== "all" || cityFilter !== "all";

  return (
    <div className="flex-1 overflow-auto p-6">
      {/* Actions row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-[#0F172A]">Your Briefs</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {briefs.length} brief{briefs.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link href="/briefs/new">
          <Button>
            <PlusCircle className="h-4 w-4" />
            New Brief
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search briefs, keywords, or city…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={serviceType} onValueChange={setServiceType}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Service type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All service types</SelectItem>
            {HVAC_SERVICE_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={pageType} onValueChange={setPageType}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Page type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All page types</SelectItem>
            {PAGE_CONTENT_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {projects.length > 0 && (
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {cities.length > 1 && (
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cities</SelectItem>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Brief list */}
      {briefs.length === 0 ? (
        <EmptyState />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="h-8 w-8 text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No briefs match your filters</p>
          <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filters</p>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSearch("");
                setServiceType("all");
                setPageType("all");
                setProjectFilter("all");
                setCityFilter("all");
              }}
            >
              Clear all filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((brief) => (
            <BriefRow key={brief.id} brief={brief} />
          ))}
        </div>
      )}
    </div>
  );
}

function BriefRow({ brief }: { brief: BriefWithProject }) {
  const statusColor = STATUS_COLORS[brief.status] ?? "secondary";
  return (
    <Link href={`/briefs/${brief.id}`}>
      <div className="group flex items-center justify-between rounded-lg border border-[#E2E8F0] bg-white px-5 py-4 hover:border-[#2563EB]/30 hover:shadow-sm transition-all cursor-pointer">
        <div className="flex items-start gap-3 min-w-0">
          <FileText className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="font-medium text-[#0F172A] truncate group-hover:text-[#2563EB] transition-colors">
              {brief.title}
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs text-slate-500">{brief.primaryKeyword}</span>
              {brief.targetCity && (
                <span className="text-xs text-slate-400">· {brief.targetCity}</span>
              )}
              {brief.project && (
                <span className="text-xs text-slate-400">· {brief.project.name}</span>
              )}
              <span className="text-xs text-slate-400">· {formatRelative(brief.updatedAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4 shrink-0">
          <Badge variant={statusColor} className="capitalize">{brief.status}</Badge>
          <span className="text-xs text-slate-400 hidden sm:block">{brief.serviceType}</span>
        </div>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EFF6FF] mb-4">
        <Wind className="h-6 w-6 text-[#2563EB]" />
      </div>
      <h3 className="text-lg font-semibold text-[#0F172A] mb-1">No briefs yet</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">
        Generate your first HVAC SEO content brief. Pick a keyword, service type, and location to get started.
      </p>
      <Link href="/briefs/new">
        <Button>
          <PlusCircle className="h-4 w-4" />
          Create your first brief
        </Button>
      </Link>
    </div>
  );
}
