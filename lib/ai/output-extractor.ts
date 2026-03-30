import { upsertScore } from "@/lib/db/queries/scores";
import { upsertLeanCanvas } from "@/lib/db/queries/lean-canvas";
import { upsertPitchSection } from "@/lib/db/queries/pitch";
import { upsertArtifact } from "@/lib/db/queries/artifacts";
import { upsertTokenLaunchPlan } from "@/lib/db/queries/token-launch";
import { updateProjectThesis } from "@/lib/db/queries/projects";

const LEAN_CANVAS_FIELD_MAP: Record<string, string> = {
  CUSTOMER_SEGMENTS: "customerSegments",
  EARLY_ADOPTERS: "earlyAdopters",
  PROBLEM: "problem",
  EXISTING_ALTERNATIVES: "existingAlternatives",
  UVP: "uvp",
  HIGH_LEVEL_CONCEPT: "highLevelConcept",
  SOLUTION: "solution",
  CHANNELS: "channels",
  REVENUE_STREAMS: "revenueStreams",
  COST_STRUCTURE: "costStructure",
  KEY_METRICS: "keyMetrics",
  UNFAIR_ADVANTAGE: "unfairAdvantage",
};

const PITCH_SECTIONS = [
  "ONE_LINER",
  "TEAM",
  "PROBLEM_MARKET",
  "PRODUCT",
  "GTM_STRATEGY",
  "BUSINESS_MODEL",
  "TRACTION",
  "COMPETITIVE_LANDSCAPE",
  "VISION",
  "USE_OF_FUNDS",
];

export async function extractAndSave(
  stageKey: string,
  assistantMessage: string,
  projectId: string,
  stageId: string,
): Promise<void> {
  try {
    switch (stageKey) {
      case "validation":
      case "stress-test":
        await extractScores(assistantMessage, projectId);
        break;
      case "lean-canvas":
        await extractLeanCanvas(assistantMessage, projectId);
        break;
      case "selection":
        await extractThesis(assistantMessage, projectId);
        break;
      case "mvp":
        await extractMvpArtifacts(assistantMessage, stageId);
        break;
      case "feedback":
        await extractFeedbackArtifacts(assistantMessage, stageId);
        break;
      case "pitch":
        await extractPitchSections(assistantMessage, projectId);
        break;
      case "token-launch":
        await extractTokenLaunch(assistantMessage, projectId, stageId);
        break;
      case "decision":
        await extractDecision(assistantMessage, stageId);
        break;
    }
  } catch {
    // Never throw — extraction is best-effort
  }
}

async function extractScores(text: string, projectId: string): Promise<void> {
  // Match patterns like "CLARITY: 7/10", "Desirability: 4/10", "clarity: 8 / 10"
  const scoreRegex =
    /\b(clarity|desirability|viability|feasibility|mission|timing|defensibility)\s*[:：]\s*(\d{1,2})\s*\/\s*10/gi;
  let match;
  while ((match = scoreRegex.exec(text)) !== null) {
    const dimension = match[1].toLowerCase();
    const score = parseInt(match[2], 10);
    if (score >= 1 && score <= 10) {
      await upsertScore(projectId, dimension, score);
    }
  }
}

async function extractLeanCanvas(
  text: string,
  projectId: string,
): Promise<void> {
  // Match patterns like "LEAN_CANVAS_UVP: some value here"
  const canvasRegex = /LEAN_CANVAS_(\w+)\s*[:：]\s*(.+)/g;
  let match;
  const fields: Record<string, string> = {};
  while ((match = canvasRegex.exec(text)) !== null) {
    const fieldKey = match[1].toUpperCase();
    const value = match[2].trim();
    const dbField = LEAN_CANVAS_FIELD_MAP[fieldKey];
    if (dbField && value) {
      fields[dbField] = value;
    }
  }
  if (Object.keys(fields).length > 0) {
    await upsertLeanCanvas(projectId, fields);
  }
}

