import type { Project, StressScore } from "@prisma/client";

const SECTION_ORDER = [
  "one_liner",
  "team",
  "problem",
  "product",
  "gtm",
  "business_model",
  "traction",
  "competitive",
  "vision",
  "use_of_funds",
] as const;

const SECTION_TITLES: Record<string, string> = {
  one_liner: "One-Liner",
  team: "Team Overview",
  problem: "Problem & Market",
  product: "Product Overview",
  gtm: "GTM Strategy",
  business_model: "Business Model",
  traction: "Traction",
  competitive: "Competitive Landscape",
  vision: "Vision",
  use_of_funds: "Use of Funds",
};

function escapeText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function generatePdfHtml(title: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { 
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 12pt; line-height: 1.6; color: #1a1a1a;
    max-width: 700px; margin: 0 auto; padding: 40px;
  }
  h1 { font-size: 24pt; font-weight: 700; margin-bottom: 4px; }
  h2 { font-size: 16pt; font-weight: 600; margin-top: 32px; border-bottom: 1px solid #e5e5e5; padding-bottom: 8px; }
  .meta { color: #666; font-size: 10pt; margin-bottom: 24px; }
  .section { margin-bottom: 24px; }
  .section p { white-space: pre-wrap; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e5e5; font-size: 9pt; color: #999; text-align: center; }
  .cover { text-align: center; padding: 100px 0 60px; }
  .badge { display: inline-block; background: #f0f0f0; padding: 4px 12px; border-radius: 12px; font-size: 10pt; color: #666; }
  .empty { color: #999; font-style: italic; }
</style>
</head>
<body>
${body}
</body>
</html>`;
}

export async function generateInvestorMemo(
  project: Project,
  pitchSections: Record<string, string>,
): Promise<Buffer> {
  const date = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  let body = `
<div class="cover">
  <h1>${escapeText(project.name)}</h1>
  ${project.domain ? `<span class="badge">${escapeText(project.domain)}</span>` : ""}
  <p class="meta">${date} · Confidential</p>
</div>
<hr>
<h2>Table of Contents</h2>
<ol>
${SECTION_ORDER.map((key) => `  <li>${SECTION_TITLES[key]}</li>`).join("\n")}
</ol>
<hr>
`;

  for (const key of SECTION_ORDER) {
    const content = pitchSections[key];
    body += `
<div class="section">
  <h2>${SECTION_TITLES[key]}</h2>
  ${content ? `<p>${escapeText(content)}</p>` : `<p class="empty">Section not yet completed</p>`}
</div>`;
  }

  body += `
<div class="footer">
  Prepared with Founder OS · ${date}
</div>`;

  const html = generatePdfHtml(`${project.name} - Investor Memo`, body);
  return Buffer.from(html, "utf-8");
}

export async function generateLeanCanvas(
  project: Project,
  leanCanvas: Record<string, string | null>,
): Promise<Buffer> {
  const fields = [
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
  ];

  const fieldLabels: Record<string, string> = {
    problem: "Problem",
    solution: "Solution",
    uvp: "Unique Value Proposition",
    unfairAdvantage: "Unfair Advantage",
    customerSegments: "Customer Segments",
    existingAlternatives: "Existing Alternatives",
    keyMetrics: "Key Metrics",
    channels: "Channels",
    costStructure: "Cost Structure",
    revenueStreams: "Revenue Streams",
    highLevelConcept: "High-Level Concept",
    earlyAdopters: "Early Adopters",
  };

  let body = `
<div class="cover">
  <h1>${escapeText(project.name)} — Lean Canvas</h1>
</div>
<hr>`;

  for (const f of fields) {
    const val = leanCanvas[f];
    body += `
<div class="section">
  <h2>${fieldLabels[f]}</h2>
  ${val ? `<p>${escapeText(val)}</p>` : `<p class="empty">Not filled</p>`}
</div>`;
  }

  body += `<div class="footer">Prepared with Founder OS</div>`;
  return Buffer.from(
    generatePdfHtml(`${project.name} - Lean Canvas`, body),
    "utf-8",
  );
}

export async function generateValidationReport(
  project: Project,
  scores: StressScore[],
  stages: { stageKey: string; summary: string | null }[],
  sprints: { sprintNumber: number; status: string; outcome: string | null }[],
): Promise<Buffer> {
  let body = `
<div class="cover">
  <h1>${escapeText(project.name)} — Validation Report</h1>
  ${project.thesis ? `<p>${escapeText(project.thesis)}</p>` : ""}
  ${project.domain ? `<span class="badge">${escapeText(project.domain)}</span>` : ""}
</div>
<hr>

<div class="section">
  <h2>Stress Test Scores</h2>
  ${scores.length > 0 ? scores.map((s) => `<p><strong>${escapeText(s.dimension)}</strong>: ${s.score}/10${s.notes ? ` — ${escapeText(s.notes)}` : ""}</p>`).join("\n") : `<p class="empty">No scores recorded</p>`}
</div>

<div class="section">
  <h2>Sprint Outcomes</h2>
  ${sprints.length > 0 ? sprints.map((s) => `<p><strong>Sprint ${s.sprintNumber}</strong> (${s.status})${s.outcome ? `: ${escapeText(s.outcome)}` : ""}</p>`).join("\n") : `<p class="empty">No sprints recorded</p>`}
</div>

<div class="section">
  <h2>Stage Summaries</h2>
  ${
    stages
      .filter((s) => s.summary)
      .map(
        (s) =>
          `<p><strong>${escapeText(s.stageKey)}</strong>: ${escapeText(s.summary!)}</p>`,
      )
      .join("\n") || `<p class="empty">No stage summaries recorded</p>`
  }
</div>

<div class="footer">Prepared with Founder OS</div>`;

  return Buffer.from(
    generatePdfHtml(`${project.name} - Validation Report`, body),
    "utf-8",
  );
}
