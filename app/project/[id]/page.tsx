import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/get-user";
import { STAGES } from "@/lib/stages";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getScores } from "@/lib/db/queries/scores";
import { getLeanCanvas } from "@/lib/db/queries/lean-canvas";
import { getPitchSections } from "@/lib/db/queries/pitch";
import { prisma } from "@/lib/db/prisma";
import { ProjectHeader } from "@/components/project/project-header";

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
] as const;

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const project = await prisma.project.findFirst({
    where: { id, userId: user.id },
    include: { stages: true },
  });
  if (!project) notFound();

  const [scores, canvas, pitchSections] = await Promise.all([
    getScores(id),
    getLeanCanvas(id),
    getPitchSections(id),
  ]);

  const stageStatusMap = new Map(
    project.stages.map((s) => [s.stageKey, s.status]),
  );

  const completedCount = project.stages.filter(
    (s) => s.status === "completed",
  ).length;

  const stressAvg =
    scores.length > 0
      ? Math.round(
          (scores.reduce((a, s) => a + s.score, 0) / scores.length) * 10,
        ) / 10
      : null;

  const canvasFilled = canvas
    ? CANVAS_FIELDS.filter((f) => {
        const val = canvas[f as keyof typeof canvas];
        return typeof val === "string" && val.trim();
      }).length
    : 0;

  const nextStage = STAGES.find(
    (s) => stageStatusMap.get(s.key) !== "completed",
  );

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      {/* Editable header */}
      <ProjectHeader
        projectId={id}
        initialName={project.name}
        initialThesis={project.thesis || ""}
        domain={project.domain || "other"}
        status={project.status || "active"}
      />

      {/* Stats row */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border">
          <span className="text-xs text-muted-foreground">Stages</span>
          <span className="text-sm font-mono font-bold">
            {completedCount}/13
          </span>
        </div>
        {stressAvg !== null && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border">
            <span className="text-xs text-muted-foreground">Stress</span>
            <span
              className={`text-sm font-mono font-bold ${stressAvg >= 7 ? "text-green-400" : stressAvg >= 4 ? "text-yellow-400" : "text-red-400"}`}
            >
              {stressAvg}/10
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border">
          <span className="text-xs text-muted-foreground">Canvas</span>
          <span className="text-sm font-mono font-bold">{canvasFilled}/12</span>
        </div>
        {pitchSections.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border">
            <span className="text-xs text-muted-foreground">Pitch</span>
            <span className="text-sm font-mono font-bold">
              {pitchSections.length} sections
            </span>
          </div>
        )}
      </div>

      {/* Continue button */}
      {nextStage && (
        <Link href={`/project/${id}/${nextStage.key}`}>
          <Button className="bg-[#00ff9d] text-[#050505] hover:bg-[#00ff9d]/90">
            Continue → {nextStage.label}
          </Button>
        </Link>
      )}

      {/* Stages grid */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
          All Stages
        </h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {STAGES.map((stage) => {
            const status = stageStatusMap.get(stage.key) || "not_started";
            return (
              <Link key={stage.key} href={`/project/${id}/${stage.key}`}>
                <Card className="hover:border-foreground/20 transition-colors h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                          style={{
                            backgroundColor:
                              status === "completed"
                                ? stage.color
                                : "transparent",
                            color:
                              status === "completed" ? "#050505" : stage.color,
                            border: `1.5px solid ${stage.color}`,
                          }}
                        >
                          {status === "completed"
                            ? "✓"
                            : String(stage.number).padStart(2, "0")}
                        </span>
                        <CardTitle className="text-sm">{stage.label}</CardTitle>
                      </div>
                      {status === "in_progress" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] animate-pulse" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {stage.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
