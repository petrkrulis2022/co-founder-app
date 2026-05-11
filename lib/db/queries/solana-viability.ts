import { prisma } from "@/lib/db/prisma";

export async function getSolanaViability(projectId: string) {
  return prisma.solanaViabilityAnalysis.findUnique({
    where: { projectId },
  });
}

export async function upsertSolanaViability(
  projectId: string,
  data: Record<string, unknown>,
) {
  return prisma.solanaViabilityAnalysis.upsert({
    where: { projectId },
    create: { projectId, ...data },
    update: { ...data },
  });
}

export async function deleteSolanaViability(projectId: string) {
  return prisma.solanaViabilityAnalysis.delete({
    where: { projectId },
  });
}
