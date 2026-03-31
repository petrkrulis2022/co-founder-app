import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SharedData {
  project: { name: string; domain: string; thesis: string | null };
  sharedBy: string;
  expiresAt: string | null;
  healthScore?: {
    total: number;
    grade: string;
    color: string;
    breakdown: Record<string, number>;
    summary: string;
  };
  leanCanvas?: Record<string, string>;
  stressScores?: { dimension: string; score: number; rationale: string }[];
  pitchSections?: { section: string; content: string }[];
  stageSummaries?: { stageKey: string; summary: string }[];
  sprints?: {
    sprintNumber: number;
    status: string;
    outcome: string | null;
    interviews: number;
    commitments: number;
  }[];
  error?: string;
}

const CANVAS_LABELS: Record<string, string> = {
  problem: "Problem",
  solution: "Solution",
  uvp: "Unique Value Prop",
  unfairAdvantage: "Unfair Advantage",
  customerSegments: "Customer Segments",
  existingAlternatives: "Existing Alternatives",
  keyMetrics: "Key Metrics",
  channels: "Channels",
  costStructure: "Cost Structure",
  revenueStreams: "Revenue Streams",
  highLevelConcept: "High-Level Concept",
  earlyAdopters: "Early Adopters",
};

const PITCH_LABELS: Record<string, string> = {
  one_liner: "One-Liner",
  team: "Team",
  problem_market: "Problem & Market",
  product: "Product",
  gtm_strategy: "GTM Strategy",
  business_model: "Business Model",
  traction: "Traction",
  competitive_landscape: "Competitive Landscape",
  vision: "Vision",
  use_of_funds: "Use of Funds",
};

async function fetchSharedData(token: string): Promise<SharedData | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/share/${token}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function SharedProjectPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = await fetchSharedData(token);

  if (!data || data.error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#050505] text-white p-6">
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold">Link Not Found</h1>
          <p className="text-muted-foreground text-sm">
            {data?.error || "This share link is invalid or has expired."}
          </p>
        </div>
      </main>
    );
  }

  const {
    project,
    healthScore,
    leanCanvas,
    stressScores,
    pitchSections,
    stageSummaries,
    sprints,
  } = data;

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="text-[#00ff9d] font-mono font-bold">
              FOUNDER OS
            </span>
            <span>· Shared project</span>
          </div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <div className="flex items-center gap-3">
            <Badge variant="secondary">{project.domain}</Badge>
            {project.thesis && (
              <p className="text-sm text-muted-foreground">{project.thesis}</p>
            )}
          </div>
        </div>

        {/* Health Score */}
        {healthScore && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
                Health Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                  style={{
                    backgroundColor: healthScore.color + "22",
                    color: healthScore.color,
                    border: `3px solid ${healthScore.color}`,
                  }}
                >
                  {healthScore.grade}
                </div>
                <div>
                  <p className="text-2xl font-mono font-bold">
                    {healthScore.total}{" "}
                    <span className="text-sm text-muted-foreground font-normal">
                      / 100
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {healthScore.summary}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {Object.entries(healthScore.breakdown).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <p
                      className="text-lg font-mono font-bold"
                      style={{ color: healthScore.color }}
                    >
                      {value}
                    </p>
                    <p className="text-[10px] text-muted-foreground capitalize">
                      {key}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lean Canvas */}
        {leanCanvas && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
                Lean Canvas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(CANVAS_LABELS).map(([key, label]) => {
                  const value = leanCanvas[key];
                  if (!value || !value.trim()) return null;
                  return (
                    <div
                      key={key}
                      className="p-3 rounded-lg bg-muted/30 border border-border"
                    >
                      <p className="text-xs text-muted-foreground mb-1 font-medium">
                        {label}
                      </p>
                      <p className="text-sm">{value}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stress Scores */}
        {stressScores && stressScores.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
                Stress Test Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stressScores.map((score) => (
                  <div key={score.dimension} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">
                        {score.dimension.replace(/_/g, " ")}
                      </span>
                      <span
                        className={`font-mono font-bold ${score.score >= 7 ? "text-green-400" : score.score >= 4 ? "text-yellow-400" : "text-red-400"}`}
                      >
                        {score.score}/10
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#00ff9d]"
                        style={{ width: `${score.score * 10}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {score.rationale}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pitch Sections */}
        {pitchSections && pitchSections.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
                Pitch Deck
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pitchSections.map((section) => (
                  <div key={section.section} className="space-y-1">
                    <h3 className="text-sm font-medium text-[#00d4ff]">
                      {PITCH_LABELS[section.section] || section.section}
                    </h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stage Summaries */}
        {stageSummaries && stageSummaries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
                Stage Summaries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stageSummaries.map((s) => (
                  <div
                    key={s.stageKey}
                    className="p-3 rounded-lg bg-muted/30 border border-border"
                  >
                    <p className="text-xs text-[#00ff9d] font-medium capitalize mb-1">
                      {s.stageKey.replace(/-/g, " ")}
                    </p>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {s.summary}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sprint Details */}
        {sprints && sprints.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
                Sprint Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sprints.map((sprint) => (
                  <div
                    key={sprint.sprintNumber}
                    className="p-3 rounded-lg bg-muted/30 border border-border"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">
                        Sprint {sprint.sprintNumber}
                      </p>
                      <Badge variant="secondary" className="text-[10px]">
                        {sprint.status}
                      </Badge>
                    </div>
                    {sprint.outcome && (
                      <p className="text-xs text-muted-foreground">
                        {sprint.outcome}
                      </p>
                    )}
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                      <span>{sprint.interviews} interviews</span>
                      <span>{sprint.commitments} commitments</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
          <p>
            Shared via{" "}
            <span className="text-[#00ff9d] font-mono font-bold">
              Founder OS
            </span>
          </p>
        </div>
      </div>
    </main>
  );
}
