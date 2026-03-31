"use client";

import { useState, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

const PITCH_SECTIONS = [
  {
    key: "one_liner",
    label: "One-Liner",
    hint: "One sentence, repeatable from memory",
  },
  {
    key: "team",
    label: "Team",
    hint: "Founders, key hires, relevant experience",
  },
  {
    key: "problem_market",
    label: "Problem & Market",
    hint: "What pain exists today? Who suffers? TAM/SAM/SOM",
  },
  {
    key: "product",
    label: "Product",
    hint: "What it does, why now, and why web3",
  },
  {
    key: "gtm_strategy",
    label: "GTM Strategy",
    hint: "Go-to-market plan, channels, unfair distribution",
  },
  {
    key: "business_model",
    label: "Business Model",
    hint: "How you make money, pricing, unit economics",
  },
  {
    key: "traction",
    label: "Traction",
    hint: "Metrics, milestones, users, revenue",
  },
  {
    key: "competitive_landscape",
    label: "Competitive Landscape",
    hint: "Competitors and credible differentiation",
  },
  {
    key: "vision",
    label: "Vision",
    hint: "5-year picture, where this is going",
  },
  {
    key: "use_of_funds",
    label: "Use of Funds",
    hint: "How much you're raising and what you'll do with it",
  },
];

interface SectionEditorProps {
  projectId: string;
  sections: Record<string, string>;
  stageColor: string;
  onUpdate?: (key: string, content: string) => void;
}

export function SectionEditor({
  projectId,
  sections,
  stageColor,
  onUpdate,
}: SectionEditorProps) {
  const [localSections, setLocalSections] =
    useState<Record<string, string>>(sections);
  const [saving, setSaving] = useState<string | null>(null);

  const handleSave = useCallback(
    async (key: string, content: string) => {
      setSaving(key);
      try {
        const res = await fetch("/api/pitch", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId, section: key, content }),
        });
        if (res.ok) {
          onUpdate?.(key, content);
        }
      } finally {
        setSaving(null);
      }
    },
    [projectId, onUpdate],
  );

  const filledCount = PITCH_SECTIONS.filter((s) =>
    localSections[s.key]?.trim(),
  ).length;

  const wordCount = (text: string) =>
    text
      .trim()
      .split(/\s+/)
      .filter((w) => w).length;

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Pitch Sections</h2>
        <Badge variant="secondary" className="text-xs">
          {filledCount} / {PITCH_SECTIONS.length} filled
        </Badge>
      </div>

      <Accordion>
        {PITCH_SECTIONS.map((section) => {
          const content = localSections[section.key] || "";
          const isFilled = content.trim().length > 0;
          const wc = wordCount(content);

          return (
            <AccordionItem key={section.key} value={section.key}>
              <AccordionTrigger className="px-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: isFilled ? stageColor : "#333" }}
                  />
                  <span className="text-sm truncate">{section.label}</span>
                  {wc > 0 && (
                    <span className="text-[10px] text-muted-foreground ml-auto mr-2">
                      {wc}w
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3">
                <p className="text-xs text-muted-foreground mb-2">
                  {section.hint}
                </p>
                <Textarea
                  value={content}
                  onChange={(e) =>
                    setLocalSections((prev) => ({
                      ...prev,
                      [section.key]: e.target.value,
                    }))
                  }
                  onBlur={() => handleSave(section.key, content)}
                  placeholder={`Write your ${section.label.toLowerCase()} content...`}
                  className="text-xs min-h-[100px]"
                  rows={5}
                />
                {saving === section.key && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Saving...
                  </p>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