async function extractThesis(text: string, projectId: string): Promise<void> {
  // Match "PROJECT_THESIS: ..."
  const thesisMatch = text.match(/PROJECT_THESIS\s*[:：]\s*(.+)/);
  if (thesisMatch) {
    const thesis = thesisMatch[1].trim();
    if (thesis) {
      await updateProjectThesis(projectId, thesis);
    }
  }
}

async function extractMvpArtifacts(
  text: string,
  stageId: string,
): Promise<void> {
  const patterns: [RegExp, string, string][] = [
    [/MVP_CORE_FEATURE\s*[:：]\s*(.+)/i, "mvp_definition", "core_feature"],
    [/MVP_NORTH_STAR_METRIC\s*[:：]\s*(.+)/i, "metric", "north_star_metric"],
    [/MVP_NOT_BUILDING\s*[:：]\s*(.+)/i, "decision", "not_building"],
    [/MVP_TIMELINE\s*[:：]\s*(.+)/i, "mvp_definition", "timeline"],
  ];
  for (const [regex, type, key] of patterns) {
    const match = text.match(regex);
    if (match) {
      const value = match[1].trim();
      if (value) {
        await upsertArtifact(stageId, type, key, value);
      }
    }
  }
}

async function extractFeedbackArtifacts(
  text: string,
  stageId: string,
): Promise<void> {
  const patterns: [RegExp, string][] = [
    [/FEEDBACK_WORKING\s*[:：]\s*(.+)/i, "feedback_working"],
    [/FEEDBACK_BROKEN\s*[:：]\s*(.+)/i, "feedback_broken"],
    [/FEEDBACK_OPEN_QUESTION\s*[:：]\s*(.+)/i, "feedback_open_question"],
  ];
  for (const [regex, key] of patterns) {
    const match = text.match(regex);
    if (match) {
      const value = match[1].trim();
      if (value) {
        await upsertArtifact(stageId, "metric", key, value);
      }
    }
  }
}

async function extractPitchSections(
  text: string,
  projectId: string,
): Promise<void> {
  for (const section of PITCH_SECTIONS) {
    const regex = new RegExp(`PITCH_${section}\\s*[:：]\\s*(.+)`, "i");
    const match = text.match(regex);
    if (match) {
      const content = match[1].trim();
      if (content) {
        await upsertPitchSection(projectId, section.toLowerCase(), content);
      }
    }
  }
}

async function extractTokenLaunch(
  text: string,
  projectId: string,
  stageId: string,
): Promise<void> {
  const dxrMatch = text.match(/TOKEN_DXR_STRATEGY\s*[:：]\s*(.+)/i);
  if (dxrMatch) {
    await upsertTokenLaunchPlan(projectId, {
      dxrStrategy: dxrMatch[1].trim(),
    });
  }

  const launchpadsMatch = text.match(
    /TOKEN_RECOMMENDED_LAUNCHPADS\s*[:：]\s*(.+)/i,
  );
  if (launchpadsMatch) {
    await upsertTokenLaunchPlan(projectId, {
      targetLaunchpads: launchpadsMatch[1].trim(),
    });
  }

  const gapsMatch = text.match(/TOKEN_READINESS_GAPS\s*[:：]\s*(.+)/i);
  if (gapsMatch) {
    await upsertArtifact(
      stageId,
      "decision",
      "token_readiness_gaps",
      gapsMatch[1].trim(),
    );
  }
}

async function extractDecision(text: string, stageId: string): Promise<void> {
  const patterns: [RegExp, string][] = [
    [/DECISION_VERDICT\s*[:：]\s*(.+)/i, "decision_verdict"],
    [/DECISION_REASON\s*[:：]\s*(.+)/i, "decision_reason"],
    [/DECISION_NEXT_STEP\s*[:：]\s*(.+)/i, "decision_next_step"],
  ];
  for (const [regex, key] of patterns) {
    const match = text.match(regex);
    if (match) {
      const value = match[1].trim();
      if (value) {
        await upsertArtifact(stageId, "decision", key, value);
      }
    }
  }
}
