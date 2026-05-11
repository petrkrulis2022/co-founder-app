import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db/prisma";
import { upsertSolanaViability } from "@/lib/db/queries/solana-viability";
import { getLeanCanvas } from "@/lib/db/queries/lean-canvas";
import { getScores } from "@/lib/db/queries/scores";
import { getPitchSections } from "@/lib/db/queries/pitch";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const COLOSSEUM_API_BASE =
  process.env.COLOSSEUM_COPILOT_API_BASE ||
  "https://copilot.colosseum.com/api/v1";
const COLOSSEUM_PAT = process.env.COLOSSEUM_COPILOT_PAT;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!COLOSSEUM_PAT) {
    return NextResponse.json(
      {
        error:
          "Colosseum Copilot not configured. Please set COLOSSEUM_COPILOT_PAT environment variable.",
      },
      { status: 503 },
    );
  }

  const body = await req.json();
  const { projectId, query } = body as { projectId: string; query: string };

  if (!projectId || !query) {
    return NextResponse.json(
      { error: "Missing projectId or query" },
      { status: 400 },
    );
  }

  // Verify project ownership and fetch full project context
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    include: { stages: true },
  });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  try {
    // Fetch all project context in parallel
    const [leanCanvas, scores, pitchSections, idealClientProfiler, blueOcean] =
      await Promise.all([
        getLeanCanvas(projectId).catch(() => null),
        getScores(projectId).catch(() => []),
        getPitchSections(projectId).catch(() => []),
        prisma.idealClientProfiler.findUnique({ where: { projectId } }),
        prisma.blueOceanStrategy.findUnique({ where: { projectId } }),
      ]);

    // Build a search query from the project context + user query
    const searchQuery = buildSearchQuery({ project, leanCanvas, query });

    // Call Colosseum real endpoints in parallel
    const [projectsRes, archivesRes] = await Promise.all([
      colosseumSearch("search/projects", { query: searchQuery, limit: 10 }),
      colosseumSearch("search/archives", {
        query: searchQuery,
        limit: 5,
        maxChunksPerDoc: 1,
      }),
    ]);

    // Build project context summary
    const projectContext = buildProjectContextSummary({
      project,
      leanCanvas,
      scores,
      pitchSections,
      idealClientProfiler,
      blueOcean,
    });

    // Use Claude to synthesise Colosseum results + project context into structured analysis
    const analysis = await synthesiseWithClaude({
      projectContext,
      userQuery: query,
      colosseumProjects: projectsRes,
      colosseumArchives: archivesRes,
    });

    // Store in database
    const stored = await upsertSolanaViability(projectId, {
      query,
      gapDetails: analysis.gapDetails,
      gapClassification: analysis.gapClassification,
      recommendations: analysis.recommendations,
      revenueModel: analysis.revenueModel,
      gtmStrategy: analysis.gtmStrategy,
      risks: analysis.risks,
      rawResponse: { projects: projectsRes, archives: archivesRes },
      analysedAt: new Date(),
    });

    return NextResponse.json({ analysis: stored });
  } catch (error) {
    console.error("Solana viability analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze Solana viability. Please try again." },
      { status: 500 },
    );
  }
}

