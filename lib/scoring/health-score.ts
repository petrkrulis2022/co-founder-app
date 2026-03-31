import type {
  Project,
  Stage,
  StressScore,
  LeanCanvas,
  PitchSection,
  SprintEntry,
  Message,
} from "@prisma/client";

export interface HealthScore {
  total: number;
  grade: string;
  color: string;
  breakdown: {
    validation: number;
    canvas: number;
    customer: number;
    pitch: number;
    momentum: number;
  };
  weakest: string;
  strongest: string;
  summary: string;
}

export interface ProjectWithAllData {
  project: Project;
  stages: Stage[];
  scores: StressScore[];
  leanCanvas: LeanCanvas | null;
  pitchSections: PitchSection[];
  sprintEntries: SprintEntry[];
  messageCount: number;
}

const CANVAS_FIELDS = [
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
] as const;

function scoreValidation(scores: StressScore[]): number {
  let points = 0;
  if (scores.length > 0) points += 5;
  if (scores.length >= 7) points += 5;
  if (scores.length > 0) {
    const avg = scores.reduce((s, v) => s + v.score, 0) / scores.length;
    if (avg >= 6) points += 5;
    if (avg >= 8) points += 5;
  }
  const allAbove4 = scores.length > 0 && scores.every((s) => s.score >= 4);
  if (allAbove4) points += 5;
  return points;
}

function scoreCanvas(canvas: LeanCanvas | null): number {
  if (!canvas) return 0;
  let points = 0;
  const filled = CANVAS_FIELDS.filter((f) => {
    const val = canvas[f as keyof LeanCanvas];
    return typeof val === "string" && val.trim().length > 0;
  }).length;
  if (filled >= 4) points += 5;
  if (filled >= 8) points += 5;
  if (filled >= 12) points += 5;
  const uvpFilled =
    typeof canvas.uvp === "string" && canvas.uvp.trim().length > 0;
  const problemFilled =
    typeof canvas.problem === "string" && canvas.problem.trim().length > 0;
  if (uvpFilled && problemFilled) points += 5;
  return points;
}

function scoreCustomer(sprints: SprintEntry[]): number {
  let points = 0;
  const s1 = sprints.find((s) => s.sprintNumber === 1 && s.outcome !== null);
  if (s1) points += 5;
  const s2 = sprints.find((s) => s.sprintNumber === 2 && s.outcome !== null);
  if (s2) points += 5;
  const s4 = sprints.find((s) => s.sprintNumber === 4 && s.outcome !== null);
  if (s4) points += 5;
  if (s4 && s4.commitments >= 5) points += 5;
  return points;
}

function scorePitch(pitchSections: PitchSection[]): number {
  let points = 0;
  const filled = pitchSections.filter((s) => s.content.trim().length > 0);
  if (filled.length >= 3) points += 5;
  if (filled.length >= 7) points += 5;
  if (filled.length >= 10) points += 5;
  const hasOneLiner = pitchSections.some(
    (s) => s.section === "one_liner" && s.content.trim().length > 0,
  );
  if (hasOneLiner) points += 5;
  return points;
}

function scoreMomentum(
  stages: Stage[],
  project: Project,
  messageCount: number,
): number {
  let points = 0;
  const stagesWithSummary = stages.filter(
    (s) => s.summary && s.summary.trim().length > 0,
  );
  if (stagesWithSummary.length > 3) points += 5;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  if (project.updatedAt > sevenDaysAgo) points += 5;
  if (messageCount > 20) points += 5;
  return points;
}

function getGrade(total: number): { grade: string; color: string } {
  if (total >= 90) return { grade: "A", color: "#00ff9d" };
  if (total >= 75) return { grade: "B", color: "#00d4ff" };
  if (total >= 55) return { grade: "C", color: "#ffaa00" };
  if (total >= 35) return { grade: "D", color: "#ff6b35" };
  return { grade: "F", color: "#ff4444" };
}

function getSummary(grade: string): string {
  switch (grade) {
    case "A":
      return "Strong validation, customer evidence, and pitch-ready.";
    case "B":
      return "Well-validated with good traction signals.";
    case "C":
      return "Moderate validation. Customer discovery needs work.";
    case "D":
      return "Early stage. Complete more validation before pitching.";
    default:
      return "Just getting started. Work through the early stages first.";
  }
}

export function computeHealthScore(data: ProjectWithAllData): HealthScore {
  const validation = scoreValidation(data.scores);
  const canvas = scoreCanvas(data.leanCanvas);
  const customer = scoreCustomer(data.sprintEntries);
  const pitch = scorePitch(data.pitchSections);
  const momentum = scoreMomentum(data.stages, data.project, data.messageCount);

  const total = validation + canvas + customer + pitch + momentum;
  const { grade, color } = getGrade(total);

  const breakdown = { validation, canvas, customer, pitch, momentum };
  const entries = Object.entries(breakdown) as [string, number][];
  const sorted = [...entries].sort((a, b) => a[1] - b[1]);
  const weakest = sorted[0][0];
  const strongest = sorted[sorted.length - 1][0];

  return {
    total,
    grade,
    color,
    breakdown,
    weakest,
    strongest,
    summary: getSummary(grade),
  };
}
