import { prisma } from "@/lib/db/prisma";
import type { Project, Stage } from "@prisma/client";

export async function getUserProjects(userId: string): Promise<Project[]> {
  return prisma.project.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getProject(id: string, userId: string): Promise<Project> {
  const project = await prisma.project.findFirst({
    where: { id, userId },
  });
  if (!project) throw new Error("Project not found");
  return project;
}

export async function createProject(
  userId: string,
  data: { name: string; domain?: string; thesis?: string },
): Promise<Project> {
  return prisma.project.create({
    data: {
      userId,
      name: data.name,
      domain: data.domain,
      thesis: data.thesis,
    },
  });
}

export async function updateProject(
  id: string,
  userId: string,
  data: Partial<Pick<Project, "name" | "domain" | "thesis" | "status">>,
): Promise<Project> {
  const project = await prisma.project.findFirst({
    where: { id, userId },
  });
  if (!project) throw new Error("Project not found");

  return prisma.project.update({
    where: { id },
    data,
  });
}

// Internal helpers — no auth check, for use by output extractor only
export async function updateProjectThesis(
  projectId: string,
  thesis: string,
): Promise<void> {
  await prisma.project.update({
    where: { id: projectId },
    data: { thesis },
  });
}

export async function updateProjectStatus(
  projectId: string,
  status: string,
): Promise<void> {
  await prisma.project.update({
    where: { id: projectId },
    data: { status },
  });
}

export async function getProjectWithStages(
  id: string,
  userId: string,
): Promise<Project & { stages: Stage[] }> {
  const project = await prisma.project.findFirst({
    where: { id, userId },
    include: { stages: true },
  });
  if (!project) throw new Error("Project not found");
  return project;
}

export async function getUserProjectsWithStats(userId: string) {
  return prisma.project.findMany({
    where: { userId },
    include: {
      stages: { select: { status: true } },
      scores: { select: { score: true } },
      leanCanvas: true,
      pitchSections: { select: { id: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}
