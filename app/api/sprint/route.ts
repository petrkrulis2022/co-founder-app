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

  const entries = await prisma.sprintEntry.findMany({
    where: { projectId },
    orderBy: { sprintNumber: "asc" },
  });

  return NextResponse.json({ entries });
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    projectId,
    sprintNumber,
    status,
    outcome,
    interviews,
    commitments,
    fivePScores,
  } = body as {
    projectId: string;
    sprintNumber: number;
    status?: string;
    outcome?: string;
    interviews?: number;
    commitments?: number;
    fivePScores?: Record<string, number>;
  };

  if (!projectId || sprintNumber === undefined) {
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

  const entry = await prisma.sprintEntry.upsert({
    where: {
      projectId_sprintNumber: { projectId, sprintNumber },
    },
    update: {
      ...(status !== undefined && { status }),
      ...(outcome !== undefined && { outcome }),
      ...(interviews !== undefined && { interviews }),
      ...(commitments !== undefined && { commitments }),
      ...(fivePScores !== undefined && { fivePScores }),
    },
    create: {
      projectId,
      sprintNumber,
      status: status ?? "not_started",
      outcome,
      interviews: interviews ?? 0,
      commitments: commitments ?? 0,
      ...(fivePScores !== undefined && { fivePScores }),
    },
  });

  return NextResponse.json({ entry });
}
