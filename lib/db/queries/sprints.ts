import { prisma } from "@/lib/db/prisma";

export async function getSprintEntries(projectId: string) {
  return prisma.sprintEntry.findMany({
    where: { projectId },
    orderBy: { sprintNumber: "asc" },
  });
}
