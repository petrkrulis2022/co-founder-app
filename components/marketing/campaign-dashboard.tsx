"use client";

import { useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChannelConfig {
  enabled: boolean;
  handle?: string;
  hashtags?: string;
  postIdeas?: string;
  url?: string;
  openPositions?: string;
  inviteUrl?: string;
  channelUrl?: string;
  preRegUrl?: string;
  listGoal?: string;
  plannedDate?: string;
  notes?: string;
}

interface Channels {
  twitter: ChannelConfig;
  linkedin: ChannelConfig;
  discord: ChannelConfig;
  telegram: ChannelConfig;
  email: ChannelConfig;
  youtube: ChannelConfig;
  twitch: ChannelConfig;
  producthunt: ChannelConfig;
  pumpfun: ChannelConfig;
}

interface VipEntry {
  name: string;
  url: string;
  status: "SELECT" | "LUKE WARM" | "WARM" | "ACTIVATED";
  poc: string;
}

interface GrowthRow {
  metric: string;
  monthlyTarget: string;
  w1: string;
  w2: string;
  w3: string;
  w4: string;
  notes: string;
}

interface WebsiteAnalysis {
  score: number;
  summary: string;
  strengths: string[];
  issues: { category: string; issue: string; fix: string }[];
  quickWins: string[];
  rewriteSuggestion?: string;
}

export interface CampaignData {
  websiteUrl?: string | null;
  projectTagline?: string | null;
  channels?: Channels | null;
  demoUrl?: string | null;
  betaLimit?: number | null;
  betaInviteStrategy?: string | null;
  storybrandHero?: string | null;
  storybrandProblem?: string | null;
  storybrandGuide?: string | null;
  storybrandPlan?: string | null;
  storybrandCTA?: string | null;
  storybrandFailure?: string | null;
  storybrandSuccess?: string | null;
  whisperTeaseShout?: string | null;
  contentMissionVision?: string | null;
  contentFounderStory?: string | null;
  contentContrarian?: string | null;
  communityTargets?: string | null;
  launchPath?: string | null;
  coldStartNotes?: string | null;
  influencerStrategy?: string | null;
  founderAuthority?: string | null;
  launchAnnouncement?: string | null;
  commitmentCurve?: string | null;
  discoveryCallNotes?: string | null;
  vipListStrategy?: string | null;
  townhallPlan?: string | null;
  socialProofPlan?: string | null;
  scarcityMechanics?: string | null;
  hierarchyDesign?: string | null;
  greedMechanics?: string | null;
}

interface Props {
  projectId: string;
  initialData: CampaignData | null;
  stageColor: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GROWTH_METRICS = [
  "AWARE",
  "ENGAGE",
  "SUBSCRIBE",
  "CONVERT",
  "EXCITE",
  "ASCEND",
  "ADVOCATE",
  "PROMOTE",
  "Outbound DMs Sent",
  "Outbound Responses",
  "Booked Calls",
  "Calls Showed Up",
  "Positive Call Outcomes",
  "Closes",
];

const COMMITMENT_STEPS = [
  "Website visitor",
  "Follow on social",
  "Join Discord",
  "Pre-register",
  "Beta testing",
  "Player",
  "Winner",
  "Oracle / Power user",
  "Developer / Builder",
];

const LAUNCH_PATHS = [
  {
    key: "network",
    label: "Network Arbitrage",
    desc: "Leverage existing personal & professional network first",
  },
  {
    key: "influencer",
    label: "Influencer Led",
    desc: "Partner with KOLs to drive initial awareness",
  },
  {
    key: "hybrid",
    label: "Hybrid",
    desc: "Combine network + targeted influencer outreach",
  },
];

const defaultChannels: Channels = {
  twitter: { enabled: false },
  linkedin: { enabled: false },
  discord: { enabled: false },
  telegram: { enabled: false },
  email: { enabled: false },
  youtube: { enabled: false },
  twitch: { enabled: false },
  producthunt: { enabled: false },
  pumpfun: { enabled: false },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function CampaignDashboard({
  projectId,
  initialData,
  stageColor,
}: Props) {
  const d = initialData ?? {};

  const [tab, setTab] = useState<
    "setup" | "prelaunch" | "midfunnel" | "virality" | "scorecard"
  >("setup");
  const [saving, setSaving] = useState(false);

  // Setup
  const [websiteUrl, setWebsiteUrl] = useState(d.websiteUrl ?? "");
  const [tagline, setTagline] = useState(d.projectTagline ?? "");
  const [channels, setChannels] = useState<Channels>(
    (d.channels as Channels | null | undefined) ?? defaultChannels,
  );
  const [demoUrl, setDemoUrl] = useState(d.demoUrl ?? "");
  const [betaLimit, setBetaLimit] = useState(d.betaLimit?.toString() ?? "");
  const [betaInviteStrategy, setBetaInviteStrategy] = useState(
    d.betaInviteStrategy ?? "",
  );

  // StoryBrand
  const [sbHero, setSbHero] = useState(d.storybrandHero ?? "");
  const [sbProblem, setSbProblem] = useState(d.storybrandProblem ?? "");
  const [sbGuide, setSbGuide] = useState(d.storybrandGuide ?? "");
  const [sbPlan, setSbPlan] = useState(d.storybrandPlan ?? "");
  const [sbCTA, setSbCTA] = useState(d.storybrandCTA ?? "");
  const [sbFailure, setSbFailure] = useState(d.storybrandFailure ?? "");
  const [sbSuccess, setSbSuccess] = useState(d.storybrandSuccess ?? "");

  // Pre-Launch & Launch
  const [whisper, setWhisper] = useState(d.whisperTeaseShout ?? "");
  const [contentMV, setContentMV] = useState(d.contentMissionVision ?? "");
  const [contentFS, setContentFS] = useState(d.contentFounderStory ?? "");
  const [contentCon, setContentCon] = useState(d.contentContrarian ?? "");
  const [communityTargets, setCommunityTargets] = useState(
    d.communityTargets ?? "",
  );
  const [launchPath, setLaunchPath] = useState(d.launchPath ?? "");
  const [coldStart, setColdStart] = useState(d.coldStartNotes ?? "");
  const [influencer, setInfluencer] = useState(d.influencerStrategy ?? "");
  const [founderAuth, setFounderAuth] = useState(d.founderAuthority ?? "");
  const [launchAnn, setLaunchAnn] = useState(d.launchAnnouncement ?? "");

  // Mid-Funnel
  const [commitmentCurve, setCommitmentCurve] = useState<string[]>(() => {
    try {
      return JSON.parse(d.commitmentCurve ?? "[]");
    } catch {
      return Array(9).fill("");
    }
  });
  const [discoveryCalls, setDiscoveryCalls] = useState(
    d.discoveryCallNotes ?? "",
  );
  const [vipList, setVipList] = useState<VipEntry[]>(() => {
    try {
      return JSON.parse(d.vipListStrategy ?? "[]");
    } catch {
      return Array(10)
        .fill(null)
        .map(() => ({ name: "", url: "", status: "SELECT" as const, poc: "" }));
    }
  });
  const [townhall, setTownhall] = useState(d.townhallPlan ?? "");

  // Virality
  const [socialProof, setSocialProof] = useState(d.socialProofPlan ?? "");
  const [scarcity, setScarcity] = useState(d.scarcityMechanics ?? "");
  const [hierarchy, setHierarchy] = useState(d.hierarchyDesign ?? "");
  const [greed, setGreed] = useState(d.greedMechanics ?? "");

  // Growth Scorecard
  const [scorecard, setScorecard] = useState<GrowthRow[]>(() => {
    try {
      const parsed = JSON.parse(d.socialProofPlan ?? "");
      if (Array.isArray(parsed) && parsed[0]?.metric) return parsed;
    } catch {}
    return GROWTH_METRICS.map((m) => ({
      metric: m,
      monthlyTarget: "",
      w1: "",
      w2: "",
      w3: "",
      w4: "",
      notes: "",
    }));
  });

  // Website analysis
  const [analysing, setAnalysing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const [analysis, setAnalysis] = useState<WebsiteAnalysis | null>(null);

  const analyseWebsite = useCallback(async () => {
    if (!websiteUrl) return;
    setAnalysing(true);
    setAnalysisError("");
    setAnalysis(null);
    try {
      const res = await fetch("/api/website-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: websiteUrl, projectId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAnalysisError(data.error ?? "Analysis failed.");
      } else {
        setAnalysis(data.analysis);
      }
    } catch {
      setAnalysisError("Network error — please try again.");
    } finally {
      setAnalysing(false);
    }
  }, [websiteUrl, projectId]);

  // ─── Save helper ────────────────────────────────────────────────────────────
  const save = useCallback(
    async (data: Record<string, unknown>) => {
      setSaving(true);
      try {
        await fetch("/api/marketing-campaign", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId, ...data }),
        });
      } finally {
        setSaving(false);
      }
    },
    [projectId],
  );

  // ─── Channel helpers ─────────────────────────────────────────────────────────
  const toggleChannel = (key: keyof Channels) => {
    const updated = {
      ...channels,
      [key]: { ...channels[key], enabled: !channels[key].enabled },
    };
    setChannels(updated);
    save({ channels: updated });
  };

  const updateChannel = (key: keyof Channels, field: string, value: string) => {
    const updated = {
      ...channels,
      [key]: { ...channels[key], [field]: value },
    };
    setChannels(updated);
    return updated;
  };

  const saveChannel = (key: keyof Channels, field: string, value: string) => {
    const updated = updateChannel(key, field, value);
    save({ channels: updated });
  };

  // ─── Tabs ──────────────────────────────────────────────────────────────────
  const TABS = [
    { key: "setup", label: "Setup" },
    { key: "prelaunch", label: "Pre-Launch & Launch" },
    { key: "midfunnel", label: "Mid-Funnel" },
    { key: "virality", label: "Virality" },
    { key: "scorecard", label: "Scorecard" },
  ] as const;

  return (
    <div className="flex flex-col h-full text-sm">
      {/* Tab bar */}
      <div className="flex border-b border-border shrink-0 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
              tab === t.key
                ? "border-current text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            style={tab === t.key ? { borderColor: stageColor } : {}}
          >
            {t.label}
          </button>
        ))}
        {saving && (
          <span className="ml-auto px-3 py-2 text-[10px] text-muted-foreground self-center">
            saving…
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* ── SETUP ─────────────────────────────────────────────────────────── */}
        {tab === "setup" && (
          <>
            {/* Project Identity */}
            <Section title="Project Identity">
              <Field label="Website URL">
                <div className="flex gap-2">
                  <Input
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    onBlur={() => save({ websiteUrl })}
                    placeholder="https://yourproject.xyz"
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={analyseWebsite}
                    disabled={!websiteUrl || analysing}
                    className="shrink-0 text-xs"
                    style={
                      websiteUrl
                        ? { borderColor: stageColor, color: stageColor }
                        : {}
                    }
                  >
                    {analysing ? "Analysing…" : "Analyse"}
                  </Button>
                </div>
              </Field>
              <Field label="Project Tagline">
                <Input
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  onBlur={() => save({ projectTagline: tagline })}
                  placeholder="One sentence that makes people lean in"
                />
              </Field>
            </Section>

            {/* Website Analysis Results */}
            {(analysing || analysisError || analysis) && (
              <Section title="Website Analysis">
                {analysing && (
                  <div className="text-xs text-muted-foreground animate-pulse">
                    Fetching and analysing your website…
                  </div>
                )}
                {analysisError && (
                  <div className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">
                    {analysisError}
                  </div>
                )}
                {analysis && (
                  <WebsiteAnalysisPanel
                    analysis={analysis}
                    stageColor={stageColor}
                  />
                )}
              </Section>
            )}

            {/* Channels */}
            <Section title="Marketing Channels">
              <div className="space-y-3">
                <ChannelRow
                  label="Twitter / X"
                  enabled={channels.twitter.enabled}
                  onToggle={() => toggleChannel("twitter")}
                  stageColor={stageColor}
                >
                  <ChannelField label="Handle">
                    <Input
                      value={channels.twitter.handle ?? ""}
                      onChange={(e) =>
                        updateChannel("twitter", "handle", e.target.value)
                      }
                      onBlur={(e) =>
                        saveChannel("twitter", "handle", e.target.value)
                      }
                      placeholder="@handle"
                    />
                  </ChannelField>
                  <ChannelField label="Hashtags">
                    <Input
                      value={channels.twitter.hashtags ?? ""}
                      onChange={(e) =>
                        updateChannel("twitter", "hashtags", e.target.value)
                      }
                      onBlur={(e) =>
                        saveChannel("twitter", "hashtags", e.target.value)
                      }
                      placeholder="#web3 #defi"
                    />
                  </ChannelField>
                  <ChannelField label="Post Ideas">
                    <Textarea
                      value={channels.twitter.postIdeas ?? ""}
                      onChange={(e) =>
                        updateChannel("twitter", "postIdeas", e.target.value)
                      }
                      onBlur={(e) =>
                        saveChannel("twitter", "postIdeas", e.target.value)
                      }
                      placeholder="Tweet ideas, threads, hooks..."
                      rows={3}
                    />
                  </ChannelField>
                </ChannelRow>

                <ChannelRow
                  label="LinkedIn"
                  enabled={channels.linkedin.enabled}
                  onToggle={() => toggleChannel("linkedin")}
                  stageColor={stageColor}
                >
                  <ChannelField label="Company Page URL">
                    <Input
                      value={channels.linkedin.url ?? ""}
                      onChange={(e) =>
                        updateChannel("linkedin", "url", e.target.value)
                      }
                      onBlur={(e) =>
                        saveChannel("linkedin", "url", e.target.value)
                      }
                      placeholder="https://linkedin.com/company/..."
                    />
                  </ChannelField>
                  <ChannelField label="Open Positions / Hiring Angle">
                    <Textarea
                      value={channels.linkedin.openPositions ?? ""}
                      onChange={(e) =>
                        updateChannel(
                          "linkedin",
                          "openPositions",
                          e.target.value,
                        )
                      }
                      onBlur={(e) =>
                        saveChannel("linkedin", "openPositions", e.target.value)
                      }
                      placeholder="Roles you're hiring for..."
                      rows={2}
                    />
                  </ChannelField>
                </ChannelRow>

                <ChannelRow
                  label="Discord"
                  enabled={channels.discord.enabled}
                  onToggle={() => toggleChannel("discord")}
                  stageColor={stageColor}
                >
                  <ChannelField label="Invite URL">
                    <Input
                      value={channels.discord.inviteUrl ?? ""}
                      onChange={(e) =>
                        updateChannel("discord", "inviteUrl", e.target.value)
                      }
                      onBlur={(e) =>
                        saveChannel("discord", "inviteUrl", e.target.value)
                      }
                      placeholder="https://discord.gg/..."
                    />
                  </ChannelField>
                </ChannelRow>

                <ChannelRow
                  label="Telegram"
                  enabled={channels.telegram.enabled}
                  onToggle={() => toggleChannel("telegram")}
                  stageColor={stageColor}
                >
                  <ChannelField label="Channel URL">
                    <Input
                      value={channels.telegram.channelUrl ?? ""}
                      onChange={(e) =>
                        updateChannel("telegram", "channelUrl", e.target.value)
                      }
                      onBlur={(e) =>
                        saveChannel("telegram", "channelUrl", e.target.value)
                      }
                      placeholder="https://t.me/..."
                    />
                  </ChannelField>
                </ChannelRow>

                <ChannelRow
                  label="Email / Pre-Reg"
                  enabled={channels.email.enabled}
                  onToggle={() => toggleChannel("email")}
                  stageColor={stageColor}
                >
                  <ChannelField label="Pre-Reg Landing URL">
                    <Input
                      value={channels.email.preRegUrl ?? ""}
                      onChange={(e) =>
                        updateChannel("email", "preRegUrl", e.target.value)
                      }
                      onBlur={(e) =>
                        saveChannel("email", "preRegUrl", e.target.value)
                      }
                      placeholder="https://..."
                    />
                  </ChannelField>
                  <ChannelField label="List Goal">
                    <Input
                      value={channels.email.listGoal ?? ""}
                      onChange={(e) =>
                        updateChannel("email", "listGoal", e.target.value)
                      }
                      onBlur={(e) =>
                        saveChannel("email", "listGoal", e.target.value)
                      }
                      placeholder="e.g. 5,000 subscribers"
                    />
                  </ChannelField>
                </ChannelRow>

                <ChannelRow
                  label="YouTube"
                  enabled={channels.youtube.enabled}
                  onToggle={() => toggleChannel("youtube")}
                  stageColor={stageColor}
                >
                  <ChannelField label="Channel URL">
                    <Input
                      value={channels.youtube.channelUrl ?? ""}
                      onChange={(e) =>
                        updateChannel("youtube", "channelUrl", e.target.value)
                      }
                      onBlur={(e) =>
                        saveChannel("youtube", "channelUrl", e.target.value)
                      }
                      placeholder="https://youtube.com/@..."
                    />
                  </ChannelField>
                </ChannelRow>

                <ChannelRow
                  label="Twitch"
                  enabled={channels.twitch.enabled}
                  onToggle={() => toggleChannel("twitch")}
                  stageColor={stageColor}
                >
                  <ChannelField label="Channel URL">
                    <Input
                      value={channels.twitch.channelUrl ?? ""}
                      onChange={(e) =>
                        updateChannel("twitch", "channelUrl", e.target.value)
                      }
                      onBlur={(e) =>
                        saveChannel("twitch", "channelUrl", e.target.value)
                      }
                      placeholder="https://twitch.tv/..."
                    />
                  </ChannelField>
                </ChannelRow>

                <ChannelRow
                  label="Product Hunt"
                  enabled={channels.producthunt.enabled}
                  onToggle={() => toggleChannel("producthunt")}
                  stageColor={stageColor}
                >
                  <ChannelField label="Planned Launch Date">
                    <Input
                      type="date"
                      value={channels.producthunt.plannedDate ?? ""}
                      onChange={(e) =>
                        updateChannel(
                          "producthunt",
                          "plannedDate",
                          e.target.value,
                        )
                      }
                      onBlur={(e) =>
                        saveChannel(
                          "producthunt",
                          "plannedDate",
                          e.target.value,
                        )
                      }
                    />
                  </ChannelField>
                </ChannelRow>

                <ChannelRow
                  label="Pump.fun"
                  enabled={channels.pumpfun.enabled}
                  onToggle={() => toggleChannel("pumpfun")}
                  stageColor={stageColor}
                >
                  <ChannelField label="Notes">
                    <Textarea
                      value={channels.pumpfun.notes ?? ""}
                      onChange={(e) =>
                        updateChannel("pumpfun", "notes", e.target.value)
                      }
                      onBlur={(e) =>
                        saveChannel("pumpfun", "notes", e.target.value)
                      }
                      placeholder="Token ticker, strategy, timing..."
                      rows={2}
                    />
                  </ChannelField>
                </ChannelRow>
              </div>
            </Section>

            {/* Demo / Beta */}
            <Section title="Demo & Beta Access">
              <Field label="Demo URL">
                <Input
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  onBlur={() => save({ demoUrl })}
                  placeholder="https://demo.yourproject.xyz"
                />
              </Field>
              <Field label="Beta Limit (# of users)">
                <Input
                  type="number"
                  value={betaLimit}
                  onChange={(e) => setBetaLimit(e.target.value)}
                  onBlur={() =>
                    save({ betaLimit: betaLimit ? parseInt(betaLimit) : null })
                  }
                  placeholder="e.g. 500"
                />
              </Field>
              <Field label="Beta Invite Strategy">
                <Textarea
                  value={betaInviteStrategy}
                  onChange={(e) => setBetaInviteStrategy(e.target.value)}
                  onBlur={() => save({ betaInviteStrategy })}
                  placeholder="How will you select / invite beta users?"
                  rows={3}
                />
              </Field>
            </Section>
          </>
        )}

        {/* ── PRE-LAUNCH & LAUNCH ───────────────────────────────────────────── */}
        {tab === "prelaunch" && (
          <>
            {/* StoryBrand */}
            <Section title="StoryBrand 7-Part Framework">
              <p className="text-[11px] text-muted-foreground -mt-2 mb-3">
                Your customer is the <strong>Hero</strong>. Your brand is the{" "}
                <strong>Guide</strong>.
              </p>
              {[
                {
                  label: "1. Hero — Who is your customer?",
                  val: sbHero,
                  set: setSbHero,
                  field: "storybrandHero",
                  ph: "A live bettor who wants an edge...",
                },
                {
                  label: "2. Problem — What is their core problem?",
                  val: sbProblem,
                  set: setSbProblem,
                  field: "storybrandProblem",
                  ph: "They're losing bets because bookies have the edge...",
                },
                {
                  label: "3. Guide — What's your authority / empathy?",
                  val: sbGuide,
                  set: setSbGuide,
                  field: "storybrandGuide",
                  ph: "We've been on-chain since day one...",
                },
                {
                  label: "4. Plan — 3-step simple process",
                  val: sbPlan,
                  set: setSbPlan,
                  field: "storybrandPlan",
                  ph: "1. Sign up  2. Connect wallet  3. Bet live on-chain",
                },
                {
                  label: "5. Call to Action",
                  val: sbCTA,
                  set: setSbCTA,
                  field: "storybrandCTA",
                  ph: "Pre-register now — limited beta spots",
                },
                {
                  label: "6. Failure — What happens if they don't act?",
                  val: sbFailure,
                  set: setSbFailure,
                  field: "storybrandFailure",
                  ph: "Keep losing to rigged bookies...",
                },
                {
                  label: "7. Success — What does their life look like after?",
                  val: sbSuccess,
                  set: setSbSuccess,
                  field: "storybrandSuccess",
                  ph: "Betting peer-to-peer, on-chain, fully transparent...",
                },
              ].map(({ label, val, set, field, ph }) => (
                <Field key={field} label={label}>
                  <Textarea
                    value={val}
                    onChange={(e) => set(e.target.value)}
                    onBlur={() => save({ [field]: val })}
                    placeholder={ph}
                    rows={2}
                  />
                </Field>
              ))}
            </Section>

            {/* Whisper-Tease-Shout */}
            <Section title="Whisper → Tease → Shout Timeline">
              <p className="text-[11px] text-muted-foreground -mt-2 mb-3">
                Content timeline: start quiet, build intrigue, then go loud.
              </p>
              <Textarea
                value={whisper}
                onChange={(e) => setWhisper(e.target.value)}
                onBlur={() => save({ whisperTeaseShout: whisper })}
                placeholder="Whisper: private community hints, inner-circle DMs&#10;Tease: cryptic tweets, waitlist open, early screenshots&#10;Shout: full announcement, PH launch, influencer drops"
                rows={6}
              />
            </Section>

            {/* Content Strategy */}
            <Section title="Content Strategy (70 / 20 / 10)">
              <p className="text-[11px] text-muted-foreground -mt-2 mb-3">
                70% expert content · 20% human/personal content · 10% project
                content
              </p>
              <Field label="Mission & Vision post">
                <Textarea
                  value={contentMV}
                  onChange={(e) => setContentMV(e.target.value)}
                  onBlur={() => save({ contentMissionVision: contentMV })}
                  placeholder="Draft your mission/vision tweet or LinkedIn post..."
                  rows={3}
                />
              </Field>
              <Field label="Founder Story">
                <Textarea
                  value={contentFS}
                  onChange={(e) => setContentFS(e.target.value)}
                  onBlur={() => save({ contentFounderStory: contentFS })}
                  placeholder="The authentic story of why you're building this..."
                  rows={3}
                />
              </Field>
              <Field label="Contrarian Take">
                <Textarea
                  value={contentCon}
                  onChange={(e) => setContentCon(e.target.value)}
                  onBlur={() => save({ contentContrarian: contentCon })}
                  placeholder="What does everyone believe that you think is wrong?"
                  rows={3}
                />
              </Field>
            </Section>

            {/* Community Infiltration */}
            <Section title="Community Infiltration Targets">
              <Textarea
                value={communityTargets}
                onChange={(e) => setCommunityTargets(e.target.value)}
                onBlur={() => save({ communityTargets })}
                placeholder="List subreddits, Discord servers, Telegram groups, Twitter spaces to infiltrate and contribute value..."
                rows={4}
              />
            </Section>

            {/* Launch Path */}
            <Section title="Launch Path">
              <div className="grid gap-2 mb-3">
                {LAUNCH_PATHS.map((lp) => (
                  <button
                    key={lp.key}
                    onClick={() => {
                      setLaunchPath(lp.key);
                      save({ launchPath: lp.key });
                    }}
                    className={`text-left px-3 py-2 rounded-lg border transition-colors ${
                      launchPath === lp.key
                        ? "border-current bg-secondary/50"
                        : "border-border hover:bg-secondary/20"
                    }`}
                    style={
                      launchPath === lp.key ? { borderColor: stageColor } : {}
                    }
                  >
                    <span className="text-xs font-medium">{lp.label}</span>
                    <p className="text-[10px] text-muted-foreground">
                      {lp.desc}
                    </p>
                  </button>
                ))}
              </div>
            </Section>

            {/* Cold Start */}
            <Section title="Cold Start Strategy">
              <Textarea
                value={coldStart}
                onChange={(e) => setColdStart(e.target.value)}
                onBlur={() => save({ coldStartNotes: coldStart })}
                placeholder="How do you bootstrap with zero audience? First 100 users strategy..."
                rows={4}
              />
            </Section>

            {/* Influencer */}
            <Section title="Influencer / KOL Strategy">
              <Textarea
                value={influencer}
                onChange={(e) => setInfluencer(e.target.value)}
                onBlur={() => save({ influencerStrategy: influencer })}
                placeholder="Target KOLs, deal structure (rev share / flat fee / equity), outreach script..."
                rows={4}
              />
            </Section>

            {/* Founder Authority */}
            <Section title="Founder Authority & Personal Brand">
              <Textarea
                value={founderAuth}
                onChange={(e) => setFounderAuth(e.target.value)}
                onBlur={() => save({ founderAuthority: founderAuth })}
                placeholder="What unique credibility do you have? Content plan to establish authority..."
                rows={3}
              />
            </Section>

            {/* Launch Announcement */}
            <Section title="Launch Announcement Draft">
              <Textarea
                value={launchAnn}
                onChange={(e) => setLaunchAnn(e.target.value)}
                onBlur={() => save({ launchAnnouncement: launchAnn })}
                placeholder="Draft the official launch announcement (tweet thread, blog post, or press release)..."
                rows={6}
              />
            </Section>
          </>
        )}

        {/* ── MID-FUNNEL ────────────────────────────────────────────────────── */}
        {tab === "midfunnel" && (
          <>
            {/* Community Commitment Curve */}
            <Section title="Community Commitment Curve">
              <p className="text-[11px] text-muted-foreground -mt-2 mb-3">
                Map target numbers for each funnel step.
              </p>
              <div className="space-y-2">
                {COMMITMENT_STEPS.map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span
                      className="text-[10px] font-mono w-4 shrink-0 text-center rounded-full h-4 flex items-center justify-center text-white"
                      style={{ backgroundColor: stageColor }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-xs w-40 shrink-0 text-muted-foreground">
                      {step}
                    </span>
                    <Input
                      value={commitmentCurve[i] ?? ""}
                      onChange={(e) => {
                        const updated = [...commitmentCurve];
                        updated[i] = e.target.value;
                        setCommitmentCurve(updated);
                      }}
                      onBlur={() =>
                        save({
                          commitmentCurve: JSON.stringify(commitmentCurve),
                        })
                      }
                      placeholder="Target e.g. 10,000"
                      className="h-7 text-xs"
                    />
                  </div>
                ))}
              </div>
            </Section>

            {/* Discovery Call Loop */}
            <Section title="Discovery Call Loop">
              <Textarea
                value={discoveryCalls}
                onChange={(e) => setDiscoveryCalls(e.target.value)}
                onBlur={() => save({ discoveryCallNotes: discoveryCalls })}
                placeholder="How many discovery calls per week? What questions do you ask? What are you learning?"
                rows={4}
              />
            </Section>

            {/* VIP List */}
            <Section title="VIP List (Key Accounts & Influencers)">
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-1 px-2 text-muted-foreground font-medium">
                        Name
                      </th>
                      <th className="text-left py-1 px-2 text-muted-foreground font-medium">
                        URL
                      </th>
                      <th className="text-left py-1 px-2 text-muted-foreground font-medium">
                        Status
                      </th>
                      <th className="text-left py-1 px-2 text-muted-foreground font-medium">
                        POC
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {vipList.map((entry, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-1 px-1">
                          <Input
                            value={entry.name}
                            onChange={(e) => {
                              const updated = [...vipList];
                              updated[i] = {
                                ...updated[i],
                                name: e.target.value,
                              };
                              setVipList(updated);
                            }}
                            onBlur={() =>
                              save({ vipListStrategy: JSON.stringify(vipList) })
                            }
                            className="h-6 text-[11px] border-0 bg-transparent p-0 focus-visible:ring-0"
                            placeholder="Name"
                          />
                        </td>
                        <td className="py-1 px-1">
                          <Input
                            value={entry.url}
                            onChange={(e) => {
                              const updated = [...vipList];
                              updated[i] = {
                                ...updated[i],
                                url: e.target.value,
                              };
                              setVipList(updated);
                            }}
                            onBlur={() =>
                              save({ vipListStrategy: JSON.stringify(vipList) })
                            }
                            className="h-6 text-[11px] border-0 bg-transparent p-0 focus-visible:ring-0"
                            placeholder="URL / handle"
                          />
                        </td>
                        <td className="py-1 px-1">
                          <select
                            value={entry.status}
                            onChange={(e) => {
                              const updated = [...vipList];
                              updated[i] = {
                                ...updated[i],
                                status: e.target.value as VipEntry["status"],
                              };
                              setVipList(updated);
                              save({
                                vipListStrategy: JSON.stringify(updated),
                              });
                            }}
                            className="h-6 text-[11px] bg-transparent border-0 focus:outline-none w-full"
                          >
                            {["SELECT", "LUKE WARM", "WARM", "ACTIVATED"].map(
                              (s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ),
                            )}
                          </select>
                        </td>
                        <td className="py-1 px-1">
                          <Input
                            value={entry.poc}
                            onChange={(e) => {
                              const updated = [...vipList];
                              updated[i] = {
                                ...updated[i],
                                poc: e.target.value,
                              };
                              setVipList(updated);
                            }}
                            onBlur={() =>
                              save({ vipListStrategy: JSON.stringify(vipList) })
                            }
                            className="h-6 text-[11px] border-0 bg-transparent p-0 focus-visible:ring-0"
                            placeholder="Point of contact"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-[11px] h-6"
                  onClick={() => {
                    const updated = [
                      ...vipList,
                      { name: "", url: "", status: "SELECT" as const, poc: "" },
                    ];
                    setVipList(updated);
                    save({ vipListStrategy: JSON.stringify(updated) });
                  }}
                >
                  + Add row
                </Button>
              </div>
            </Section>

            {/* Townhall */}
            <Section title="Townhall & Community Calls">
              <Textarea
                value={townhall}
                onChange={(e) => setTownhall(e.target.value)}
                onBlur={() => save({ townhallPlan: townhall })}
                placeholder="Frequency, format, agenda template, recording plan..."
                rows={3}
              />
            </Section>
          </>
        )}

        {/* ── VIRALITY ──────────────────────────────────────────────────────── */}
        {tab === "virality" && (
          <>
            <Section title="Social Proof Plan">
              <Textarea
                value={socialProof}
                onChange={(e) => setSocialProof(e.target.value)}
                onBlur={() => save({ socialProofPlan: socialProof })}
                placeholder="User testimonials, milestones to broadcast, media mentions, on-chain proof..."
                rows={4}
              />
            </Section>

            <Section title="Scarcity Mechanics">
              <Textarea
                value={scarcity}
                onChange={(e) => setScarcity(e.target.value)}
                onBlur={() => save({ scarcityMechanics: scarcity })}
                placeholder="Invite codes, limited beta spots, early-access NFTs, countdown timers..."
                rows={4}
              />
            </Section>

            <Section title="Hierarchy & Leaderboards">
              <Textarea
                value={hierarchy}
                onChange={(e) => setHierarchy(e.target.value)}
                onBlur={() => save({ hierarchyDesign: hierarchy })}
                placeholder="Ranking tiers, XP systems, leaderboard design, status roles in Discord..."
                rows={4}
              />
            </Section>

            <Section title="Greed & FOMO Mechanics">
              <Textarea
                value={greed}
                onChange={(e) => setGreed(e.target.value)}
                onBlur={() => save({ greedMechanics: greed })}
                placeholder="Referral rewards, token incentives, early-bird bonuses, FOMO triggers..."
                rows={4}
              />
            </Section>
          </>
        )}

        {/* ── GROWTH SCORECARD ──────────────────────────────────────────────── */}
        {tab === "scorecard" && (
          <Section title="Growth Scorecard">
            <p className="text-[11px] text-muted-foreground -mt-2 mb-3">
              Track weekly actuals vs monthly targets across the flywheel
              stages.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-1 px-2 font-medium w-28">
                      Metric
                    </th>
                    <th className="text-left py-1 px-2 font-medium w-20">
                      Mo. Target
                    </th>
                    <th className="text-left py-1 px-2 font-medium w-16">
                      Wk 1
                    </th>
                    <th className="text-left py-1 px-2 font-medium w-16">
                      Wk 2
                    </th>
                    <th className="text-left py-1 px-2 font-medium w-16">
                      Wk 3
                    </th>
                    <th className="text-left py-1 px-2 font-medium w-16">
                      Wk 4
                    </th>
                    <th className="text-left py-1 px-2 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {scorecard.map((row, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-1 px-2 font-medium text-[11px]">
                        {row.metric}
                      </td>
                      {(
                        [
                          "monthlyTarget",
                          "w1",
                          "w2",
                          "w3",
                          "w4",
                          "notes",
                        ] as const
                      ).map((col) => (
                        <td key={col} className="py-0.5 px-1">
                          <Input
                            value={row[col]}
                            onChange={(e) => {
                              const updated = scorecard.map((r, j) =>
                                j === i ? { ...r, [col]: e.target.value } : r,
                              );
                              setScorecard(updated);
                            }}
                            onBlur={() =>
                              save({
                                greedMechanics: JSON.stringify(scorecard),
                              })
                            }
                            className="h-6 text-[11px] border-0 bg-transparent p-0 focus-visible:ring-0"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

// ─── Small helpers ─────────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function ChannelField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-0.5">
      <label className="text-[10px] text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function ChannelRow({
  label,
  enabled,
  onToggle,
  stageColor,
  children,
}: {
  label: string;
  enabled: boolean;
  onToggle: () => void;
  stageColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-secondary/20 transition-colors"
      >
        <span className="text-xs font-medium">{label}</span>
        <Badge
          variant={enabled ? "secondary" : "outline"}
          className="text-[10px]"
          style={enabled ? { color: stageColor } : {}}
        >
          {enabled ? "ON" : "OFF"}
        </Badge>
      </button>
      {enabled && (
        <div className="px-3 pb-3 pt-1 space-y-2 border-t border-border/50 bg-secondary/10">
          {children}
        </div>
      )}
    </div>
  );
}

function WebsiteAnalysisPanel({
  analysis,
  stageColor,
}: {
  analysis: WebsiteAnalysis;
  stageColor: string;
}) {
  const scoreColor =
    analysis.score >= 8
      ? "#00ff9d"
      : analysis.score >= 5
        ? "#ffaa00"
        : "#ff4444";

  return (
    <div className="space-y-4 text-xs">
      {/* Score */}
      <div className="flex items-center gap-3">
        <span
          className="text-2xl font-bold tabular-nums"
          style={{ color: scoreColor }}
        >
          {analysis.score}/10
        </span>
        <p className="text-muted-foreground leading-snug">{analysis.summary}</p>
      </div>

      {/* Strengths */}
      {analysis.strengths?.length > 0 && (
        <div className="space-y-1">
          <p className="font-semibold text-[11px] uppercase tracking-wide text-muted-foreground">
            Strengths
          </p>
          <ul className="space-y-1">
            {analysis.strengths.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span style={{ color: stageColor }}>✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Issues */}
      {analysis.issues?.length > 0 && (
        <div className="space-y-2">
          <p className="font-semibold text-[11px] uppercase tracking-wide text-muted-foreground">
            Issues & Fixes
          </p>
          {analysis.issues.map((item, i) => (
            <div
              key={i}
              className="rounded-lg border border-border/60 bg-secondary/10 px-3 py-2 space-y-1"
            >
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                  {item.category}
                </Badge>
                <span className="font-medium">{item.issue}</span>
              </div>
              <p className="text-muted-foreground pl-1 leading-snug">
                → {item.fix}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Quick Wins */}
      {analysis.quickWins?.length > 0 && (
        <div className="space-y-1">
          <p className="font-semibold text-[11px] uppercase tracking-wide text-muted-foreground">
            Quick Wins
          </p>
          <ul className="space-y-1">
            {analysis.quickWins.map((w, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-yellow-400">⚡</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Headline rewrite */}
      {analysis.rewriteSuggestion && (
        <div
          className="rounded-lg border px-3 py-2 space-y-1"
          style={{ borderColor: stageColor }}
        >
          <p
            className="font-semibold text-[11px] uppercase tracking-wide"
            style={{ color: stageColor }}
          >
            Suggested Hero Headline
          </p>
          <p className="italic">&ldquo;{analysis.rewriteSuggestion}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
