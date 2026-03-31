import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  generateInvestorMemo,
  generateLeanCanvas,
  generateValidationReport,
} from "@/lib/export/pdf-generator";
import { generatePitchDeck } from "@/lib/export/pptx-generator";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  const exports = await prisma.export.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ exports });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { projectId, exportType } = body as {
    projectId: string;
    exportType: string;
  };

  if (!projectId || !exportType) {
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

  // Fetch all needed data
  const [pitchSections, leanCanvas, scores, stages, sprints] =
    await Promise.all([
      prisma.pitchSection.findMany({ where: { projectId } }),
      prisma.leanCanvas.findUnique({ where: { projectId } }),
      prisma.stressScore.findMany({ where: { projectId } }),
      prisma.stage.findMany({ where: { projectId } }),
      prisma.sprintEntry.findMany({
        where: { projectId },
        orderBy: { sprintNumber: "asc" },
      }),
    ]);

  const pitchMap: Record<string, string> = {};
  for (const s of pitchSections) {
    pitchMap[s.section] = s.content;
  }

  let buffer: Buffer;
  let fileName: string;
  let contentType: string;

  try {
    switch (exportType) {
      case "investor_memo": {
        if (pitchSections.length < 3) {
          return NextResponse.json(
            { error: "Complete at least 3 pitch sections first" },
            { status: 400 },
          );
        }
        buffer = await generateInvestorMemo(project, pitchMap);
        fileName = `${project.name.replace(/\s+/g, "_")}_Investor_Memo.pdf`;
        contentType = "application/pdf";
        break;
      }
      case "pitch_deck": {
        if (pitchSections.length < 3) {
          return NextResponse.json(
            { error: "Complete at least 3 pitch sections first" },
            { status: 400 },
          );
        }
        buffer = await generatePitchDeck(project, pitchMap, scores);
        fileName = `${project.name.replace(/\s+/g, "_")}_Pitch_Deck.pptx`;
        contentType =
          "application/vnd.openxmlformats-officedocument.presentationml.presentation";
        break;
      }
      case "lean_canvas": {
        if (!leanCanvas) {
          return NextResponse.json(
            { error: "Fill out the lean canvas first" },
            { status: 400 },
          );
        }
        const canvasObj: Record<string, string | null> = {};
        for (const key of [
          "problem",
          "solution",
          "uvp",
          "unfairAdvantage",
          "customerSegments",
          "existingAlternatives",
          "keyMetrics",
          "channels",
          "costStructure",
          "revenueStreams",
          "highLevelConcept",
          "earlyAdopters",
        ] as const) {
          canvasObj[key] =
            (leanCanvas as unknown as Record<string, string | null>)[key] ??
            null;
        }
        buffer = await generateLeanCanvas(project, canvasObj);
        fileName = `${project.name.replace(/\s+/g, "_")}_Lean_Canvas.pdf`;
        contentType = "application/pdf";
        break;
      }
      case "validation_report": {
        const stagesWithSummary = stages.filter((s) => s.summary);
        if (stagesWithSummary.length < 3) {
          return NextResponse.json(
            { error: "Complete at least 3 stages first" },
            { status: 400 },
          );
        }
        buffer = await generateValidationReport(
          project,
          scores,
          stages.map((s) => ({ stageKey: s.stageKey, summary: s.summary })),
          sprints.map((s) => ({
            sprintNumber: s.sprintNumber,
            status: s.status,
            outcome: s.outcome,
          })),
        );
        fileName = `${project.name.replace(/\s+/g, "_")}_Validation_Report.pdf`;
        contentType = "application/pdf";
        break;
      }
      case "launchpad_pack": {
        if (pitchSections.length < 3) {
          return NextResponse.json(
            { error: "Complete at least 3 pitch sections first" },
            { status: 400 },
          );
        }
        buffer = await generateInvestorMemo(project, pitchMap);
        fileName = `${project.name.replace(/\s+/g, "_")}_Launchpad_Pack.pdf`;
        contentType = "application/pdf";
        break;
      }
      default:
        return NextResponse.json(
          { error: "Invalid export type" },
          { status: 400 },
        );
    }
  } catch {
    return NextResponse.json(
      { error: "Export failed, please try again" },
      { status: 500 },
    );
  }

  // Save export record
  const exportRecord = await prisma.export.create({
    data: {
      projectId,
      type: exportType,
      fileName,
    },
  });

  // Return the file directly as a download
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "X-Export-Id": exportRecord.id,
    },
  });
}
