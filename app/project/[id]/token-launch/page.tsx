import { notFound } from "next/navigation";
import { getProjectWithStages } from "@/lib/db/queries/projects";
import { getOrCreateStage } from "@/lib/db/queries/stages";
import { getMessages } from "@/lib/db/queries/messages";
import { getTokenLaunchPlan } from "@/lib/db/queries/token-launch";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getStageConfig } from "@/lib/stages";
import { StageHeader } from "@/components/stage/stage-header";
import { ChatInterface } from "@/components/stage/chat-interface";
import { LaunchDashboard } from "@/components/token-launch/launch-dashboard";

export default async function TokenLaunchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const project = await getProjectWithStages(id, user.id);
  if (!project) notFound();

  const stageConfig = getStageConfig("token-launch");
  if (!stageConfig) notFound();

  const stage = await getOrCreateStage(id, "token-launch");
  const [messages, plan] = await Promise.all([
    getMessages(stage.id),
    getTokenLaunchPlan(id),
  ]);

  return (
    <div className="flex flex-col h-full">
      <StageHeader
        stageKey="token-launch"
        stageNumber={stageConfig.number}
        title={stageConfig.label}
        description={stageConfig.description}
        status={stage.status}
        stageColor={stageConfig.color}
        projectId={id}
      />
      <div className="flex flex-1 min-h-0">
        {/* Left: Launch Dashboard */}
        <div className="hidden lg:block w-[440px] border-r border-border overflow-y-auto shrink-0">
          <LaunchDashboard
            projectId={id}
            initialPlan={
              plan
                ? {
                    strategy: plan.dxrStrategy ?? undefined,
                    bearMarketTest: plan.bearMarketTest as
                      | Record<string, boolean>
                      | undefined,
                    checklist: plan.checklist as
                      | Record<string, boolean>
                      | undefined,
                    notes: plan.dxrNotes ?? undefined,
                  }
                : null
            }
            stageColor={stageConfig.color}
          />
        </div>
        {/* Right: Chat */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1 min-h-0">
            <ChatInterface
              projectId={id}
              stageKey="token-launch"
              initialMessages={messages.map((m) => ({
                id: m.id,
                role: m.role,
                content: m.content,
              }))}
              stageColor={stageConfig.color}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
