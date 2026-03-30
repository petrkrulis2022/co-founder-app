import { notFound } from "next/navigation";
import { getProjectWithStages } from "@/lib/db/queries/projects";
import { getOrCreateStage } from "@/lib/db/queries/stages";
import { getMessages } from "@/lib/db/queries/messages";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getStageConfig, STAGES } from "@/lib/stages";
import { StageHeader } from "@/components/stage/stage-header";
import { ChatInterface } from "@/components/stage/chat-interface";
import { ContextPanel } from "@/components/stage/context-panel";

const VALID_STAGE_KEYS = STAGES.map((s) => s.key);

export default async function StagePage({
  params,
}: {
  params: Promise<{ id: string; stageKey: string }>;
}) {
  const { id, stageKey } = await params;

  if (!VALID_STAGE_KEYS.includes(stageKey)) {
    notFound();
  }

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
      <div className="flex-1 min-h-0">
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
    </div>
  );
}
