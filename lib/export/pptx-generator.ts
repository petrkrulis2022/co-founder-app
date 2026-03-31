import PptxGenJS from "pptxgenjs";
import type { Project, StressScore } from "@prisma/client";

const SECTION_TITLES: Record<string, string> = {
  one_liner: "One-Liner",
  team: "The Team",
  problem_market: "The Problem",
  product: "Our Solution",
  gtm_strategy: "Go To Market",
  business_model: "How We Make Money",
  traction: "Traction",
  competitive_landscape: "Why We Win",
  vision: "Vision & Ask",
  use_of_funds: "Use of Funds",
};

const SLIDE_MAP: { key: string; title: string }[] = [
  { key: "cover", title: "Cover" },
  { key: "problem_market", title: "The Problem" },
  { key: "product", title: "Our Solution" },
  { key: "product", title: "Why Now?" },
  { key: "business_model", title: "How We Make Money" },
  { key: "gtm_strategy", title: "Go To Market" },
  { key: "traction", title: "Traction" },
  { key: "team", title: "The Team" },
  { key: "competitive_landscape", title: "Why We Win" },
  { key: "vision", title: "Vision & Ask" },
];

export async function generatePitchDeck(
  project: Project,
  pitchSections: Record<string, string>,
  scores: StressScore[],
): Promise<Buffer> {
  const pptx = new PptxGenJS();
  pptx.author = "Founder OS";
  pptx.title = `${project.name} - Pitch Deck`;
  pptx.layout = "LAYOUT_WIDE";

  const accentColor = "00d4ff";
  const bgColor = "0a0a0a";
  const textColor = "e5e5e5";
  const mutedColor = "888888";

  // Slide 1: Cover
  const slide1 = pptx.addSlide();
  slide1.background = { color: bgColor };
  slide1.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: "100%",
    h: 0.08,
    fill: { color: accentColor },
  });
  slide1.addText(project.name, {
    x: 1,
    y: 1.8,
    w: 11,
    fontSize: 36,
    bold: true,
    color: textColor,
  });
  if (project.domain) {
    slide1.addText(project.domain, {
      x: 1,
      y: 2.8,
      w: 4,
      fontSize: 14,
      color: accentColor,
    });
  }
  const oneLiner = pitchSections["one_liner"];
  if (oneLiner) {
    slide1.addText(oneLiner, {
      x: 1,
      y: 3.3,
      w: 10,
      fontSize: 16,
      color: mutedColor,
    });
  }
  slide1.addText(
    new Date().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    }),
    { x: 1, y: 5, w: 4, fontSize: 12, color: mutedColor },
  );

  // Content slides
  const slideConfigs = [
    { key: "problem_market", title: "The Problem" },
    { key: "product", title: "Our Solution" },
    { key: "product", title: "Why Now?" },
    { key: "business_model", title: "How We Make Money" },
    { key: "gtm_strategy", title: "Go To Market" },
    { key: "traction", title: "Traction" },
    { key: "team", title: "The Team" },
    { key: "competitive_landscape", title: "Why We Win" },
    { key: "vision", title: "Vision & Ask" },
  ];

  for (const config of slideConfigs) {
    const slide = pptx.addSlide();
    slide.background = { color: bgColor };
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: "100%",
      h: 0.04,
      fill: { color: accentColor },
    });
    slide.addText(config.title, {
      x: 0.8,
      y: 0.4,
      w: 11,
      fontSize: 24,
      bold: true,
      color: textColor,
    });

    const content = pitchSections[config.key] || "Content to be added";
    // Truncate to fit slide
    const truncated =
      content.length > 800 ? content.substring(0, 800) + "..." : content;
    slide.addText(truncated, {
      x: 0.8,
      y: 1.2,
      w: 11,
      h: 4.5,
      fontSize: 14,
      color: mutedColor,
      valign: "top",
      wrap: true,
    });
  }

  // Appendix: Stress Test Scores
  if (scores.length > 0) {
    const appendix = pptx.addSlide();
    appendix.background = { color: bgColor };
    appendix.addText("Appendix: Stress Test Scores", {
      x: 0.8,
      y: 0.4,
      w: 11,
      fontSize: 20,
      bold: true,
      color: textColor,
    });

    const rows: PptxGenJS.TableRow[] = [
      [
        {
          text: "Dimension",
          options: { bold: true, color: textColor, fill: { color: "1a1a1a" } },
        },
        {
          text: "Score",
          options: { bold: true, color: textColor, fill: { color: "1a1a1a" } },
        },
      ],
    ];

    let total = 0;
    for (const s of scores) {
      total += s.score;
      rows.push([
        {
          text: s.dimension.charAt(0).toUpperCase() + s.dimension.slice(1),
          options: { color: mutedColor },
        },
        { text: `${s.score}/10`, options: { color: textColor } },
      ]);
    }

    rows.push([
      {
        text: "Average",
        options: { bold: true, color: accentColor },
      },
      {
        text: `${(total / scores.length).toFixed(1)}/10`,
        options: { bold: true, color: accentColor },
      },
    ]);

    appendix.addTable(rows, {
      x: 0.8,
      y: 1.2,
      w: 8,
      fontSize: 12,
      border: { type: "solid", pt: 0.5, color: "333333" },
      color: mutedColor,
    });
  }

  const arrayBuffer = await pptx.write({ outputType: "arraybuffer" });
  return Buffer.from(arrayBuffer as ArrayBuffer);
}
