import { prisma } from "@/lib/db/prisma";

export async function getMarketingCampaign(projectId: string) {
  return prisma.marketingCampaign.findUnique({ where: { projectId } });
}

export async function upsertMarketingCampaign(
  projectId: string,
  data: Record<string, unknown>,
) {
  return prisma.marketingCampaign.upsert({
    where: { projectId },
    create: { projectId, ...data },
    update: { ...data },
  });
}
