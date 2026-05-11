"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface SolanaAnalysis {
  id: string;
  projectId: string;
  query: string;
  gapDetails: string | null;
  gapClassification: string | null;
  recommendations: string | null;
  revenueModel: string | null;
  gtmStrategy: string | null;
  risks: string | null;
  analysedAt: string;
}

export function SolanaViabilityChecker({
  projectId,
  initialData,
}: {
  projectId: string;
  initialData?: SolanaAnalysis | null;
}) {
  const [query, setQuery] = useState(initialData?.query ?? "");
  const [analysing, setAnalysing] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<SolanaAnalysis | null>(
    initialData ?? null,
  );

  const analyze = useCallback(async () => {
    if (!query.trim()) return;

    setAnalysing(true);
    setError("");
    setAnalysis(null);

    try {
      const res = await fetch("/api/solana-viability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, query }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Analysis failed.");
      } else {
        setAnalysis(data.analysis);
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setAnalysing(false);
    }
  }, [query, projectId]);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Badge className="bg-purple-600 text-white text-[11px]">SOLANA</Badge>
          Viability Checker
        </h2>
        <p className="text-sm text-muted-foreground">
          Ask Colosseum Copilot if your idea is viable on Solana, who's building
          similar projects, and what gaps exist.
        </p>
      </div>

      {/* Query Form */}
      <div className="space-y-3 bg-secondary/50 rounded-lg p-4 border border-border">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Your Question
        </label>
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., I want to build a privacy-preserving stablecoin on Solana. Is anyone building this? What's the competitive landscape?"
          rows={4}
          className="resize-none"
        />
        <Button
          onClick={analyze}
          disabled={!query.trim() || analysing}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        >
          {analysing ? "Analyzing with Copilot…" : "Analyze on Solana"}
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg bg-red-400/10 border border-red-400/30 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Results */}
      {analysis && <SolanaAnalysisResults analysis={analysis} />}
    </div>
  );
}

function SolanaAnalysisResults({ analysis }: { analysis: SolanaAnalysis }) {
  return (
    <div className="space-y-4 bg-secondary/30 rounded-lg p-6 border border-border">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Analysis Results</h3>
        <span className="text-xs text-muted-foreground">
          {new Date(analysis.analysedAt).toLocaleDateString()}
        </span>
      </div>

      {/* Gap Classification */}
      {analysis.gapClassification && (
        <ResultSection
          title="Gap Classification"
          content={analysis.gapClassification}
          icon="🎯"
        />
      )}

      {/* Gap Details */}
      {analysis.gapDetails && (
        <ResultSection
          title="Market Analysis"
          content={analysis.gapDetails}
          icon="📊"
        />
      )}

      {/* Recommendations */}
      {analysis.recommendations && (
        <ResultSection
          title="Recommendations"
          content={analysis.recommendations}
          icon="💡"
        />
      )}

      {/* Revenue Model */}
      {analysis.revenueModel && (
        <ResultSection
          title="Revenue Model"
          content={analysis.revenueModel}
          icon="💰"
        />
      )}

      {/* GTM Strategy */}
      {analysis.gtmStrategy && (
        <ResultSection
          title="Go-to-Market Strategy"
          content={analysis.gtmStrategy}
          icon="🚀"
        />
      )}

      {/* Risks */}
      {analysis.risks && (
        <ResultSection
          title="Risks & Considerations"
          content={analysis.risks}
          icon="⚠️"
        />
      )}
    </div>
  );
}

function ResultSection({
  title,
  content,
  icon,
}: {
  title: string;
  content: string;
  icon: string;
}) {
  // Render bullet-point lines properly
  const lines = content.split("\n").filter((l) => l.trim());
  return (
    <div className="space-y-2 pb-3 border-b border-border last:border-b-0 last:pb-0">
      <h4 className="text-sm font-semibold flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </h4>
      <ul className="space-y-1">
        {lines.map((line, i) => (
          <li key={i} className="text-sm text-muted-foreground leading-relaxed">
            {line.replace(/^[-•]\s*/, "")}
          </li>
        ))}
      </ul>
    </div>
  );
}
