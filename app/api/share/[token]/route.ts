import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const link = await prisma.shareLink.findUnique({
    where: { token },
    include: {
      project: {
        include: {
          user: { select: { email: true } },
          stages: { select: { stageKey: true, summary: true, status: true } },
          leanCanvas: true,
          scores: true,
          pitchSections: true,
          sprintEntries: {
            select: {
              sprintNumber: true,
              status: true,
              outcome: true,
              interviews: true,
              commitments: true,
            },
          },
        },
      },
    },
  });

  if (!link) {
    return NextResponse.json(
      { error: "Share link not found or invalid" },
      { status: 404 },
    );
  }

  if (link.expiresAt && new Date() > link.expiresAt) {
    return NextResponse.json(
      { error: "This share link has expired" },
      { status: 410 },
    );
  }

  // Increment view count
  await prisma.shareLink.update({
    where: { token },
    data: {
      viewCount: { increment: 1 },
      lastViewedAt: new Date(),
    },
  });

  const permissions = link.permissions as {
    canView: string[];
    canComment: boolean;
  };
  const canView = permissions?.canView ?? [];

  const project = link.project;

  const sections: Record<string, unknown> = {
    project: {
      name: project.name,
      domain: project.domain,
      thesis: project.thesis,
    },
    sharedBy: project.user.email,
    expiresAt: link.expiresAt,
  };

  if (canView.includes("lean_canvas") && project.leanCanvas) {
    sections.leanCanvas = project.leanCanvas;
  }
  if (canView.includes("stress_scores") && project.scores.length > 0) {
    sections.stressScores = project.scores;
  }
  if (canView.includes("pitch_sections") && project.pitchSections.length > 0) {
    sections.pitchSections = project.pitchSections;
  }
  if (canView.includes("stage_summaries")) {
    sections.stageSummaries = project.stages
      .filter((s) => s.summary)
      .map((s) => ({ stageKey: s.stageKey, summary: s.summary }));
  }
  if (canView.includes("sprint_details")) {
    sections.sprints = project.sprintEntries;
  }

  // Compute health score
  const messageCount = await prisma.message.count({
    where: { stage: { projectId: project.id } },
  });

  const { computeHealthScore } = await import("@/lib/scoring/health-score");
  const healthScore = computeHealthScore({
    project: project as Parameters<typeof computeHealthScore>[0]["project"],
    stages: project.stages as Parameters<
      typeof computeHealthScore
    >[0]["stages"],
    scores: project.scores,
    leanCanvas: project.leanCanvas,
    pitchSections: project.pitchSections,
    sprintEntries: project.sprintEntries as Parameters<
      typeof computeHealthScore
    >[0]["sprintEntries"],
    messageCount,
  });
  sections.healthScore = healthScore;

  return NextResponse.json(sections);
}
