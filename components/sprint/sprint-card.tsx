"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import type { SprintEntry } from "@prisma/client";

interface SprintConfig {
  number: number;
  name: string;
  goal: string;
  description: string;
  successMetric: string;
  interviewTarget: number;
  commitmentTarget: number;
}

interface SprintCardProps {
  projectId: string;
  sprint: SprintEntry | null;
  sprintConfig: SprintConfig;
  stageColor: string;
  onUpdate: (updated: SprintEntry) => void;
}

const FIVE_P_ROWS = ["Problem", "People", "Promise", "Price", "Packaging"];

export function SprintCard({
  projectId,
  sprint,
  sprintConfig,
  stageColor,
  onUpdate,
}: SprintCardProps) {
  const status = sprint?.status || "not_started";
  const [expanded, setExpanded] = useState(false);
  const [interviews, setInterviews] = useState(sprint?.interviews || 0);
  const [commitments, setCommitments] = useState(sprint?.commitments || 0);
  const [outcome, setOutcome] = useState(sprint?.outcome || "");
  const [saving, setSaving] = useState(false);
  const [fivePScores, setFivePScores] = useState<Record<string, number>>(
    (sprint?.fivePScores as Record<string, number>) || {},
  );

  const patchSprint = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch("/api/sprint", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          sprintNumber: sprintConfig.number,
          ...data,
        }),
      });
      if (res.ok) {
        const { entry } = await res.json();
        onUpdate(entry);
      }
    } finally {
      setSaving(false);
    }
  };

  const statusBadge = () => {
    if (status === "complete")
      return (
        <Badge className="bg-[#00ff9d]/10 text-[#00ff9d] text-[10px]">
          Complete
        </Badge>
      );
    if (status === "in_progress")
      return (
        <Badge
          className="text-[10px]"
          style={{
            backgroundColor: `${stageColor}15`,
            color: stageColor,
          }}
        >
          In Progress
        </Badge>
      );
    return (
      <Badge variant="outline" className="text-[10px]">
        Not Started
      </Badge>
    );
  };

  const fivePTotal = FIVE_P_ROWS.reduce(
    (sum, row) => sum + (fivePScores[row] || 0),
    0,
  );

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-secondary/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
          style={{
            backgroundColor: status !== "not_started" ? stageColor : "#1a1a1a",
            color: status !== "not_started" ? "#050505" : "#888",
          }}
        >
          {sprintConfig.number}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">
              {sprintConfig.name}
            </span>
            {statusBadge()}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {sprintConfig.goal}
          </p>
        </div>
        <span className="text-xs text-muted-foreground shrink-0">
          {expanded ? "▼" : "▶"}
        </span>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-border space-y-3 pt-3">
          <p className="text-xs text-muted-foreground">
            {sprintConfig.description}
          </p>
          <p className="text-xs text-muted-foreground">
            <strong>Success:</strong> {sprintConfig.successMetric}
          </p>

          {/* Interview tracking */}
          {(status === "in_progress" || status === "complete") && (
            <>
              {sprintConfig.interviewTarget > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Interviews</span>
                    <span>
                      {interviews} / {sprintConfig.interviewTarget}
                    </span>
                  </div>
                  <Progress
                    value={(interviews / sprintConfig.interviewTarget) * 100}
                    className="h-1.5"
                  />
                  <Input
                    type="number"
                    min={0}
                    value={interviews}
                    onChange={(e) =>
                      setInterviews(parseInt(e.target.value) || 0)
                    }
                    onBlur={() => patchSprint({ interviews })}
                    className="h-8 text-xs w-24"
                  />
                </div>
              )}

              {sprintConfig.commitmentTarget > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Commitments</span>
                    <span>
                      {commitments} / {sprintConfig.commitmentTarget}
                    </span>
                  </div>
                  <Progress
                    value={(commitments / sprintConfig.commitmentTarget) * 100}
                    className="h-1.5"
                  />
                  <Input
                    type="number"
                    min={0}
                    value={commitments}
                    onChange={(e) =>
                      setCommitments(parseInt(e.target.value) || 0)
                    }
                    onBlur={() => patchSprint({ commitments })}
                    className="h-8 text-xs w-24"
                  />
                </div>
              )}

              {/* 5P Score Grid — Sprint 3 only */}
              {sprintConfig.number === 3 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold">5P Score Grid</h4>
                  {FIVE_P_ROWS.map((row) => (
                    <div key={row} className="flex items-center gap-2 text-xs">
                      <span className="w-20 text-muted-foreground">{row}</span>
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        value={fivePScores[row] || ""}
                        onChange={(e) => {
                          const val = Math.min(
                            5,
                            Math.max(0, parseInt(e.target.value) || 0),
                          );
                          setFivePScores((prev) => ({
                            ...prev,
                            [row]: val,
                          }));
                        }}
                        onBlur={() => {
                          const updated = {
                            ...fivePScores,
                          };
                          patchSprint({ fivePScores: updated });
                        }}
                        className="h-7 text-xs w-16"
                      />
                      <span className="text-muted-foreground">/5</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 text-xs font-semibold pt-1 border-t border-border">
                    <span className="w-20">Total</span>
                    <span
                      className={
                        fivePTotal >= 13
                          ? "text-[#00ff9d]"
                          : fivePTotal >= 10
                            ? "text-[#ffaa00]"
                            : "text-[#ff4444]"
                      }
                    >
                      {fivePTotal}/25
                    </span>
                  </div>
                </div>
              )}

              {/* Outcome */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">
                  Sprint outcome / notes
                </label>
                <Textarea
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  onBlur={() => patchSprint({ outcome })}
                  placeholder="What did you learn? What patterns emerged?"
                  className="text-xs min-h-[60px]"
                  rows={3}
                />
              </div>
            </>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-1">
            {status === "not_started" && (
              <Button
                size="sm"
                className="text-xs"
                style={{
                  backgroundColor: stageColor,
                  color: "#050505",
                }}
                disabled={saving}
                onClick={() => patchSprint({ status: "in_progress" })}
              >
                Start Sprint →
              </Button>
            )}
            {status === "in_progress" && (
              <Button
                size="sm"
                className="text-xs"
                variant="outline"
                disabled={saving}
                onClick={() => patchSprint({ status: "complete" })}
              >
                Mark Complete ✓
              </Button>
            )}
            {status === "complete" && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#00ff9d]">✓ Complete</span>
                <button
                  className="text-[10px] text-muted-foreground hover:text-foreground underline"
                  onClick={() => patchSprint({ status: "in_progress" })}
                >
                  Reopen
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
