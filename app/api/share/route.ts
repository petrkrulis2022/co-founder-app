import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { projectId, label, permissions, expiresAt } = body as {
    projectId: string;
    label?: string;
    permissions?: { canView: string[]; canComment: boolean };
    expiresAt?: string;
  };

  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const shareLink = await prisma.shareLink.create({
    data: {
      projectId,
      label: label || null,
      permissions: permissions ?? {
        canView: [
          "lean_canvas",
          "stress_scores",
          "pitch_sections",
          "stage_summaries",
        ],
        canComment: false,
      },
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return NextResponse.json({
    token: shareLink.token,
    url: `${appUrl}/share/${shareLink.token}`,
    id: shareLink.id,
  });
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const links = await prisma.shareLink.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ links });
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { token } = body as { token: string };
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const link = await prisma.shareLink.findUnique({
    where: { token },
    include: { project: { select: { userId: true } } },
  });

  if (!link || link.project.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.shareLink.delete({ where: { token } });
  return NextResponse.json({ success: true });
}
