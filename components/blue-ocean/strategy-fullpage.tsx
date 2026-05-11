"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlueOceanStrategyGrid } from "./strategy-grid";

interface BlueOceanStrategyFullPageProps {
  projectId: string;
  projectName: string;
}

export function BlueOceanStrategyFullPage({
  projectId,
  projectName,
}: BlueOceanStrategyFullPageProps) {
  const router = useRouter();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0 print:hidden">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <span className="text-sm text-muted-foreground">
            {projectName} — Blue Ocean Strategy
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="gap-2"
        >
          <Printer className="w-4 h-4" />
          Print / Save PDF
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <BlueOceanStrategyGrid projectId={projectId} />
      </div>
    </div>
  );
}
