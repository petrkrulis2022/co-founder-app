export interface StageConfig {
  key: string;
  label: string;
  description: string;
  color: string;
  number: number;
}

export const STAGES: StageConfig[] = [
  {
    key: "ideation",
    label: "Ideation",
    description:
      "Brainstorm and refine your web3 startup idea with AI guidance",
    color: "#00ff9d",
    number: 1,
  },
  {
    key: "validation",
    label: "Validation",
    description:
      "Validate market demand, competitors, and user willingness to pay",
    color: "#00d4ff",
    number: 2,
  },
  {
    key: "stress-test",
    label: "Stress Test",
    description:
      "Score your idea across 7 dimensions: market, team, tech, revenue, moat, timing, token",
    color: "#ff6b35",
    number: 3,
  },
  {
    key: "lean-canvas",
    label: "Lean Canvas",
    description: "Fill all 12 blocks of your Lean Canvas business model",
    color: "#c084fc",
    number: 4,
  },
  {
    key: "marketing-campaign",
    label: "Marketing",
    description:
      "Build your pre-launch & launch marketing: channels, StoryBrand, founder funnel, virality",
    color: "#f43f5e",
    number: 5,
  },
  {
    key: "selection",
    label: "Selection",
    description:
      "Prioritize features using the Kano model and effort-impact matrix",
    color: "#ffaa00",
    number: 6,
  },
  {
    key: "mvp",
    label: "MVP",
    description:
      "Define your minimum viable product: scope, timeline, and success criteria",
    color: "#ff6b35",
    number: 7,
  },
  {
    key: "mafia-offer",
    label: "Mafia Offer",
    description: "Craft an offer so compelling your target users can't say no",
    color: "#00d4ff",
    number: 8,
  },
  {
    key: "build",
    label: "Build",
    description:
      "Plan 5 build sprints with milestones, tasks, and owner assignments",
    color: "#c084fc",
    number: 9,
  },
  {
    key: "launch",
    label: "Launch",
    description:
      "Plan your launch strategy: channels, timeline, and growth loops",
    color: "#00ff9d",
    number: 10,
  },
  {
    key: "feedback",
    label: "Feedback",
    description: "Design feedback loops, interviews, and metrics dashboards",
    color: "#00d4ff",
    number: 11,
  },
  {
    key: "pitch",
    label: "Pitch",
    description:
      "Build a 10-slide investor pitch with problem, solution, traction, and ask",
    color: "#ffaa00",
    number: 12,
  },
  {
    key: "token-launch",
    label: "Token Launch",
    description: "Design tokenomics, vesting schedules, and launch mechanics",
    color: "#ff4444",
    number: 13,
  },
  {
    key: "decision",
    label: "Decision",
    description:
      "Review all data and make your final go / no-go / pivot decision",
    color: "#ffffff",
    number: 14,
  },
  {
    key: "solana-viability",
    label: "Solana Viability",
    description:
      "Use Colosseum Copilot to analyse your project's viability on Solana, find competitors, and get market insights",
    color: "#9945FF",
    number: 15,
  },
];

export function getStageConfig(stageKey: string): StageConfig | undefined {
  return STAGES.find((s) => s.key === stageKey);
}
