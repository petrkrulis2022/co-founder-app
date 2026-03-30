import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

export async function getTokenLaunchPlan(projectId: string) {
  return prisma.tokenLaunchPlan.findUnique({
    where: { projectId },
  });
}

export async function upsertTokenLaunchPlan(
  projectId: string,
  data: Prisma.TokenLaunchPlanUncheckedUpdateInput,
) {
  return prisma.tokenLaunchPlan.upsert({
    where: { projectId },
    update: data,
    create: {
      projectId,
      ...data,
    } as Prisma.TokenLaunchPlanUncheckedCreateInput,
  });
}
