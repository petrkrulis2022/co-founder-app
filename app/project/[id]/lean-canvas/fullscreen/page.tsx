import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/get-user";
import { CanvasFullPage } from "@/components/lean-canvas/canvas-fullpage";

export default async function LeanCanvasFullscreenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const project = await prisma.project.findFirst({
    where: { id, userId: user.id },
  });
  if (!project) notFound();

  return <CanvasFullPage projectId={id} projectName={project.name} />;
}
