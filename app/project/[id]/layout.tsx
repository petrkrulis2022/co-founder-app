import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectWithStages } from "@/lib/db/queries/projects";
import { getCurrentUser } from "@/lib/auth/get-user";
import { STAGES } from "@/lib/stages";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StageNav } from "@/components/sidebar/stage-nav";
import { MobileSidebar } from "@/components/sidebar/mobile-sidebar";
import { CommandPalette } from "@/components/command-palette";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const project = await getProjectWithStages(id, user.id);
  if (!project) notFound();

  const stageStatusMap: Record<string, string> = {};
  for (const s of project.stages) {
    stageStatusMap[s.stageKey] = s.status;
  }
  const completedCount = project.stages.filter(
    (s: { status: string }) => s.status === "complete",
  ).length;
  const progress = Math.round((completedCount / 13) * 100);

  const sidebarContent = (
    <>
      <div className="p-4 border-b border-border">
        <Link
          href="/dashboard"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Dashboard
        </Link>
        <h2 className="text-sm font-semibold mt-2 truncate">{project.name}</h2>
        <div className="flex items-center gap-2 mt-1.5">
          {project.domain && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {project.domain}
            </Badge>
          )}
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 capitalize"
          >
            {project.status}
          </Badge>
        </div>
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Progress</span>
            <span>{completedCount}/13</span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      </div>
      <StageNav
        projectId={id}
        stages={STAGES}
        stageStatusMap={stageStatusMap}
      />
      <div className="p-4 border-t border-border space-y-2">
        <Link
          href={`/project/${id}`}
          className="block text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Overview
        </Link>
        <Link
          href={`/project/${id}/export`}
          className="block text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Export →
        </Link>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-[260px] flex-col border-r border-border bg-card shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile header + Sheet */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="md:hidden flex items-center justify-between border-b border-border px-4 py-2 bg-card">
          <MobileSidebar projectName={project.name}>
            {sidebarContent}
          </MobileSidebar>
          <span className="text-xs text-muted-foreground">
            {completedCount}/13
          </span>
        </div>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <CommandPalette projectId={id} />
    </div>
  );
}
