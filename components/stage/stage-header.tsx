"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface StageHeaderProps {
  stageKey: string;
  stageNumber: number;
  title: string;
  description: string;
  status: string;
  stageColor: string;
  projectId: string;
  children?: React.ReactNode;
}

export function StageHeader({
  stageKey,
  stageNumber,
  title,
  description,
  status,
  stageColor,
  projectId,
  children,
}: StageHeaderProps) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(status);
  const [isUpdating, setIsUpdating] = useState(false);

  const markComplete = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch("/api/stages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          stageKey,
          status: "complete",
        }),
      });
      if (res.ok) {
        setCurrentStatus("complete");
        router.refresh();
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="border-b border-border px-6 py-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold font-mono"
          style={{ backgroundColor: stageColor, color: "#050505" }}
        >
          {String(stageNumber).padStart(2, "0")}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">{title}</h1>
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 border-transparent"
              style={{ backgroundColor: `${stageColor}15`, color: stageColor }}
            >
              Stage {String(stageNumber).padStart(2, "0")}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {children}
        {currentStatus === "complete" ? (
          <span className="text-xs text-[#00ff9d] flex items-center gap-1">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 7l3 3 5-5" />
            </svg>
            Completed
          </span>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={markComplete}
            disabled={isUpdating}
            className="text-xs"
          >
            {isUpdating ? "Updating..." : "Mark Complete"}
          </Button>
        )}
      </div>
    </div>
  );
}
