import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const projects = await prisma.project.findMany({
    where: { userId },
    include: {
      stages: {
        include: {
          messages: {
            select: { id: true, role: true, content: true, createdAt: true },
          },
          artifacts: true,
        },
      },
      scores: true,
      leanCanvas: true,
      pitchSections: true,
      sprintEntries: true,
    },
  });

  const exportData = {
    exportedAt: new Date().toISOString(),
    user: { email: user.email, createdAt: user.createdAt },
    projects: projects.map((p) => ({
      name: p.name,
      domain: p.domain,
      thesis: p.thesis,
      status: p.status,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      stages: p.stages.map((s) => ({
        key: s.stageKey,
        status: s.status,
        summary: s.summary,
        messages: s.messages,
        artifacts: s.artifacts.map((a) => ({
          type: a.type,
          key: a.key,
          value: a.value,
        })),
      })),
      scores: p.scores.map((s) => ({
        dimension: s.dimension,
        score: s.score,
        notes: s.notes,
      })),
      leanCanvas: p.leanCanvas,
      pitchSections: p.pitchSections.map((s) => ({
        section: s.section,
        content: s.content,
      })),
      sprints: p.sprintEntries,
    })),
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="founder-os-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
