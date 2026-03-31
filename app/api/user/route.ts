import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Delete all user data in correct order (respecting foreign keys)
  const projects = await prisma.project.findMany({
    where: { userId },
    select: { id: true },
  });

  const projectIds = projects.map((p) => p.id);

  if (projectIds.length > 0) {
    const stages = await prisma.stage.findMany({
      where: { projectId: { in: projectIds } },
      select: { id: true },
    });
    const stageIds = stages.map((s) => s.id);

    if (stageIds.length > 0) {
      await prisma.message.deleteMany({
        where: { stageId: { in: stageIds } },
      });
      await prisma.artifact.deleteMany({
        where: { stageId: { in: stageIds } },
      });
    }

    await prisma.stage.deleteMany({
      where: { projectId: { in: projectIds } },
    });
    await prisma.stressScore.deleteMany({
      where: { projectId: { in: projectIds } },
    });
    await prisma.leanCanvas.deleteMany({
      where: { projectId: { in: projectIds } },
    });
    await prisma.pitchSection.deleteMany({
      where: { projectId: { in: projectIds } },
    });
    await prisma.sprintEntry.deleteMany({
      where: { projectId: { in: projectIds } },
    });
    await prisma.shareLink.deleteMany({
      where: { projectId: { in: projectIds } },
    });
    await prisma.project.deleteMany({
      where: { userId },
    });
  }

  await prisma.user.delete({ where: { id: userId } });

  return NextResponse.json({ success: true });
}
