"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CanvasGrid } from "./canvas-grid";

interface CanvasFullPageProps {
  projectId: string;
  projectName: string;
}

export function CanvasFullPage({
  projectId,
  projectName,
}: CanvasFullPageProps) {
  const router = useRouter();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-background canvas-fullpage">
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
            {projectName} — Lean Canvas
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

      {/* Canvas grid — scrollable body */}
      <div className="flex-1 overflow-y-auto">
        <CanvasGrid projectId={projectId} fullPage />
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          .canvas-fullpage {
            display: block;
          }
          body * {
            visibility: hidden;
          }
          .canvas-fullpage,
          .canvas-fullpage * {
            visibility: visible;
          }
          .canvas-fullpage {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
