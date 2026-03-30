import { prisma } from "@/lib/db/prisma";
import type { LeanCanvas } from "@prisma/client";

export async function upsertLeanCanvas(
  projectId: string,
  fields: Partial<Omit<LeanCanvas, "id" | "projectId" | "updatedAt">>,
) {
  return prisma.leanCanvas.upsert({
    where: { projectId },
    update: fields,
    create: { projectId, ...fields },
  });
}

export async function getLeanCanvas(projectId: string) {
  return prisma.leanCanvas.findUnique({
    where: { projectId },
  });
}
