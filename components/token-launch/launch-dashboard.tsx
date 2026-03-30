"use client";

import { useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

const CHECKLIST_CATEGORIES = [
  {
    name: "Legal & Compliance",
    items: [
      "Legal opinion obtained",
      "KYC/AML provider selected",
      "Terms of service drafted",
      "Privacy policy drafted",
      "Regulatory jurisdiction chosen",
    ],
  },
  {
    name: "Token Design",
    items: [
      "Token utility clearly defined",
      "Total supply finalized",
      "Vesting schedule designed",
      "Distribution breakdown set",
      "Token economics modeled",
    ],
  },
  {
    name: "Technical",
    items: [
      "Smart contract written",
      "Smart contract audited",
      "Testnet deployment complete",
      "Multi-sig wallet set up",
      "Token claim mechanism tested",
    ],
  },
  {
    name: "Marketing & Community",
    items: [
      "Community channels active",
      "Pre-launch waitlist built",
      "Influencer partnerships planned",
      "Launch announcement drafted",
      "Post-launch support plan ready",
    ],
  },
  {
    name: "Launch Mechanics",
    items: [
      "Launchpad platform selected",
      "Pricing model finalized",
      "Liquidity strategy planned",
      "CEX/DEX listing strategy",
      "Post-TGE plan documented",
    ],
  },
];

const DXR_STRATEGIES = [
  {
    key: "fair_launch",
    label: "Fair Launch",
    desc: "No presale, equal access for all",
  },
  { key: "ido", label: "IDO", desc: "Initial DEX Offering via launchpad" },
  { key: "ico", label: "ICO", desc: "Direct token sale to investors" },
  { key: "lbp", label: "LBP", desc: "Liquidity Bootstrapping Pool" },
  { key: "airdrop", label: "Airdrop", desc: "Token distribution to community" },
];

const BEAR_MARKET_QUESTIONS = [
  "Can the project survive 18 months with zero new funding?",
  "Does the token have real utility beyond speculation?",
  "Is there a revenue model independent of token price?",
  "Can the team work at reduced salaries if needed?",
  "Is the community engaged for reasons beyond token price?",
];

interface LaunchDashboardProps {
  projectId: string;
  initialPlan: {
    strategy?: string;
    bearMarketTest?: Record<string, boolean>;
    checklist?: Record<string, boolean>;
    notes?: string;
  } | null;
  stageColor: string;
}

export function LaunchDashboard({
  projectId,
  initialPlan,
  stageColor,
}: LaunchDashboardProps) {
  const [strategy, setStrategy] = useState(initialPlan?.strategy || "");
  const [bearTest, setBearTest] = useState<Record<string, boolean>>(
    (initialPlan?.bearMarketTest as Record<string, boolean>) || {},
  );
  const [checklist, setChecklist] = useState<Record<string, boolean>>(
    (initialPlan?.checklist as Record<string, boolean>) || {},
  );
  const [notes, setNotes] = useState(initialPlan?.notes || "");
  const [saving, setSaving] = useState(false);

  const save = useCallback(
    async (data: Record<string, unknown>) => {
      setSaving(true);
      try {
        await fetch("/api/token-launch", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId, ...data }),
        });
      } finally {
        setSaving(false);
      }
    },
    [projectId],
  );

  const allChecklistItems = CHECKLIST_CATEGORIES.flatMap((c) => c.items);
  const checkedCount = allChecklistItems.filter((i) => checklist[i]).length;
  const readinessPercent = Math.round(
    (checkedCount / allChecklistItems.length) * 100,
  );

  const bearPassCount = BEAR_MARKET_QUESTIONS.filter((q) => bearTest[q]).length;

  return (
    <div className="p-4 space-y-6 text-sm">
      {/* Readiness Score */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Launch Readiness</h2>
          <Badge
            variant="secondary"
            className="text-xs"
            style={{
              color:
                readinessPercent >= 80
                  ? "#00ff9d"
                  : readinessPercent >= 50
                    ? "#ffaa00"
                    : "#ff4444",
            }}
          >
            {readinessPercent}%
          </Badge>
        </div>
        <Progress value={readinessPercent} className="h-2" />
        <p className="text-xs text-muted-foreground mt-1">
          {checkedCount} / {allChecklistItems.length} items complete
        </p>
      </div>

      {/* DXR Strategy */}
      <div className="space-y-2">
        <h3 className="font-semibold text-sm">Distribution Strategy</h3>
        <div className="grid gap-2">
          {DXR_STRATEGIES.map((s) => (
            <button
              key={s.key}
              className={`text-left px-3 py-2 rounded-lg border transition-colors ${
                strategy === s.key
                  ? "border-current bg-secondary/50"
                  : "border-border hover:bg-secondary/20"
              }`}
              style={strategy === s.key ? { borderColor: stageColor } : {}}
              onClick={() => {
                setStrategy(s.key);
                save({ strategy: s.key });
              }}
            >
              <span className="text-xs font-medium">{s.label}</span>
              <p className="text-[10px] text-muted-foreground">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Bear Market Test */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Bear Market Test</h3>
          <Badge
            variant="outline"
            className="text-[10px]"
            style={{
              color:
                bearPassCount >= 4
                  ? "#00ff9d"
                  : bearPassCount >= 3
                    ? "#ffaa00"
                    : "#ff4444",
            }}
          >
            {bearPassCount}/{BEAR_MARKET_QUESTIONS.length} pass
          </Badge>
        </div>
        {BEAR_MARKET_QUESTIONS.map((q) => (
          <label
            key={q}
            className="flex items-start gap-2 cursor-pointer hover:bg-secondary/20 rounded px-2 py-1"
          >
            <input
              type="checkbox"
              checked={bearTest[q] || false}
              className="mt-0.5 accent-current"
              style={{ accentColor: stageColor }}
              onChange={(e) => {
                const updated = { ...bearTest, [q]: e.target.checked };
                setBearTest(updated);
                save({ bearMarketTest: updated });
              }}
            />
            <span className="text-xs">{q}</span>
          </label>
        ))}
      </div>

      {/* Readiness Checklist */}
      {CHECKLIST_CATEGORIES.map((cat) => (
        <div key={cat.name} className="space-y-1">
          <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
            {cat.name}
          </h3>
          {cat.items.map((item) => (
            <label
              key={item}
              className="flex items-center gap-2 cursor-pointer hover:bg-secondary/20 rounded px-2 py-1"
            >
              <input
                type="checkbox"
                checked={checklist[item] || false}
                className="accent-current"
                style={{ accentColor: stageColor }}
                onChange={(e) => {
                  const updated = {
                    ...checklist,
                    [item]: e.target.checked,
                  };
                  setChecklist(updated);
                  save({ checklist: updated });
                }}
              />
              <span className="text-xs">{item}</span>
            </label>
          ))}
        </div>
      ))}

      {/* Notes */}
      <div className="space-y-1">
        <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
          Notes
        </h3>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => save({ notes })}
          placeholder="Additional launch planning notes..."
          className="text-xs min-h-[80px]"
          rows={4}
        />
      </div>

      {saving && <p className="text-[10px] text-muted-foreground">Saving...</p>}
    </div>
  );
}
