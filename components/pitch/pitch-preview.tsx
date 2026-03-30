"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const SECTION_LABELS: Record<string, string> = {
  title_slide: "Title Slide",
  problem: "Problem",
  solution: "Solution",
  market_size: "Market Size",
  business_model: "Business Model",
  traction: "Traction",
  team: "Team",
  tokenomics: "Tokenomics",
  roadmap: "Roadmap",
  ask: "Ask",
};

interface PitchPreviewProps {
  projectName: string;
  sections: Record<string, string>;
  stageColor: string;
}

export function PitchPreview({
  projectName,
  sections,
  stageColor,
}: PitchPreviewProps) {
  const [open, setOpen] = useState(false);

  const filledSections = Object.entries(sections).filter(([, v]) => v?.trim());

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            disabled={filledSections.length === 0}
          />
        }
      >
        Preview Memo
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{projectName} — Investor Memo</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          {filledSections.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No sections written yet. Start filling in sections to see a
              preview.
            </p>
          ) : (
            filledSections.map(([key, content]) => (
              <div key={key}>
                <h3
                  className="text-sm font-semibold mb-2"
                  style={{ color: stageColor }}
                >
                  {SECTION_LABELS[key] || key}
                </h3>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {content}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
