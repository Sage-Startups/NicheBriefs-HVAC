"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Copy,
  Download,
  Printer,
  Copy as DuplicateIcon,
  Trash2,
  Save,
  Loader2,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { formatDate } from "@/lib/utils";
import type { Brief, Project } from "@/db/schema";

type BriefWithProject = Brief & { project: Project | null };

interface BriefEditorProps {
  brief: BriefWithProject;
}

export function BriefEditor({ brief }: BriefEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [content, setContent] = useState(brief.generatedBriefMarkdown ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  const handleContentChange = (val: string) => {
    setContent(val);
    setDirty(true);
    setSaved(false);
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await fetch(`/api/briefs/${brief.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generatedBriefMarkdown: content }),
      });
      setSaved(true);
      setDirty(false);
    } catch {
      toast({ title: "Save failed", description: "Could not save changes.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [brief.id, content, toast]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    await fetch(`/api/briefs/${brief.id}/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format: "clipboard" }),
    });
    toast({ title: "Copied to clipboard", variant: "default" });
  };

  const handleDownloadMd = async () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${brief.title.toLowerCase().replace(/\s+/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
    await fetch(`/api/briefs/${brief.id}/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format: "markdown" }),
    });
    toast({ title: "Downloaded as Markdown" });
  };

  const handlePrint = async () => {
    await fetch(`/api/briefs/${brief.id}/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format: "pdf" }),
    });
    window.print();
  };

  const handleDuplicate = async () => {
    const res = await fetch(`/api/briefs/${brief.id}/duplicate`, { method: "POST" });
    const data = await res.json();
    if (data.brief?.id) {
      toast({ title: "Brief duplicated" });
      router.push(`/briefs/${data.brief.id}`);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Archive this brief? It will be removed from your dashboard.")) return;
    await fetch(`/api/briefs/${brief.id}`, { method: "DELETE" });
    toast({ title: "Brief archived" });
    router.push("/dashboard");
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 no-print">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" />
              Dashboard
            </Button>
          </Link>
          <Separator orientation="vertical" className="h-4" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-[#0F172A]">{brief.title}</h2>
              <Badge variant={brief.status === "generated" ? "teal" : brief.status === "edited" ? "green" : "secondary"} className="capitalize">
                {brief.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {brief.serviceType} · {brief.pageType}
              {brief.project && ` · ${brief.project.name}`}
              {" · "}Updated {formatDate(brief.updatedAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="h-3.5 w-3.5" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadMd}>
            <Download className="h-3.5 w-3.5" />
            .md
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-3.5 w-3.5" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleDuplicate}>
            <DuplicateIcon className="h-3.5 w-3.5" />
            Duplicate
          </Button>
          <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-500 hover:text-red-600 hover:border-red-200">
            <Trash2 className="h-3.5 w-3.5" />
            Archive
          </Button>
          {dirty && (
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
              {saving ? "Saving…" : saved ? "Saved" : "Save"}
            </Button>
          )}
        </div>
      </div>

      {/* Brief metadata strip */}
      <div className="flex flex-wrap gap-x-6 gap-y-1.5 mb-6 p-4 rounded-lg bg-slate-50 border border-[#E2E8F0] text-sm no-print">
        <MetaItem label="Keyword" value={brief.primaryKeyword} />
        {brief.targetCity && <MetaItem label="City" value={brief.targetCity} />}
        <MetaItem label="Service" value={brief.serviceType} />
        <MetaItem label="Page type" value={brief.pageType} />
        <MetaItem label="Intent" value={brief.searchIntent} />
        {brief.modelUsed && <MetaItem label="Model" value={brief.modelUsed} />}
      </div>

      {/* Editable content area */}
      <div className="rounded-lg border border-[#E2E8F0] bg-white overflow-hidden print-full">
        {/* Print header */}
        <div className="hidden print:flex items-center gap-2 px-8 py-4 border-b border-[#E2E8F0]">
          <span className="font-semibold text-[#0F172A]">NicheBriefs HVAC</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-600">{brief.title}</span>
        </div>

        <textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          className="w-full min-h-[600px] p-8 font-mono text-sm text-[#0F172A] leading-relaxed resize-none focus:outline-none bg-white"
          placeholder="Brief content will appear here after generation…"
          spellCheck={false}
        />
      </div>

      <p className="text-xs text-slate-400 mt-3 no-print">
        Editing the brief content above will mark it as "edited". Use Save to persist changes.
      </p>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-slate-400 text-xs">{label}:</span>
      <span className="text-slate-700 font-medium text-xs">{value}</span>
    </div>
  );
}
