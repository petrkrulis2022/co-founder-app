"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target } from "lucide-react";

interface IdealClientProfilerCardProps {
  projectId: string;
}

export function IdealClientProfilerCard({
  projectId,
}: IdealClientProfilerCardProps) {
  const router = useRouter();

  return (
    <Card className="p-6 border-2 hover:border-purple-500/50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold">Ideal Client Profiler</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Define your ideal customer&apos;s before/after journey, market narrative,
            and purchase drivers
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="p-2 bg-blue-500/10 rounded">
            <div className="text-xs text-muted-foreground">BEFORE State</div>
            <div className="font-semibold text-sm">Current Reality</div>
          </div>
          <div className="p-2 bg-green-500/10 rounded">
            <div className="text-xs text-muted-foreground">AFTER State</div>
            <div className="font-semibold text-sm">Transformation</div>
          </div>
          <div className="p-2 bg-purple-500/10 rounded">
            <div className="text-xs text-muted-foreground">Narrative</div>
            <div className="font-semibold text-sm">Your Story</div>
          </div>
          <div className="p-2 bg-orange-500/10 rounded">
            <div className="text-xs text-muted-foreground">Drivers</div>
            <div className="font-semibold text-sm">Purchase Triggers</div>
          </div>
        </div>
      </div>

      <Button
        onClick={() =>
          router.push(`/project/${projectId}/ideal-client-profiler`)
        }
        className="w-full mt-6 gap-2"
        variant="default"
      >
        Open Profiler
        <ArrowRight className="w-4 h-4" />
      </Button>
    </Card>
  );
}
