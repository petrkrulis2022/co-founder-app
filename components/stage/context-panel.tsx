"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ContextData {
  project: {
    name: string;
    domain: string | null;
    thesis: string | null;
    status: string;
  };
  leanCanvasFilled: number;
  leanCanvasFields: { key: string; value: string }[];
  stressScores: { dimension: string; score: number; notes?: string }[];
  stressAverage: number | null;
  stageSummaries: { stageKey: string; summary: string }[];
  sprintProgress: { completed: number; total: number };
  keyArtifacts: { key: string; value: string }[];
}

interface ContextPanelProps {
  projectId: string;
  stageColor?: string;
}

export function ContextPanel({
  projectId,
  stageColor = "#00ff9d",
}: ContextPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [context, setContext] = useState<ContextData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadContext = async () => {
    if (context) {
      setIsOpen(!isOpen);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/context`);
      const data = await res.json();
      setContext(data);
    } catch {
      setContext(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-b border-border">
      <Button
        variant="ghost"
        size="sm"
        className="text-xs text-muted-foreground gap-1.5 h-8"
        onClick={loadContext}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="currentColor"
          className={`transition-transform ${isOpen ? "rotate-90" : ""}`}
        >
          <path d="M3 1l4 4-4 4z" />
        </svg>
        Cross-Stage Context
      </Button>
      {isOpen && (
        <div className="px-4 pb-3 space-y-3">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : context ? (
            <>
              {/* Thesis */}
              {context.project.thesis && (
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground tracking-wider">
                    Thesis
                  </span>
                  <p className="text-xs text-foreground mt-0.5">
                    {context.project.thesis}
                  </p>
                </div>
              )}

              {/* Score pills */}
              {context.stressScores.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground tracking-wider">
                    Stress Scores
                    {context.stressAverage !== null && (
                      <span className="ml-2 text-foreground">
                        avg {context.stressAverage.toFixed(1)}/10
                      </span>
                    )}
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {context.stressScores.map((s) => (
                      <Badge
                        key={s.dimension}
                        variant="secondary"
                        className="text-[10px] font-mono px-1.5 py-0"
                        style={{
                          borderLeft: `2px solid ${s.score >= 7 ? "#00ff9d" : s.score >= 4 ? "#ffaa00" : "#ff4444"}`,
                        }}
                      >
                        {s.dimension.charAt(0).toUpperCase() +
                          s.dimension.slice(1)}
                        : {s.score}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Canvas progress */}
              {context.leanCanvasFilled > 0 && (
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground tracking-wider">
                    Lean Canvas
                  </span>
                  <p className="text-xs text-foreground mt-0.5">
                    {context.leanCanvasFilled}/12 blocks filled
                  </p>
                </div>
              )}

              {/* Stage insights */}
              {context.stageSummaries.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground tracking-wider">
                    Stage Insights
                  </span>
                  <div className="mt-1 space-y-1">
                    {context.stageSummaries.map((s) => (
                      <p key={s.stageKey} className="text-xs text-foreground">
                        <span
                          className="font-mono text-[10px]"
                          style={{ color: stageColor }}
                        >
                          [{s.stageKey}]
                        </span>{" "}
                        {s.summary}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Key artifacts */}
              {context.keyArtifacts.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground tracking-wider">
                    Key Decisions
                  </span>
                  <div className="mt-1 space-y-1">
                    {context.keyArtifacts.map((a, i) => (
                      <p key={i} className="text-xs text-foreground font-mono">
                        {a.key}: {a.value}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Sprint progress */}
              {context.sprintProgress.completed > 0 && (
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground tracking-wider">
                    Sprint Progress
                  </span>
                  <p className="text-xs text-foreground mt-0.5">
                    {context.sprintProgress.completed}/
                    {context.sprintProgress.total} sprints completed
                  </p>
                </div>
              )}

              {context.stressScores.length === 0 &&
                context.leanCanvasFilled === 0 &&
                context.stageSummaries.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">
                    No cross-stage context yet. Complete earlier stages to build
                    context.
                  </p>
                )}
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              Failed to load context.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
