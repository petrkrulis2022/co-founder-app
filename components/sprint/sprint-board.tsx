"use client";

import { useState, useEffect, useCallback } from "react";
import { SprintCard } from "./sprint-card";
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

const SPRINT_CONFIGS: SprintConfig[] = [
  {
    number: 1,
    name: "Broad Match Problem Discovery",
    goal: "10-15 interviews, 3-5 job-based segments identified",
    description:
      "Cast a wide net. Target people who recently bought or used an existing alternative. Avoid the local maxima trap — don't only interview people you already know.",
    successMetric: "3-5 distinct segments identified, top one prioritized",
    interviewTarget: 15,
    commitmentTarget: 0,
  },
  {
    number: 2,
    name: "Narrow Match Problem Discovery",
    goal: "10-15 interviews with top segment",
    description:
      "Double down on the most promising segment from Sprint 1. Add specificity: not 'football fans' but 'football fans who bet live on mobile during UCL matches on TradeZero'.",
    successMetric:
      "Hiring/firing criteria defined, early adopter profile sharp",
    interviewTarget: 15,
    commitmentTarget: 0,
  },
  {
    number: 3,
    name: "MVP Design",
    goal: "All 5P dimensions score 10+/15",
    description:
      "Stress-test Problem, People, Promise, Price, Packaging. Each scored 1-5. All must hit 10+/15 before pitching.",
    successMetric: "All 5P rows pass, MVO designed to cause a switch",
    interviewTarget: 0,
    commitmentTarget: 0,
  },
  {
    number: 4,
    name: "Mafia Offer Pitch",
    goal: "25+ pitches, 60-80% conversion from qualified leads",
    description:
      "Deliver the offer one-on-one to qualified early adopters. An offer so compelling it's hard to refuse. Track: pitches, objections, conversions.",
    successMetric: "25+ pitches delivered, commitments secured",
    interviewTarget: 25,
    commitmentTarget: 15,
  },
  {
    number: 5,
    name: "Optimization",
    goal: "Cycle goal achieved, constraint broken",
    description:
      "Shift from qualitative to quantitative learning. Track customer factory metrics weekly. Identify and break the biggest constraint each week.",
    successMetric: "Initial paying customers acquired, scalable campaign ready",
    interviewTarget: 0,
    commitmentTarget: 0,
  },
];

interface SprintBoardProps {
  projectId: string;
  initialSprints: SprintEntry[];
  stageColor: string;
}

export function SprintBoard({
  projectId,
  initialSprints,
  stageColor,
}: SprintBoardProps) {
  const [sprints, setSprints] = useState<SprintEntry[]>(initialSprints);

  const getSprintData = useCallback(
    (num: number): SprintEntry | undefined =>
      sprints.find((s) => s.sprintNumber === num),
    [sprints],
  );

  // Poll for updates
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/sprint?projectId=${projectId}`);
        if (res.ok) {
          const data = await res.json();
          setSprints(data.entries);
        }
      } catch {}
    }, 15000);
    return () => clearInterval(interval);
  }, [projectId]);

  const handleUpdate = (updated: SprintEntry) => {
    setSprints((prev) => {
      const idx = prev.findIndex(
        (s) => s.sprintNumber === updated.sprintNumber,
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updated;
        return next;
      }
      return [...prev, updated];
    });
  };

  const completedCount = sprints.filter((s) => s.status === "complete").length;

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Mafia Offer Sprints</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {completedCount} / 5 sprints complete
        </p>
        {/* Progress bar */}
        <div className="flex gap-1 mt-2">
          {[1, 2, 3, 4, 5].map((n) => {
            const sprint = getSprintData(n);
            const isComplete = sprint?.status === "complete";
            const isActive = sprint?.status === "in_progress";
            return (
              <div
                key={n}
                className="h-2 flex-1 rounded-full transition-colors"
                style={{
                  backgroundColor: isComplete
                    ? stageColor
                    : isActive
                      ? `${stageColor}40`
                      : "#1a1a1a",
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Sprint Cards */}
      {SPRINT_CONFIGS.map((config) => (
        <SprintCard
          key={config.number}
          projectId={projectId}
          sprint={getSprintData(config.number) || null}
          sprintConfig={config}
          stageColor={stageColor}
          onUpdate={handleUpdate}
        />
      ))}
    </div>
  );
}
