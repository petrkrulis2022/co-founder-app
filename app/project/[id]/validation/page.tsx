import { notFound } from "next/navigation";
import { getProjectWithStages } from "@/lib/db/queries/projects";
import { getOrCreateStage } from "@/lib/db/queries/stages";
import { getMessages } from "@/lib/db/queries/messages";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getStageConfig } from "@/lib/stages";
import { StageHeader } from "@/components/stage/stage-header";
import { ChatInterface } from "@/components/stage/chat-interface";
import { ContextPanel } from "@/components/stage/context-panel";
import { IdealClientProfilerCard } from "@/components/ideal-client/profiler-card";
import { BlueOceanStrategyCard } from "@/components/blue-ocean/strategy-card";

export default async function ValidationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const stageKey = "validation";

  const user = await getCurrentUser();
  if (!user) notFound();

  const project = await getProjectWithStages(id, user.id);
  if (!project) notFound();

  const stageConfig = getStageConfig(stageKey);
  if (!stageConfig) notFound();

  const stage = await getOrCreateStage(id, stageKey);
  const messages = await getMessages(stage.id);

  return (
    <div className="flex flex-col h-full">
      <StageHeader
        stageKey={stageKey}
        stageNumber={stageConfig.number}
        title={stageConfig.label}
        description={stageConfig.description}
        status={stage.status}
        stageColor={stageConfig.color}
        projectId={id}
      />
      <div className="px-4 pb-2">
        <ContextPanel projectId={id} stageColor={stageConfig.color} />
      </div>

      {/* Main content area with chat and strategic frameworks */}
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 h-full">
          {/* Chat interface - takes 2 columns on large screens */}
          <div className="lg:col-span-2 min-h-0 flex flex-col">
            <ChatInterface
              projectId={id}
              stageKey={stageKey}
              initialMessages={messages.map((m) => ({
                id: m.id,
                role: m.role,
                content: m.content,
              }))}
              stageColor={stageConfig.color}
            />
          </div>

          {/* Strategic frameworks cards - sidebar on large screens */}
          <div className="lg:col-span-1 space-y-4">
            <BlueOceanStrategyCard projectId={id} />
            <IdealClientProfilerCard projectId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}
