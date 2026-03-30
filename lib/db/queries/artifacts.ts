import { prisma } from "@/lib/db/prisma";

export async function upsertArtifact(
  stageId: string,
  type: string,
  key: string,
  value: string,
) {
  return prisma.artifact.upsert({
    where: { stageId_key: { stageId, key } },
    update: { type, value },
    create: { stageId, type, key, value },
  });
}

export async function getArtifactsByProject(projectId: string) {
  return prisma.artifact.findMany({
    where: { stage: { projectId } },
    include: { stage: { select: { stageKey: true } } },
  });
}

export async function getArtifact(stageId: string, key: string) {
  return prisma.artifact.findUnique({
    where: { stageId_key: { stageId, key } },
  });
}
