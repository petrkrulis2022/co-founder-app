import { prisma } from "@/lib/db/prisma";

export async function upsertScore(
  projectId: string,
  dimension: string,
  score: number,
  notes?: string,
) {
  return prisma.stressScore.upsert({
    where: { projectId_dimension: { projectId, dimension } },
    update: { score, notes },
    create: { projectId, dimension, score, notes },
  });
}

export async function getScores(projectId: string) {
  return prisma.stressScore.findMany({
    where: { projectId },
    orderBy: { dimension: "asc" },
  });
}
