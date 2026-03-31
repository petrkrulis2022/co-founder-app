import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  computeHealthScore,
  type ProjectWithAllData,
} from "@/lib/scoring/health-score";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    include: {
      stages: true,
      scores: true,
      leanCanvas: true,
      pitchSections: true,
      sprintEntries: true,
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const messageCount = await prisma.message.count({
    where: { stage: { projectId } },
  });

  const data: ProjectWithAllData = {
    project,
    stages: project.stages,
    scores: project.scores,
    leanCanvas: project.leanCanvas,
    pitchSections: project.pitchSections,
    sprintEntries: project.sprintEntries,
    messageCount,
  };

  const healthScore = computeHealthScore(data);
  return NextResponse.json(healthScore);
}
