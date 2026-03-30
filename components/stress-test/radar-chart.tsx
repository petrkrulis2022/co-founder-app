"use client";

const DIMENSIONS = [
  "clarity",
  "desirability",
  "viability",
  "feasibility",
  "mission",
  "timing",
  "defensibility",
];

const DIMENSION_LABELS: Record<string, string> = {
  clarity: "Clarity",
  desirability: "Desirability",
  viability: "Viability",
  feasibility: "Feasibility",
  mission: "Mission",
  timing: "Timing",
  defensibility: "Defensibility",
};

interface RadarChartProps {
  scores: { dimension: string; score: number }[];
}

export function RadarChart({ scores }: RadarChartProps) {
  const cx = 150;
  const cy = 150;
  const maxR = 110;
  const sides = DIMENSIONS.length;
  const angleStep = (2 * Math.PI) / sides;

  const getPoint = (index: number, radius: number) => {
    const angle = angleStep * index - Math.PI / 2;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  };

  const rings = [0.25, 0.5, 0.75, 1.0];
  const scoreMap = new Map(scores.map((s) => [s.dimension, s.score]));

  const dataPoints = DIMENSIONS.map((dim, i) => {
    const score = scoreMap.get(dim) || 0;
    const r = (score / 10) * maxR;
    return getPoint(i, r);
  });

  const dataPath =
    dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") +
    " Z";

  return (
    <div className="flex items-center justify-center">
      <svg viewBox="0 0 300 300" className="w-full max-w-[300px]">
        {/* Concentric rings */}
        {rings.map((scale) => {
          const ringPath =
            DIMENSIONS.map((_, i) => {
              const p = getPoint(i, maxR * scale);
              return `${i === 0 ? "M" : "L"}${p.x},${p.y}`;
            }).join(" ") + " Z";
          return (
            <path
              key={scale}
              d={ringPath}
              fill="none"
              stroke="#1a1a1a"
              strokeWidth="1"
            />
          );
        })}

        {/* Axis lines */}
        {DIMENSIONS.map((_, i) => {
          const p = getPoint(i, maxR);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={p.x}
              y2={p.y}
              stroke="#1a1a1a"
              strokeWidth="1"
            />
          );
        })}

        {/* Data polygon */}
        {scores.length > 0 && (
          <>
            <path
              d={dataPath}
              fill="#ff6b3520"
              stroke="#ff6b35"
              strokeWidth="2"
            />
            {dataPoints.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="4" fill="#ff6b35" />
            ))}
          </>
        )}

        {/* Labels */}
        {DIMENSIONS.map((dim, i) => {
          const p = getPoint(i, maxR + 20);
          const score = scoreMap.get(dim);
          const label = DIMENSION_LABELS[dim] || dim;
          return (
            <text
              key={dim}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-muted-foreground text-[9px]"
            >
              {label}
              {score !== undefined ? ` (${score})` : ""}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
