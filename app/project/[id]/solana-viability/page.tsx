import { getCurrentUser } from "@/lib/auth/get-user";
import { getProject } from "@/lib/db/queries/projects";
import { getSolanaViability } from "@/lib/db/queries/solana-viability";
import { SolanaViabilityChecker } from "@/components/solana/viability-checker";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Solana Viability Checker",
};

export default async function SolanaViabilityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const { id } = await params;
  const project = await getProject(id, user.id);

  if (!project) redirect("/dashboard");

  const analysis = await getSolanaViability(id);

  // Convert Prisma response to component-compatible format
  const initialData = analysis
    ? {
        id: analysis.id,
        projectId: analysis.projectId,
        query: analysis.query ?? "",
        gapDetails: analysis.gapDetails ?? null,
        gapClassification: analysis.gapClassification ?? null,
        recommendations: analysis.recommendations ?? null,
        revenueModel: analysis.revenueModel ?? null,
        gtmStrategy: analysis.gtmStrategy ?? null,
        risks: analysis.risks ?? null,
        analysedAt: analysis.analysedAt.toISOString(),
      }
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="max-w-4xl mx-auto">
        {/* Header with project context */}
        <div className="px-6 py-8 border-b border-border/50">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">
              Check your project's viability on Solana using Colosseum Copilot
            </p>
          </div>
        </div>

        {/* Main Content */}
        <SolanaViabilityChecker projectId={id} initialData={initialData} />
      </div>
    </div>
  );
}
