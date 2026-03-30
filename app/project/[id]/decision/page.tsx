import { notFound } from "next/navigation";
import { getProjectWithStages } from "@/lib/db/queries/projects";
import { getOrCreateStage } from "@/lib/db/queries/stages";
import { getMessages } from "@/lib/db/queries/messages";
import { getScores } from "@/lib/db/queries/scores";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getStageConfig } from "@/lib/stages";
import { StageHeader } from "@/components/stage/stage-header";
import { ChatInterface } from "@/components/stage/chat-interface";
import { DecisionDashboard } from "@/components/decision/decision-dashboard";

export default async function DecisionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const project = await getProjectWithStages(id, user.id);
  if (!project) notFound();

  const stageConfig = getStageConfig("decision");
  if (!stageConfig) notFound();

  const stage = await getOrCreateStage(id, "decision");
  const [messages, scores] = await Promise.all([
    getMessages(stage.id),
    getScores(id),
  ]);

  return (
    <div className="flex flex-col h-full">
      <StageHeader
        stageKey="decision"
        stageNumber={stageConfig.number}
        title={stageConfig.label}
        description={stageConfig.description}
        status={stage.status}
        stageColor={stageConfig.color}
        projectId={id}
      />
      <div className="flex flex-1 min-h-0">
        {/* Left: Decision Dashboard */}
        <div className="hidden lg:block w-[400px] border-r border-border overflow-y-auto shrink-0">
          <DecisionDashboard
            projectId={id}
            scores={scores}
            stages={project.stages.map(
              (s: { stageKey: string; status: string }) => ({
                stageKey: s.stageKey,
                status: s.status,
              }),
            )}
            stageColor={stageConfig.color}
          />
        </div>
        {/* Right: Chat */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1 min-h-0">
            <ChatInterface
              projectId={id}
              stageKey="decision"
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
