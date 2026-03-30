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

  const sections = await prisma.pitchSection.findMany({
    where: { projectId },
  });

  const map: Record<string, string> = {};
  for (const s of sections) {
    map[s.section] = s.content;
  }

  return NextResponse.json({ sections: map });
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { projectId, section, content } = body as {
    projectId: string;
    section: string;
    content: string;
  };

  if (!projectId || !section || content === undefined) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const result = await prisma.pitchSection.upsert({
    where: { projectId_section: { projectId, section } },
    update: { content },
    create: { projectId, section, content },
  });

  return NextResponse.json({ section: result });
}
