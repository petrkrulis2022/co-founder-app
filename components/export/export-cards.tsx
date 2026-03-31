"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ExportOption {
  key: string;
  title: string;
  description: string;
  icon: string;
  ready: boolean;
  readyLabel: string;
  notReadyLabel: string;
  type: string;
  ext: string;
}

interface ExportCardsProps {
  projectId: string;
  options: ExportOption[];
}

export function ExportCards({ projectId, options }: ExportCardsProps) {
  const [generating, setGenerating] = useState<string | null>(null);

  const handleExport = async (option: ExportOption) => {
    if (!option.ready || generating) return;
    setGenerating(option.key);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, exportType: option.key }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Export failed" }));
        alert(err.error || "Export failed");
        return;
      }
      // Download the response as a file
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${option.key}.${option.ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed. Please try again.");
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="grid gap-3">
      {options.map((option) => (
        <Card key={option.key} className={option.ready ? "" : "opacity-50"}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">{option.icon}</span>
                <div>
                  <CardTitle className="text-base">{option.title}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {option.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  variant={option.ready ? "secondary" : "outline"}
                  className="text-[10px]"
                >
                  {option.ready ? option.readyLabel : option.notReadyLabel}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!option.ready || generating !== null}
                  onClick={() => handleExport(option)}
                  className="text-xs"
                >
                  {generating === option.key ? "Generating..." : "Export"}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
