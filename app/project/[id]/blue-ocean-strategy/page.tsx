import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/db/prisma";
import { BlueOceanStrategyFullPage } from "@/components/blue-ocean/strategy-fullpage";

interface BlueOceanStrategyPageProps {
  params: Promise<{ id: string }>;
}

export default async function BlueOceanStrategyPage({
  params,
}: BlueOceanStrategyPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  const project = await prisma.project.findFirst({
    where: { id, userId: user?.id },
  });

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <BlueOceanStrategyFullPage
      projectId={project.id}
      projectName={project.name}
    />
  );
}
