import { notFound } from "next/navigation";
import { getProjectWithStages } from "@/lib/db/queries/projects";
import { getOrCreateStage } from "@/lib/db/queries/stages";
import { getMessages } from "@/lib/db/queries/messages";
import { getSprintEntries } from "@/lib/db/queries/sprints";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getStageConfig } from "@/lib/stages";
import { StageHeader } from "@/components/stage/stage-header";
import { ChatInterface } from "@/components/stage/chat-interface";
import { SprintBoard } from "@/components/sprint/sprint-board";

export default async function MafiaOfferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const project = await getProjectWithStages(id, user.id);
  if (!project) notFound();

  const stageConfig = getStageConfig("mafia-offer");
  if (!stageConfig) notFound();

  const stage = await getOrCreateStage(id, "mafia-offer");
  const [messages, sprints] = await Promise.all([
    getMessages(stage.id),
    getSprintEntries(id),
  ]);

  return (
    <div className="flex flex-col h-full">
      <StageHeader
        stageKey="mafia-offer"
        stageNumber={stageConfig.number}
        title={stageConfig.label}
        description={stageConfig.description}
        status={stage.status}
        stageColor={stageConfig.color}
        projectId={id}
      />
      <div className="flex flex-1 min-h-0">
        {/* Left: Chat */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1 min-h-0">
            <ChatInterface
              projectId={id}
              stageKey="mafia-offer"
              initialMessages={messages.map((m) => ({
                id: m.id,
                role: m.role,
                content: m.content,
              }))}
              stageColor={stageConfig.color}
            />
          </div>
        </div>
        {/* Right: Sprint Board */}
        <div className="hidden lg:block w-1/2 max-w-[560px] border-l border-border overflow-y-auto shrink-0">
          <SprintBoard
            projectId={id}
            initialSprints={sprints}
            stageColor={stageConfig.color}
          />
        </div>
      </div>
    </div>
  );
}
