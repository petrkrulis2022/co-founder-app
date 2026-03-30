"use client";

import { useEffect, useState, useCallback } from "react";
import { RadarChart } from "./radar-chart";

interface Score {
  dimension: string;
  score: number;
  notes: string | null;
}

interface ScoreDashboardProps {
  projectId: string;
}

const DIMENSION_COLORS: Record<string, string> = {
  clarity: "#00ff9d",
  desirability: "#00d4ff",
  viability: "#c084fc",
  feasibility: "#ff6b35",
  mission: "#ffaa00",
  timing: "#ff4444",
  defensibility: "#ffffff",
};

const DIMENSION_LABELS: Record<string, string> = {
  clarity: "Clarity",
  desirability: "Desirability",
  viability: "Viability",
  feasibility: "Feasibility",
  mission: "Mission",
  timing: "Timing",
  defensibility: "Defensibility",
};

export function ScoreDashboard({ projectId }: ScoreDashboardProps) {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScores = useCallback(async () => {
    try {
      const res = await fetch(`/api/scores?projectId=${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setScores(data.scores || []);
      }
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchScores();
    const interval = setInterval(fetchScores, 10000);
    return () => clearInterval(interval);
  }, [fetchScores]);

  const average =
    scores.length > 0
      ? scores.reduce((sum, s) => sum + s.score, 0) / scores.length
      : null;

  return (
    <div className="space-y-6 p-4 overflow-y-auto">
      {/* Overall Score */}
      <div className="text-center">
        <span className="text-[10px] uppercase text-muted-foreground tracking-wider">
          Overall Score
        </span>
        <div className="text-4xl font-bold font-mono mt-1">
          {average !== null ? average.toFixed(1) : "—"}
          <span className="text-lg text-muted-foreground">/10</span>
        </div>
      </div>

      {/* Radar Chart */}
      <RadarChart
        scores={scores.map((s) => ({ dimension: s.dimension, score: s.score }))}
      />

      {/* Dimension Cards */}
      <div className="space-y-2">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="h-14 rounded-lg bg-secondary animate-pulse"
              />
            ))}
          </div>
        ) : scores.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              No scores yet. Chat with your AI co-founder in the stress test
              stage to generate scores.
            </p>
          </div>
        ) : (
          scores.map((s) => {
            const color = DIMENSION_COLORS[s.dimension] || "#666666";
            return (
              <div
                key={s.dimension}
                className="border border-border rounded-lg p-3 bg-card"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium">
                    {DIMENSION_LABELS[s.dimension] || s.dimension}
                  </span>
                  <span className="text-sm font-mono font-bold">
                    {s.score}/10
                  </span>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(s.score / 10) * 100}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
                {s.notes && (
                  <p className="text-[11px] text-muted-foreground mt-1.5 line-clamp-2">
                    {s.notes}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
