"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, FolderOpen, Pencil, Trash2, MapPin, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import type { Project, Brief } from "@/db/schema";
import Link from "next/link";

type ProjectWithBriefs = Project & { briefs: Brief[] };

interface ProjectsClientProps {
  projects: ProjectWithBriefs[];
}

interface ProjectFormData {
  name: string;
  defaultCity: string;
  defaultServiceArea: string;
  notes: string;
}

const empty: ProjectFormData = { name: "", defaultCity: "", defaultServiceArea: "", notes: "" };

export function ProjectsClient({ projects: initial }: ProjectsClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [projects, setProjects] = useState(initial);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<ProjectFormData>(empty);
  const [saving, setSaving] = useState(false);

  function openNew() {
    setEditing(null);
    setForm(empty);
    setDialogOpen(true);
  }

  function openEdit(p: Project) {
    setEditing(p);
    setForm({
      name: p.name,
      defaultCity: p.defaultCity ?? "",
      defaultServiceArea: p.defaultServiceArea ?? "",
      notes: p.notes ?? "",
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/projects/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        setProjects((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...data.project } : p)));
        toast({ title: "Project updated" });
      } else {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        setProjects((prev) => [...prev, { ...data.project, briefs: [] }]);
        toast({ title: "Project created" });
      }
      setDialogOpen(false);
      router.refresh();
    } catch {
      toast({ title: "Error", description: "Could not save project.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this project? Briefs will remain but won't be assigned to it.")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    setProjects((prev) => prev.filter((p) => p.id !== id));
    toast({ title: "Project deleted" });
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-[#0F172A]">Projects</h2>
          <p className="text-sm text-slate-500 mt-0.5">Group briefs by client or campaign</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-14 w-14 rounded-full bg-[#EFF6FF] flex items-center justify-center mb-4">
            <FolderOpen className="h-6 w-6 text-[#2563EB]" />
          </div>
          <h3 className="text-lg font-semibold text-[#0F172A] mb-1">No projects yet</h3>
          <p className="text-sm text-slate-500 max-w-xs mb-6">
            Create a project to group briefs by client or campaign.
          </p>
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" />
            Create first project
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((p) => (
            <Card key={p.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{p.name}</CardTitle>
                    {(p.defaultCity || p.defaultServiceArea) && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <span className="text-xs text-slate-500">
                          {[p.defaultCity, p.defaultServiceArea].filter(Boolean).join(" · ")}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}>
                      <Pencil className="h-3.5 w-3.5 text-slate-400" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-slate-400" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {(p.notes || p.briefs.length > 0) && (
                <CardContent className="pt-0">
                  {p.notes && <p className="text-sm text-slate-500 mb-3">{p.notes}</p>}
                  {p.briefs.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Recent briefs</p>
                      <div className="space-y-1.5">
                        {p.briefs.map((b) => (
                          <Link key={b.id} href={`/briefs/${b.id}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-[#2563EB] transition-colors">
                            <FileText className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            {b.title}
                            <Badge variant="secondary" className="ml-auto text-xs">{b.status}</Badge>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {p.briefs.length === 0 && (
                    <p className="text-xs text-slate-400">No briefs yet</p>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit project" : "New project"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update project details." : "Create a project to group client briefs."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Project / client name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Desert Air Pros" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Default city</Label>
                <Input value={form.defaultCity} onChange={(e) => setForm({ ...form, defaultCity: e.target.value })} placeholder="Phoenix" />
              </div>
              <div className="space-y-1.5">
                <Label>Service area</Label>
                <Input value={form.defaultServiceArea} onChange={(e) => setForm({ ...form, defaultServiceArea: e.target.value })} placeholder="Phoenix, Mesa, Tempe" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Family-owned HVAC company…" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.name.trim()}>
              {saving ? "Saving…" : editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
