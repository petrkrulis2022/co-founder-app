"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface HealthScore {
  total: number;
  grade: string;
  color: string;
  breakdown: {
    validation: number;
    canvas: number;
    customer: number;
    pitch: number;
    momentum: number;
  };
  weakest: string;
  strongest: string;
  summary: string;
}

interface ProjectData {
  id: string;
  name: string;
  domain: string;
  thesis: string | null;
  updatedAt: string;
  stages: { status: string }[];
  scores: { score: number }[];
  leanCanvas: Record<string, string> | null;
  pitchSections: { id: string }[];
}

interface ComparisonProject extends ProjectData {
  healthScore: HealthScore | null;
}

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

const CATEGORIES = [
  { key: "validation", label: "Validation", max: 25 },
  { key: "canvas", label: "Canvas", max: 20 },
  { key: "customer", label: "Customer", max: 20 },
  { key: "pitch", label: "Pitch", max: 20 },
  { key: "momentum", label: "Momentum", max: 15 },
] as const;

export default function ComparePage() {
  const [projects, setProjects] = useState<ComparisonProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/projects");
        const data = await res.json();
        const loaded: ProjectData[] = data.projects ?? [];

        const withScores: ComparisonProject[] = await Promise.all(
          loaded.map(async (p) => {
            try {
              const hsRes = await fetch(`/api/health-score?projectId=${p.id}`);
              const hs = await hsRes.json();
              return { ...p, healthScore: hs.total !== undefined ? hs : null };
            } catch {
              return { ...p, healthScore: null };
            }
          }),
        );

        withScores.sort(
          (a, b) => (b.healthScore?.total ?? 0) - (a.healthScore?.total ?? 0),
        );
        setProjects(withScores);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#00ff9d] border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading comparison...</p>
        </div>
      </main>
    );
  }

  if (projects.length < 2) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-screen p-6">
        <div className="text-center space-y-3">
          <h1 className="text-xl font-bold">Need at least 2 projects</h1>
          <p className="text-muted-foreground text-sm">
            Create more projects to compare them side by side.
          </p>
          <Link href="/dashboard">
            <Button variant="ghost" className="text-[#00ff9d]">
              ← Back to Dashboard
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  const best = projects[0];

  function getStressAvg(scores: { score: number }[]) {
    if (!scores.length) return null;
    return (
      Math.round(
        (scores.reduce((s, v) => s + v.score, 0) / scores.length) * 10,
      ) / 10
    );
  }

  function getCanvasFilled(canvas: Record<string, string> | null) {
    if (!canvas) return 0;
    return CANVAS_FIELDS.filter(
      (f) => typeof canvas[f] === "string" && canvas[f].trim(),
    ).length;
  }

  return (
    <main className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold mt-2">Compare Projects</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Side-by-side comparison of {projects.length} projects, ranked by
          health score.
        </p>
      </div>

      {/* Ranking table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
            Overall Ranking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {projects.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center gap-4 p-3 rounded-lg border ${
                  i === 0
                    ? "border-[#00ff9d]/30 bg-[#00ff9d]/5"
                    : "border-border"
                }`}
              >
                <span className="text-lg font-bold font-mono text-muted-foreground w-6">
                  {i + 1}
                </span>
                {p.healthScore && (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={{
                      backgroundColor: p.healthScore.color + "22",
                      color: p.healthScore.color,
                      border: `2px solid ${p.healthScore.color}`,
                    }}
                  >
                    {p.healthScore.grade}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/project/${p.id}`}
                    className="font-medium hover:text-[#00ff9d] transition-colors"
                  >
                    {p.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{p.domain}</p>
                </div>
                <span className="font-mono font-bold text-lg">
                  {p.healthScore?.total ?? "—"}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category comparison */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
            Category Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {CATEGORIES.map((cat) => (
              <div key={cat.key}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">{cat.label}</span>
                  <span className="text-xs text-muted-foreground">
                    max {cat.max}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {projects.map((p) => {
                    const val =
                      p.healthScore?.breakdown[
                        cat.key as keyof typeof p.healthScore.breakdown
                      ] ?? 0;
                    const pct = Math.round((val / cat.max) * 100);
                    const isBest = p.id === best.id;
                    return (
                      <div key={p.id} className="flex items-center gap-3">
                        <span className="text-xs w-24 truncate text-muted-foreground">
                          {p.name}
                        </span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: isBest
                                ? "#00ff9d"
                                : (p.healthScore?.color ?? "#555"),
                            }}
                          />
                        </div>
                        <span className="text-xs font-mono w-8 text-right">
                          {val}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Side-by-side cards */}
      <h2 className="text-sm text-muted-foreground uppercase tracking-wider mb-4">
        Detailed Comparison
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => {
          const completed = p.stages.filter(
            (s) => s.status === "complete",
          ).length;
          const progress = Math.round((completed / 13) * 100);
          const stressAvg = getStressAvg(p.scores);
          const canvasFilled = getCanvasFilled(p.leanCanvas);

          return (
            <Card key={p.id} className="relative">
              {p.id === best.id && (
                <div className="absolute -top-2 -right-2 bg-[#00ff9d] text-[#050505] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  TOP
                </div>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  <Link
                    href={`/project/${p.id}`}
                    className="hover:text-[#00ff9d]"
                  >
                    {p.name}
                  </Link>
                </CardTitle>
                <Badge variant="secondary" className="text-[10px] w-fit">
                  {p.domain}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {p.healthScore && (
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{
                        backgroundColor: p.healthScore.color + "22",
                        color: p.healthScore.color,
                        border: `2px solid ${p.healthScore.color}`,
                      }}
                    >
                      {p.healthScore.grade}
                    </div>
                    <span className="font-mono font-bold">
                      {p.healthScore.total}/100
                    </span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Stages</span>
                    <span>{completed}/13</span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                </div>

                <div className="flex gap-3 text-xs">
                  {stressAvg !== null && (
                    <span
                      className={`font-mono ${stressAvg >= 7 ? "text-green-400" : stressAvg >= 4 ? "text-yellow-400" : "text-red-400"}`}
                    >
                      Stress: {stressAvg}/10
                    </span>
                  )}
                  <span className="text-muted-foreground">
                    Canvas: {canvasFilled}/12
                  </span>
                  <span className="text-muted-foreground">
                    Pitch: {p.pitchSections.length}
                  </span>
                </div>

                {p.healthScore && (
                  <p className="text-[10px] text-muted-foreground">
                    Strongest:{" "}
                    <span className="capitalize text-foreground">
                      {p.healthScore.strongest}
                    </span>
                    {" · "}
                    Weakest:{" "}
                    <span className="capitalize text-foreground">
                      {p.healthScore.weakest}
                    </span>
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
