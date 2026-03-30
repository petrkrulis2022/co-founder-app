import { prisma } from "@/lib/db/prisma";
import type { Stage } from "@prisma/client";

export async function getAllStages(projectId: string): Promise<Stage[]> {
  return prisma.stage.findMany({
    where: { projectId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getOrCreateStage(
  projectId: string,
  stageKey: string,
): Promise<Stage> {
  const existing = await prisma.stage.findUnique({
    where: { projectId_stageKey: { projectId, stageKey } },
  });
  if (existing) return existing;

  return prisma.stage.create({
    data: { projectId, stageKey },
  });
}

export async function updateStageStatus(
  projectId: string,
  stageKey: string,
  status: string,
): Promise<Stage> {
  return prisma.stage.upsert({
    where: { projectId_stageKey: { projectId, stageKey } },
    update: {
      status,
      completedAt: status === "complete" ? new Date() : undefined,
    },
    create: {
      projectId,
      stageKey,
      status,
      completedAt: status === "complete" ? new Date() : undefined,
    },
  });
}

export async function updateStageSummary(
  projectId: string,
  stageKey: string,
  summary: string,
): Promise<Stage> {
  return prisma.stage.upsert({
    where: { projectId_stageKey: { projectId, stageKey } },
    update: { summary },
    create: { projectId, stageKey, summary },
  });
}
