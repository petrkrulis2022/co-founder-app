import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/db/prisma";
import { IdealClientProfilerFullPage } from "@/components/ideal-client/profiler-fullpage";

interface IdealClientProfilerPageProps {
  params: Promise<{ id: string }>;
}

export default async function IdealClientProfilerPage({
  params,
}: IdealClientProfilerPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  const project = await prisma.project.findFirst({
    where: { id, userId: user?.id },
  });

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <IdealClientProfilerFullPage
      projectId={project.id}
      projectName={project.name}
    />
  );
}
