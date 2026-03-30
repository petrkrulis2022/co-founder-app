import { prisma } from "@/lib/db/prisma";

export async function assembleContext(projectId: string): Promise<string> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      leanCanvas: true,
      scores: true,
      stages: {
        select: {
          stageKey: true,
          summary: true,
          artifacts: {
            where: { type: { in: ["metric", "decision", "mvp_definition"] } },
            select: { key: true, value: true },
          },
        },
      },
      sprintEntries: {
        where: { outcome: { not: null } },
        select: {
          sprintNumber: true,
          outcome: true,
          interviews: true,
          commitments: true,
        },
      },
    },
  });

  if (!project) return "";

  const parts: string[] = [
    "---FOUNDER CONTEXT---",
    `Project: ${project.name} | Domain: ${project.domain ?? "N/A"} | Status: ${project.status}`,
  ];

  if (project.thesis) {
    parts.push(`Thesis: ${project.thesis}`);
  }

  // Lean Canvas
  if (project.leanCanvas) {
    const canvas = project.leanCanvas;
    const fields: [string, string | null][] = [
      ["Problem", canvas.problem],
      ["Solution", canvas.solution],
      ["UVP", canvas.uvp],
      ["Unfair Advantage", canvas.unfairAdvantage],
      ["Customer Segments", canvas.customerSegments],
      ["Existing Alternatives", canvas.existingAlternatives],
      ["Key Metrics", canvas.keyMetrics],
      ["Channels", canvas.channels],
      ["Cost Structure", canvas.costStructure],
      ["Revenue Streams", canvas.revenueStreams],
      ["High Level Concept", canvas.highLevelConcept],
      ["Early Adopters", canvas.earlyAdopters],
    ];
    const filled = fields.filter(([, v]) => v);
    if (filled.length > 0) {
      parts.push("", "LEAN CANVAS:");
      for (const [label, value] of filled) {
        parts.push(`${label}: ${value}`);
      }
    }
  }

  // Stress Scores
  if (project.scores.length > 0) {
    parts.push("", "STRESS SCORES:");
    for (const score of project.scores) {
      parts.push(
        `${score.dimension}: ${score.score}/10${score.notes ? ` — ${score.notes}` : ""}`,
      );
    }
    const avg =
      project.scores.reduce((sum, s) => sum + s.score, 0) /
      project.scores.length;
    parts.push(`Overall average: ${avg.toFixed(1)}/10`);
  }

  // Stage Summaries
  const summaries = project.stages.filter((s) => s.summary);
  if (summaries.length > 0) {
    parts.push("", "STAGE INSIGHTS:");
    for (const stage of summaries) {
      parts.push(`[${stage.stageKey}]: ${stage.summary}`);
    }
  }

  // Sprint Outcomes
  if (project.sprintEntries.length > 0) {
    parts.push("", "SPRINT OUTCOMES:");
    for (const entry of project.sprintEntries) {
      parts.push(
        `Sprint ${entry.sprintNumber}: ${entry.outcome} | Interviews: ${entry.interviews} | Commitments: ${entry.commitments}`,
      );
    }
  }

  // Key Artifacts
  const allArtifacts = project.stages.flatMap((s) => s.artifacts);
  if (allArtifacts.length > 0) {
    parts.push("", "KEY DECISIONS & METRICS:");
    for (const artifact of allArtifacts) {
      parts.push(`${artifact.key}: ${artifact.value}`);
    }
  }

  parts.push("---END CONTEXT---");

  return parts.join("\n");
}

export async function assembleContextForDisplay(projectId: string): Promise<{
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
}> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      leanCanvas: true,
      scores: true,
      stages: {
        select: {
          stageKey: true,
          summary: true,
          artifacts: {
            where: { type: { in: ["metric", "decision", "mvp_definition"] } },
            select: { key: true, value: true },
          },
        },
      },
      sprintEntries: {
        select: {
          sprintNumber: true,
          outcome: true,
          interviews: true,
          commitments: true,
        },
        orderBy: { sprintNumber: "asc" },
      },
    },
  });

  if (!project) {
    return {
      project: { name: "", domain: null, thesis: null, status: "active" },
      leanCanvasFilled: 0,
      leanCanvasFields: [],
      stressScores: [],
      stressAverage: null,
      stageSummaries: [],
      sprintProgress: { completed: 0, total: 5 },
      keyArtifacts: [],
    };
  }

  // Lean Canvas fields
  const leanCanvasFields: { key: string; value: string }[] = [];
  if (project.leanCanvas) {
    const canvas = project.leanCanvas;
    const fieldMap: [string, string | null][] = [
      ["problem", canvas.problem],
      ["solution", canvas.solution],
      ["uvp", canvas.uvp],
      ["unfairAdvantage", canvas.unfairAdvantage],
      ["customerSegments", canvas.customerSegments],
      ["existingAlternatives", canvas.existingAlternatives],
      ["keyMetrics", canvas.keyMetrics],
      ["channels", canvas.channels],
      ["costStructure", canvas.costStructure],
      ["revenueStreams", canvas.revenueStreams],
      ["highLevelConcept", canvas.highLevelConcept],
      ["earlyAdopters", canvas.earlyAdopters],
    ];
    for (const [key, value] of fieldMap) {
      if (value) leanCanvasFields.push({ key, value });
    }
  }

  // Stress scores
  const stressScores = project.scores.map((s) => ({
    dimension: s.dimension,
    score: s.score,
    ...(s.notes ? { notes: s.notes } : {}),
  }));
  const stressAverage =
    stressScores.length > 0
      ? stressScores.reduce((sum, s) => sum + s.score, 0) / stressScores.length
      : null;

  // Stage summaries
  const stageSummaries = project.stages
    .filter((s): s is typeof s & { summary: string } => s.summary !== null)
    .map((s) => ({ stageKey: s.stageKey, summary: s.summary }));

  // Sprint progress
  const completedSprints = project.sprintEntries.filter(
    (e) => e.outcome !== null,
  ).length;

  // Key artifacts
  const keyArtifacts = project.stages
    .flatMap((s) => s.artifacts)
    .map((a) => ({ key: a.key, value: a.value }));

  return {
    project: {
      name: project.name,
      domain: project.domain,
      thesis: project.thesis,
      status: project.status,
    },
    leanCanvasFilled: leanCanvasFields.length,
    leanCanvasFields,
    stressScores,
    stressAverage,
    stageSummaries,
    sprintProgress: { completed: completedSprints, total: 5 },
    keyArtifacts,
  };
}
