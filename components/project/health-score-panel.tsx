"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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

const CATEGORY_MAX: Record<string, number> = {
  validation: 25,
  canvas: 20,
  customer: 20,
  pitch: 20,
  momentum: 15,
};

const CATEGORY_LABELS: Record<string, string> = {
  validation: "Validation",
  canvas: "Canvas",
  customer: "Customer",
  pitch: "Pitch",
  momentum: "Momentum",
};

function getImprovementTips(hs: HealthScore): string[] {
  const tips: string[] = [];
  const b = hs.breakdown;
  if (b.validation < 15)
    tips.push(
      "Complete the stress test to score all 7 dimensions for up to +15 validation points.",
    );
  if (b.canvas < 10)
    tips.push(
      "Fill in more lean canvas fields — reaching 8/12 blocks earns +10 canvas points.",
    );
  if (b.customer < 10)
    tips.push(
      "Complete sprint entries with outcomes to earn +10 customer points.",
    );
  if (b.pitch < 10)
    tips.push("Write at least 7 pitch sections to earn +10 pitch points.");
  if (b.momentum < 10)
    tips.push(
      "Send more messages and work through stages — active use earns momentum points.",
    );
  return tips.slice(0, 3);
}

export function HealthScorePanel({ projectId }: { projectId: string }) {
  const [hs, setHs] = useState<HealthScore | null>(null);
  const [showTips, setShowTips] = useState(false);

  useEffect(() => {
    fetch(`/api/health-score?projectId=${projectId}`)
      .then((r) => r.json())
      .then((data: HealthScore) => {
        if (data.total !== undefined) setHs(data);
      })
      .catch(() => {});
  }, [projectId]);

  if (!hs) return null;

  const tips = getImprovementTips(hs);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
          Health Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
            style={{
              backgroundColor: hs.color + "22",
              color: hs.color,
              border: `3px solid ${hs.color}`,
            }}
          >
            {hs.grade}
          </div>
          <div>
            <p className="text-2xl font-mono font-bold">
              {hs.total}{" "}
              <span className="text-sm text-muted-foreground font-normal">
                / 100
              </span>
            </p>
            <p className="text-xs text-muted-foreground">{hs.summary}</p>
          </div>
        </div>

        <div className="space-y-2">
          {Object.entries(hs.breakdown).map(([key, value]) => {
            const max = CATEGORY_MAX[key];
            const pct = Math.round((value / max) * 100);
            return (
              <div key={key} className="space-y-0.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {CATEGORY_LABELS[key]}
                  </span>
                  <span className="font-mono">
                    {value}/{max}
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: hs.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground">
          Focus on:{" "}
          <span className="font-medium text-foreground capitalize">
            {hs.weakest}
          </span>
        </p>

        {tips.length > 0 && (
          <Collapsible open={showTips} onOpenChange={setShowTips}>
            <CollapsibleTrigger className="text-xs text-[#00d4ff] hover:underline cursor-pointer">
              {showTips ? "Hide tips ▲" : "How to improve ▼"}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-1">
              {tips.map((tip, i) => (
                <p key={i} className="text-xs text-muted-foreground">
                  • {tip}
                </p>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
