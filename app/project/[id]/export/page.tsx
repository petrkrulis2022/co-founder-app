import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getProjectWithStages } from "@/lib/db/queries/projects";
import { getScores } from "@/lib/db/queries/scores";
import { getLeanCanvas } from "@/lib/db/queries/lean-canvas";
import { getPitchSections } from "@/lib/db/queries/pitch";
import { ExportCards } from "@/components/export/export-cards";

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

export default async function ExportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const project = await getProjectWithStages(id, user.id);
  if (!project) notFound();

  const [scores, canvas, pitchSections] = await Promise.all([
    getScores(id),
    getLeanCanvas(id),
    getPitchSections(id),
  ]);

  const completedStages = project.stages.filter(
    (s: { status: string }) => s.status === "complete",
  ).length;

  const hasScores = scores.length > 0;
  const canvasFilled = canvas
    ? CANVAS_FIELDS.filter((f) => {
        const val = canvas[f as keyof typeof canvas];
        return typeof val === "string" && val.trim();
      }).length
    : 0;
  const hasPitch = pitchSections.length > 0;

  const exportOptions = [
    {
      key: "investor_memo",
      title: "Investor Memo",
      description: "Export your 10-section pitch as a formatted HTML memo",
      icon: "📊",
      ready: hasPitch,
      readyLabel: `${pitchSections.length} section${pitchSections.length !== 1 ? "s" : ""} ready`,
      notReadyLabel: "Complete the Pitch stage first",
      type: "text/html",
      ext: "html",
    },
    {
      key: "pitch_deck",
      title: "Pitch Deck (PPTX)",
      description: "Download a 10-slide PowerPoint pitch deck",
      icon: "🎯",
      ready: hasPitch,
      readyLabel: `${pitchSections.length} section${pitchSections.length !== 1 ? "s" : ""} ready`,
      notReadyLabel: "Complete the Pitch stage first",
      type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ext: "pptx",
    },
    {
      key: "lean_canvas",
      title: "Lean Canvas",
      description: "Download your Lean Canvas as formatted HTML",
      icon: "🟩",
      ready: canvasFilled >= 6,
      readyLabel: `${canvasFilled}/12 blocks filled`,
      notReadyLabel: `Fill at least 6 blocks (${canvasFilled}/12)`,
      type: "text/html",
      ext: "html",
    },
    {
      key: "validation_report",
      title: "Validation Report",
      description: "Export stress test scores and validation summary",
      icon: "📄",
      ready: hasScores,
      readyLabel: `${scores.length} dimension${scores.length !== 1 ? "s" : ""} scored`,
      notReadyLabel: "Complete the Stress Test stage first",
      type: "text/html",
      ext: "html",
    },
    {
      key: "launchpad_pack",
      title: "Launchpad Pack",
      description: "Complete bundle: memo, deck, canvas, and report",
      icon: "🚀",
      ready: completedStages >= 5,
      readyLabel: `${completedStages} stages completed`,
      notReadyLabel: `Complete at least 5 stages (${completedStages})`,
      type: "application/zip",
      ext: "zip",
    },
  ];

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Export</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Export your project data and documents
        </p>
      </div>
      <ExportCards projectId={id} options={exportOptions} />
    </div>
  );
}
