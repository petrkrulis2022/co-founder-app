import { notFound } from "next/navigation";
import { getProjectWithStages } from "@/lib/db/queries/projects";
import { getOrCreateStage } from "@/lib/db/queries/stages";
import { getMessages } from "@/lib/db/queries/messages";
import { getMarketingCampaign } from "@/lib/db/queries/marketing-campaign";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getStageConfig } from "@/lib/stages";
import { StageHeader } from "@/components/stage/stage-header";
import { ChatInterface } from "@/components/stage/chat-interface";
import {
  CampaignDashboard,
  type CampaignData,
} from "@/components/marketing/campaign-dashboard";

export default async function MarketingCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const project = await getProjectWithStages(id, user.id);
  if (!project) notFound();

  const stageConfig = getStageConfig("marketing-campaign");
  if (!stageConfig) notFound();

  const stage = await getOrCreateStage(id, "marketing-campaign");
  const [messages, campaign] = await Promise.all([
    getMessages(stage.id),
    getMarketingCampaign(id),
  ]);

  return (
    <div className="flex flex-col h-full">
      <StageHeader
        stageKey="marketing-campaign"
        stageNumber={stageConfig.number}
        title={stageConfig.label}
        description={stageConfig.description}
        status={stage.status}
        stageColor={stageConfig.color}
        projectId={id}
      />
      <div className="flex flex-1 min-h-0">
        {/* Left: Campaign Dashboard */}
        <div className="hidden lg:block w-[440px] border-r border-border overflow-y-auto shrink-0">
          <CampaignDashboard
            projectId={id}
            initialData={campaign as CampaignData | null}
            stageColor={stageConfig.color}
          />
        </div>
        {/* Right: Chat */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1 min-h-0">
            <ChatInterface
              projectId={id}
              stageKey="marketing-campaign"
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
