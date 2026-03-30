import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  const scores = await prisma.stressScore.findMany({
    where: { projectId },
  });

  return NextResponse.json({ scores });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { projectId, dimension, score, notes } = body as {
    projectId: string;
    dimension: string;
    score: number;
    notes?: string;
  };

  if (!projectId || !dimension || score === undefined) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  // Verify project belongs to user
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const result = await prisma.stressScore.upsert({
    where: { projectId_dimension: { projectId, dimension } },
    update: { score, notes },
    create: { projectId, dimension, score, notes },
  });

  return NextResponse.json({ score: result });
}
