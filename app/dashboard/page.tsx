"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Project {
  id: string;
  name: string;
  domain: string;
  thesis: string | null;
  updatedAt: string;
  stages: { status: string }[];
  scores: { score: number }[];
  leanCanvas: Record<string, unknown> | null;
  pitchSections: { id: string }[];
}

const DOMAINS = [
  "fintech",
  "gaming",
  "streaming",
  "defi",
  "nft",
  "dao",
  "infrastructure",
  "other",
];

const CANVAS_FIELDS = [
  "problem",
  "solution",
  "uvp",
  "unfairAdvantage",
  "customerSegments",
  "existingAlternatives",
  "keyMetrics",
  "channels",
  "costStructure",
  "revenueStreams",
  "highLevelConcept",
  "earlyAdopters",
];

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("defi");
  const [thesis, setThesis] = useState("");

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => setProjects(data.projects ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          domain,
          thesis: thesis.trim() || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to create project");
      const data = await res.json();
      const newProject = data.project;
      router.push(
        `/project/${newProject.id}/ideation${thesis.trim() ? `?seed=${encodeURIComponent(thesis.trim())}` : ""}`,
      );
    } finally {
      setCreating(false);
    }
  }

  function getCompletedCount(stages: { status: string }[]) {
    return stages.filter((s) => s.status === "complete").length;
  }

  function getStressAvg(scores: { score: number }[]) {
    if (!scores.length) return null;
    const avg = scores.reduce((s, v) => s + v.score, 0) / scores.length;
    return Math.round(avg * 10) / 10;
  }

  function getCanvasFilled(canvas: Record<string, unknown> | null) {
    if (!canvas) return 0;
    return CANVAS_FIELDS.filter(
      (f) => typeof canvas[f] === "string" && (canvas[f] as string).trim(),
    ).length;
  }

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#00ff9d] border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading projects...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6 md:p-12 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-[#00ff9d] font-mono">FOUNDER</span>{" "}
            <span className="text-muted-foreground font-mono">OS</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-[#00ff9d] text-[#050505] hover:bg-[#00ff9d]/90 cursor-pointer">
            + New Project
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Project Name
                </label>
                <Input
                  placeholder="My Web3 Startup"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Domain
                </label>
                <Select
                  value={domain}
                  onValueChange={(val) => {
                    if (val) setDomain(val);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOMAINS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Thesis (optional)
                </label>
                <Textarea
                  placeholder="Describe your startup idea..."
                  value={thesis}
                  onChange={(e) => setThesis(e.target.value)}
                  rows={3}
                />
              </div>
              <Button
                onClick={handleCreate}
                disabled={!name.trim() || creating}
                className="w-full bg-[#00ff9d] text-[#050505] hover:bg-[#00ff9d]/90"
              >
                {creating ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-16 h-16 rounded-2xl border border-dashed border-[#00ff9d]/30 flex items-center justify-center mb-6">
            <span className="text-3xl">🚀</span>
          </div>
          <h2 className="text-lg font-medium mb-2">No projects yet</h2>
          <p className="text-muted-foreground text-sm max-w-sm mb-6">
            Create your first project and let your AI co-founder guide you
            through 13 stages from idea to launch.
          </p>
          <Button
            onClick={() => setOpen(true)}
            className="bg-[#00ff9d] text-[#050505] hover:bg-[#00ff9d]/90"
          >
            + Create First Project
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const completed = getCompletedCount(project.stages);
            const progress = Math.round((completed / 13) * 100);
            const stressAvg = getStressAvg(project.scores);
            const canvasFilled = getCanvasFilled(project.leanCanvas);
            const pitchCount = project.pitchSections?.length ?? 0;

            return (
              <Card
                key={project.id}
                className="cursor-pointer hover:border-[#00ff9d]/50 transition-colors group"
                onClick={() => router.push(`/project/${project.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg group-hover:text-[#00ff9d] transition-colors">
                      {project.name}
                    </CardTitle>
                    <Badge variant="secondary" className="text-[10px] shrink-0">
                      {project.domain}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {project.thesis && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.thesis}
                    </p>
                  )}

                  {/* Stats row */}
                  <div className="flex gap-3 text-xs">
                    {stressAvg !== null && (
                      <span
                        className={`font-mono ${stressAvg >= 7 ? "text-green-400" : stressAvg >= 4 ? "text-yellow-400" : "text-red-400"}`}
                      >
                        {stressAvg}/10
                      </span>
                    )}
                    {canvasFilled > 0 && (
                      <span className="text-muted-foreground">
                        🟩 {canvasFilled}/12
                      </span>
                    )}
                    {pitchCount > 0 && (
                      <span className="text-muted-foreground">
                        📄 {pitchCount}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{completed}/13 stages</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Updated {new Date(project.updatedAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
