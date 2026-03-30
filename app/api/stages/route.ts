import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { updateStageStatus, updateStageSummary } from "@/lib/db/queries/stages";

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { projectId, stageKey, status, summary } = body as {
    projectId: string;
    stageKey: string;
    status?: string;
    summary?: string;
  };

  if (!projectId || !stageKey) {
    return NextResponse.json(
      { error: "Missing projectId or stageKey" },
      { status: 400 },
    );
  }

  try {
    if (status) {
      const stage = await updateStageStatus(projectId, stageKey, status);
      return NextResponse.json({ stage });
    }
    if (summary) {
      const stage = await updateStageSummary(projectId, stageKey, summary);
      return NextResponse.json({ stage });
    }
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: "Failed to update stage" },
      { status: 500 },
    );
  }
}
