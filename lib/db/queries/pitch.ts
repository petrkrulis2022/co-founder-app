import { prisma } from "@/lib/db/prisma";

export async function upsertPitchSection(
  projectId: string,
  section: string,
  content: string,
) {
  return prisma.pitchSection.upsert({
    where: { projectId_section: { projectId, section } },
    update: { content },
    create: { projectId, section, content },
  });
}

export async function getPitchSections(projectId: string) {
  return prisma.pitchSection.findMany({
    where: { projectId },
    orderBy: { section: "asc" },
  });
}

export async function getAllPitchSections(projectId: string) {
  const sections = await prisma.pitchSection.findMany({
    where: { projectId },
  });
  const map: Record<string, string> = {};
  for (const s of sections) {
    map[s.section] = s.content;
  }
  return map;
}
