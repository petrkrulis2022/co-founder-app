"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Waves } from "lucide-react";

interface BlueOceanStrategyCardProps {
  projectId: string;
}

export function BlueOceanStrategyCard({
  projectId,
}: BlueOceanStrategyCardProps) {
  const router = useRouter();

  return (
    <Card className="p-6 border-2 hover:border-blue-500/50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Waves className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold">Blue Ocean Strategy</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Escape the red ocean and create uncontested market space with the
            Four Actions Framework
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="p-2 bg-red-500/10 rounded">
            <div className="text-xs text-muted-foreground">Red Ocean</div>
            <div className="font-semibold text-sm">Competing On</div>
          </div>
          <div className="p-2 bg-blue-500/10 rounded">
            <div className="text-xs text-muted-foreground">Blue Ocean</div>
            <div className="font-semibold text-sm">Value Innovation</div>
          </div>
          <div className="p-2 bg-purple-500/10 rounded">
            <div className="text-xs text-muted-foreground">Four Actions</div>
            <div className="font-semibold text-sm">E-R-C-I</div>
          </div>
          <div className="p-2 bg-green-500/10 rounded">
            <div className="text-xs text-muted-foreground">Differentiation</div>
            <div className="font-semibold text-sm">Strategic Focus</div>
          </div>
        </div>
      </div>

      <Button
        onClick={() => router.push(`/project/${projectId}/blue-ocean-strategy`)}
        className="w-full mt-6 gap-2"
        variant="default"
      >
        Open Strategy
        <ArrowRight className="w-4 h-4" />
      </Button>
    </Card>
  );
}