async function colosseumSearch(
  endpoint: string,
  payload: Record<string, unknown>,
) {
  const res = await fetch(`${COLOSSEUM_API_BASE}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${COLOSSEUM_PAT}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    console.error(`Colosseum ${endpoint} error:`, res.status, await res.text());
    return null;
  }
  return res.json();
}

function buildSearchQuery(ctx: {
  project: any;
  leanCanvas: any;
  query: string;
}): string {
  const parts: string[] = [ctx.query];
  if (ctx.project.name) parts.push(ctx.project.name);
  if (ctx.project.thesis) parts.push(ctx.project.thesis);
  if (ctx.leanCanvas?.problem) parts.push(ctx.leanCanvas.problem.slice(0, 100));
  if (ctx.leanCanvas?.solution)
    parts.push(ctx.leanCanvas.solution.slice(0, 100));
  return parts.filter(Boolean).join(" ").slice(0, 500);
}

function buildProjectContextSummary(ctx: {
  project: any;
  leanCanvas: any;
  scores: any;
  pitchSections: any;
  idealClientProfiler: any;
  blueOcean: any;
}): string {
  const {
    project,
    leanCanvas,
    scores,
    pitchSections,
    idealClientProfiler,
    blueOcean,
  } = ctx;
  const completedStages = project.stages.filter(
    (s: any) => s.status === "complete",
  );

  return `## Project: ${project.name}
**Domain**: ${project.domain || "General"} | **Status**: ${project.status}
**Thesis**: ${project.thesis || "Not defined"}
**Progress**: ${completedStages.length}/${project.stages.length} stages completed

### Lean Canvas
- Problem: ${leanCanvas?.problem || "Not defined"}
- Solution: ${leanCanvas?.solution || "Not defined"}
- UVP: ${leanCanvas?.uvp || "Not defined"}
- Customer Segments: ${leanCanvas?.customerSegments || "Not defined"}
- Revenue Streams: ${leanCanvas?.revenueStreams || "Not defined"}
- Key Metrics: ${leanCanvas?.keyMetrics || "Not defined"}

### Ideal Customer
- Persona: ${idealClientProfiler?.primaryPersona || "Not defined"}
- Pain Points: ${idealClientProfiler?.painPoints || "Not defined"}
- WTP: ${idealClientProfiler?.willingnessToPayRange || "Not specified"}

### Competitive Positioning
- Blue Ocean: ${blueOcean?.blueOceanStrategy || "Not defined"}
- Value Prop: ${blueOcean?.valueProposition || "Not defined"}

### Validation
${scores.length > 0 ? `Stress Test Avg: ${(scores.reduce((a: any, s: any) => a + s.score, 0) / scores.length).toFixed(1)}/10` : "No stress test yet"}
${pitchSections.length > 0 ? `Pitch: ${pitchSections.length} sections completed` : "Pitch not started"}`;
}

async function synthesiseWithClaude(ctx: {
  projectContext: string;
  userQuery: string;
  colosseumProjects: any;
  colosseumArchives: any;
}): Promise<{
  gapDetails: string;
  gapClassification: string;
  recommendations: string;
  revenueModel: string;
  gtmStrategy: string;
  risks: string;
}> {
  const projectsList =
    ctx.colosseumProjects?.results
      ?.slice(0, 8)
      .map(
        (p: any) =>
          `- **${p.name}** (${p.hackathon?.name || "unknown hackathon"}): ${p.description?.slice(0, 120) || ""}`,
      )
      .join("\n") || "No similar projects found in Colosseum database.";

  const archivesList =
    ctx.colosseumArchives?.results
      ?.slice(0, 4)
      .map(
        (a: any) =>
          `- **${a.title}** (${a.author || "unknown"}): ${a.snippet?.slice(0, 120) || ""}`,
      )
      .join("\n") || "No archive references found.";

  const systemPrompt = `You are a Solana ecosystem analyst. You have access to Colosseum hackathon project data and crypto archive research. 
Provide structured, evidence-based analysis. Be specific, cite project names when available, and give actionable recommendations.`;

  const userPrompt = `${ctx.projectContext}

## User Question
${ctx.userQuery}

## Similar Projects Found in Colosseum Database
${projectsList}

## Relevant Archive Research
${archivesList}

---

Based on the project context and Colosseum data above, provide a structured Solana viability analysis.

Respond using EXACTLY these XML section tags (no other formatting outside them):

<GAP_CLASSIFICATION>
Full Gap / Partial Gap / False Gap — one sentence explanation
</GAP_CLASSIFICATION>

<MARKET_ANALYSIS>
- bullet on competitor landscape
- bullet on what Colosseum found
- bullet on gaps
</MARKET_ANALYSIS>

<RECOMMENDATIONS>
- actionable bullet 1
- actionable bullet 2
- actionable bullet 3
</RECOMMENDATIONS>

<REVENUE_MODEL>
- revenue approach 1
- revenue approach 2
</REVENUE_MODEL>

<GO_TO_MARKET>
- GTM bullet 1
- GTM bullet 2
- GTM bullet 3
</GO_TO_MARKET>

<RISKS>
- risk 1 and mitigation
- risk 2 and mitigation
- risk 3 and mitigation
</RISKS>`;

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1500,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  return {
    gapClassification:
      extractSection(text, "GAP_CLASSIFICATION") || "Analysis pending",
    gapDetails: extractSection(text, "MARKET_ANALYSIS") || text.slice(0, 800),
    recommendations: extractSection(text, "RECOMMENDATIONS") || "",
    revenueModel: extractSection(text, "REVENUE_MODEL") || "",
    gtmStrategy: extractSection(text, "GO_TO_MARKET") || "",
    risks: extractSection(text, "RISKS") || "",
  };
}

function extractSection(text: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = text.match(regex);
  return match ? match[1].trim().slice(0, 800) : null;
}
