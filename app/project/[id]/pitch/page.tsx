import { notFound } from "next/navigation";
import { getProjectWithStages } from "@/lib/db/queries/projects";
import { getOrCreateStage } from "@/lib/db/queries/stages";
import { getMessages } from "@/lib/db/queries/messages";
import { getAllPitchSections } from "@/lib/db/queries/pitch";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getStageConfig } from "@/lib/stages";
import { StageHeader } from "@/components/stage/stage-header";
import { ChatInterface } from "@/components/stage/chat-interface";
import { SectionEditor } from "@/components/pitch/section-editor";
import { PitchPreview } from "@/components/pitch/pitch-preview";

export default async function PitchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const project = await getProjectWithStages(id, user.id);
  if (!project) notFound();

  const stageConfig = getStageConfig("pitch");
  if (!stageConfig) notFound();

  const stage = await getOrCreateStage(id, "pitch");
  const [messages, sections] = await Promise.all([
    getMessages(stage.id),
    getAllPitchSections(id),
  ]);

  return (
    <div className="flex flex-col h-full">
      <StageHeader
        stageKey="pitch"
        stageNumber={stageConfig.number}
        title={stageConfig.label}
        description={stageConfig.description}
        status={stage.status}
        stageColor={stageConfig.color}
        projectId={id}
      >
        <PitchPreview
          projectName={project.name}
          sections={sections}
          stageColor={stageConfig.color}
        />
      </StageHeader>
      <div className="flex flex-1 min-h-0">
        {/* Left: Section Editor */}
        <div className="hidden lg:block w-[440px] border-r border-border overflow-y-auto shrink-0">
          <SectionEditor
            projectId={id}
            sections={sections}
            stageColor={stageConfig.color}
          />
        </div>
        {/* Right: Chat */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1 min-h-0">
            <ChatInterface
              projectId={id}
              stageKey="pitch"
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
