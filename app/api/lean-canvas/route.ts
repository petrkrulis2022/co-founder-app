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

  const canvas = await prisma.leanCanvas.findUnique({
    where: { projectId },
  });

  return NextResponse.json({ canvas });
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { projectId, ...fields } = body as {
    projectId: string;
    [key: string]: string;
  };

  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  // Verify project belongs to user
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const canvas = await prisma.leanCanvas.upsert({
    where: { projectId },
    update: fields,
    create: { projectId, ...fields },
  });

  return NextResponse.json({ canvas });
}
