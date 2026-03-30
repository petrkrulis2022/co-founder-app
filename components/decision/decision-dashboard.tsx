"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface Score {
  dimension: string;
  score: number;
  notes?: string | null;
}

interface StageInfo {
  stageKey: string;
  status: string;
}

const PMF_CHECKLIST = [
  "Users return without being prompted",
  "Users would be very disappointed if product disappeared",
  "Users recommend the product to others organically",
  "Usage grows without paid acquisition",
  "Revenue or commitments cover basic costs",
  "Clear value proposition validated by interviews",
  "Retention metrics trend upward week over week",
  "At least one growth channel identified and tested",
];

interface DecisionDashboardProps {
  projectId: string;
  scores: Score[];
  stages: StageInfo[];
  stageColor: string;
}

export function DecisionDashboard({
  projectId,
  scores,
  stages,
  stageColor,
}: DecisionDashboardProps) {
  const [pmfChecks, setPmfChecks] = useState<Record<string, boolean>>({});
  const [decidedAction, setDecidedAction] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Compute evidence summary
  const completedStages = stages.filter((s) => s.status === "complete").length;
  const totalStages = stages.length;
  const avgScore =
    scores.length > 0
      ? scores.reduce((sum, s) => sum + s.score, 0) / scores.length
      : 0;

  const pmfPassCount = PMF_CHECKLIST.filter((q) => pmfChecks[q]).length;
  const pmfPercent = Math.round((pmfPassCount / PMF_CHECKLIST.length) * 100);

  const handleDecision = async (action: string) => {
    setSaving(true);
    try {
      await fetch("/api/stages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          stageKey: "decision",
          status: "complete",
        }),
      });
      setDecidedAction(action);
    } finally {
      setSaving(false);
      setConfirmDialog(null);
    }
  };

  return (
    <div className="p-4 space-y-6 text-sm">
      {/* Evidence Summary */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Evidence Summary</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="border border-border rounded-lg p-3 bg-card">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Stages Done
            </p>
            <p className="text-xl font-bold mt-1">
              {completedStages}
              <span className="text-sm text-muted-foreground font-normal">
                /{totalStages}
              </span>
            </p>
          </div>
          <div className="border border-border rounded-lg p-3 bg-card">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Avg Stress Score
            </p>
            <p
              className="text-xl font-bold mt-1"
              style={{
                color:
                  avgScore >= 7
                    ? "#00ff9d"
                    : avgScore >= 5
                      ? "#ffaa00"
                      : "#ff4444",
              }}
            >
              {avgScore.toFixed(1)}
              <span className="text-sm text-muted-foreground font-normal">
                /10
              </span>
            </p>
          </div>
        </div>

        {/* Score breakdown */}
        {scores.length > 0 && (
          <div className="mt-3 space-y-1">
            {scores.map((s) => (
              <div
                key={s.dimension}
                className="flex items-center justify-between text-xs px-2 py-1"
              >
                <span className="capitalize">{s.dimension}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(s.score / 10) * 100}%`,
                        backgroundColor:
                          s.score >= 7
                            ? "#00ff9d"
                            : s.score >= 5
                              ? "#ffaa00"
                              : "#ff4444",
                      }}
                    />
                  </div>
                  <span className="w-6 text-right">{s.score}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PMF Checklist */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">PMF Signals Checklist</h3>
          <Badge
            variant="outline"
            className="text-[10px]"
            style={{
              color:
                pmfPercent >= 75
                  ? "#00ff9d"
                  : pmfPercent >= 50
                    ? "#ffaa00"
                    : "#ff4444",
            }}
          >
            {pmfPassCount}/{PMF_CHECKLIST.length} signals
          </Badge>
        </div>
        {PMF_CHECKLIST.map((q) => (
          <label
            key={q}
            className="flex items-start gap-2 cursor-pointer hover:bg-secondary/20 rounded px-2 py-1"
          >
            <input
              type="checkbox"
              checked={pmfChecks[q] || false}
              className="mt-0.5 accent-current"
              style={{ accentColor: stageColor }}
              onChange={(e) =>
                setPmfChecks((prev) => ({
                  ...prev,
                  [q]: e.target.checked,
                }))
              }
            />
            <span className="text-xs">{q}</span>
          </label>
        ))}
      </div>

      {/* Decision Buttons */}
      <div className="space-y-3 pt-2">
        <h3 className="font-semibold text-sm">Final Decision</h3>
        {decidedAction ? (
          <div className="border border-border rounded-lg p-4 bg-card text-center">
            <p className="text-xs text-muted-foreground">Decision recorded</p>
            <p className="text-lg font-bold mt-1 capitalize">
              {decidedAction === "persevere" && "🟢 Persevere"}
              {decidedAction === "pivot" && "🟡 Pivot"}
              {decidedAction === "kill" && "🔴 Kill"}
            </p>
          </div>
        ) : (
          <div className="grid gap-2">
            <Dialog
              open={confirmDialog === "persevere"}
              onOpenChange={(open) =>
                setConfirmDialog(open ? "persevere" : null)
              }
            >
              <DialogTrigger
                render={
                  <Button className="w-full bg-[#00ff9d] text-[#050505] hover:bg-[#00ff9d]/80 text-xs" />
                }
              >
                ✓ Persevere — Double Down
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm: Persevere</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                  You&apos;re choosing to continue building this project. The
                  evidence suggests product-market fit signals are present.
                </p>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setConfirmDialog(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-[#00ff9d] text-[#050505]"
                    onClick={() => handleDecision("persevere")}
                    disabled={saving}
                  >
                    Confirm Persevere
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog
              open={confirmDialog === "pivot"}
              onOpenChange={(open) => setConfirmDialog(open ? "pivot" : null)}
            >
              <DialogTrigger
                render={
                  <Button
                    variant="outline"
                    className="w-full text-xs border-[#ffaa00] text-[#ffaa00] hover:bg-[#ffaa00]/10"
                  />
                }
              >
                ↻ Pivot — Change Direction
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm: Pivot</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                  You&apos;re choosing to change direction. Some elements work,
                  but a significant change in approach is needed.
                </p>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setConfirmDialog(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-[#ffaa00] text-[#050505]"
                    onClick={() => handleDecision("pivot")}
                    disabled={saving}
                  >
                    Confirm Pivot
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog
              open={confirmDialog === "kill"}
              onOpenChange={(open) => setConfirmDialog(open ? "kill" : null)}
            >
              <DialogTrigger
                render={
                  <Button
                    variant="outline"
                    className="w-full text-xs border-[#ff4444] text-[#ff4444] hover:bg-[#ff4444]/10"
                  />
                }
              >
                ✕ Kill — Move On
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm: Kill</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                  You&apos;re choosing to stop this project. The data
                  doesn&apos;t support continuing. This is a brave and valid
                  choice.
                </p>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setConfirmDialog(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDecision("kill")}
                    disabled={saving}
                  >
                    Confirm Kill
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
}
