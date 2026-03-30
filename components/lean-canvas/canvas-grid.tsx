"use client";

import { useEffect, useState, useCallback } from "react";
import { CanvasCell } from "./canvas-cell";

interface CanvasData {
  problem: string | null;
  solution: string | null;
  uvp: string | null;
  unfairAdvantage: string | null;
  customerSegments: string | null;
  existingAlternatives: string | null;
  keyMetrics: string | null;
  channels: string | null;
  costStructure: string | null;
  revenueStreams: string | null;
  highLevelConcept: string | null;
  earlyAdopters: string | null;
}

const CANVAS_BLOCKS: {
  label: string;
  key: keyof CanvasData;
  number: number;
}[] = [
  { label: "Problem", key: "problem", number: 1 },
  { label: "Solution", key: "solution", number: 2 },
  { label: "UVP", key: "uvp", number: 3 },
  { label: "Unfair Advantage", key: "unfairAdvantage", number: 4 },
  { label: "Customer Segments", key: "customerSegments", number: 5 },
  { label: "Existing Alternatives", key: "existingAlternatives", number: 6 },
  { label: "Key Metrics", key: "keyMetrics", number: 7 },
  { label: "Channels", key: "channels", number: 8 },
  { label: "Cost Structure", key: "costStructure", number: 9 },
  { label: "Revenue Streams", key: "revenueStreams", number: 10 },
  { label: "High Level Concept", key: "highLevelConcept", number: 11 },
  { label: "Early Adopters", key: "earlyAdopters", number: 12 },
];

interface CanvasGridProps {
  projectId: string;
}

export function CanvasGrid({ projectId }: CanvasGridProps) {
  const [data, setData] = useState<CanvasData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCanvas = useCallback(async () => {
    try {
      const res = await fetch(`/api/lean-canvas?projectId=${projectId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.canvas || null);
      }
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchCanvas();
    const interval = setInterval(fetchCanvas, 10000);
    return () => clearInterval(interval);
  }, [fetchCanvas]);

  const filledCount = data
    ? CANVAS_BLOCKS.filter((b) => data[b.key]?.trim()).length
    : 0;

  const handleSave = (fieldKey: string, value: string) => {
    setData((prev) =>
      prev
        ? { ...prev, [fieldKey]: value || null }
        : ({ [fieldKey]: value || null } as unknown as CanvasData),
    );
  };

  if (loading) {
    return (
      <div className="p-4 space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-lg bg-secondary animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3 overflow-y-auto">
      {/* Counter */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] uppercase text-muted-foreground tracking-wider">
          Lean Canvas
        </span>
        <span className="text-xs text-muted-foreground font-mono">
          <span className="text-foreground font-bold">{filledCount}</span>/12
          filled
        </span>
      </div>

      {/* Grid: classic lean canvas layout */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {CANVAS_BLOCKS.map((block) => (
          <CanvasCell
            key={block.key}
            label={block.label}
            fieldKey={block.key}
            value={data?.[block.key] || undefined}
            blockNumber={block.number}
            projectId={projectId}
            onSave={handleSave}
          />
        ))}
      </div>
    </div>
  );
}
