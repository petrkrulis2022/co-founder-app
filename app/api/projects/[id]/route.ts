import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getProjectWithStages, updateProject } from "@/lib/db/queries/projects";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const project = await getProjectWithStages(id, userId);
    return NextResponse.json({ project });
  } catch {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { name, domain, thesis, status } = body as {
    name?: string;
    domain?: string;
    thesis?: string;
    status?: string;
  };

  try {
    const project = await updateProject(id, userId, {
      name,
      domain,
      thesis,
      status,
    });
    return NextResponse.json({ project });
  } catch {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
}
