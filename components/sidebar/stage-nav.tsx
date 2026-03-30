"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { StageConfig } from "@/lib/stages";

interface StageNavProps {
  projectId: string;
  stages: StageConfig[];
  stageStatusMap: Record<string, string>;
}

function StatusDot({ status }: { status: string }) {
  const color =
    status === "completed"
      ? "bg-[#00ff9d]"
      : status === "in_progress"
        ? "bg-yellow-400"
        : "bg-[#333333]";
  return <span className={`inline-block w-2 h-2 rounded-full ${color}`} />;
}

export function StageNav({ projectId, stages, stageStatusMap }: StageNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 overflow-y-auto py-2 px-2">
      {stages.map((stage) => {
        const status = stageStatusMap[stage.key] || "not_started";
        const href = `/project/${projectId}/${stage.key}`;
        const isActive = pathname === href;

        return (
          <Link
            key={stage.key}
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors group ${
              isActive
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            }`}
          >
            <StatusDot status={status} />
            <span
              className="text-xs font-mono w-5 shrink-0"
              style={{ color: isActive ? stage.color : undefined }}
            >
              {String(stage.number).padStart(2, "0")}
            </span>
            <span className="truncate text-xs">{stage.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
