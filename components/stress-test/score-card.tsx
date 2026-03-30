export function ScoreCard() {
  const dimensions = [
    "Market Size",
    "Competition",
    "Team Strength",
    "Tech Feasibility",
    "Revenue Model",
    "Regulatory Risk",
    "Token Utility",
  ];

  return (
    <div className="space-y-3 p-4">
      {dimensions.map((dim) => (
        <div
          key={dim}
          className="flex items-center justify-between border border-border rounded-lg p-3 bg-card"
        >
          <span className="text-sm">{dim}</span>
          <span className="text-sm text-muted-foreground font-mono">0/10</span>
        </div>
      ))}
    </div>
  );
}
