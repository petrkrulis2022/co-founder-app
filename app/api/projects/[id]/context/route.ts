import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/lib/db/queries/projects";
import { assembleContextForDisplay } from "@/lib/ai/context-assembler";

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
    await getProject(id, userId);
    const context = await assembleContextForDisplay(id);
    return NextResponse.json(context);
  } catch {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
}
