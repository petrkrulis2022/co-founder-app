import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  getUserProjectsWithStats,
  createProject,
} from "@/lib/db/queries/projects";
import { getCurrentUser } from "@/lib/auth/get-user";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await getUserProjectsWithStats(userId);
  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, domain, thesis } = body as {
    name: string;
    domain?: string;
    thesis?: string;
  };

  if (!name?.trim()) {
    return NextResponse.json(
      { error: "Project name is required" },
      { status: 400 },
    );
  }

  const project = await createProject(user.id, {
    name: name.trim(),
    domain,
    thesis,
  });
  return NextResponse.json({ project }, { status: 201 });
}
