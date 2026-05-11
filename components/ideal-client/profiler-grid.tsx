"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ProfilerField {
  key: string;
  label: string;
  placeholder: string;
  section: "before" | "after" | "narrative" | "drivers";
}

const FIELDS: ProfilerField[] = [
  // BEFORE STATE
  {
    key: "beforeHaves",
    label: "What traits are common among my ideal clients?",
    placeholder:
      "e.g., Football fans who bet live, Web3-curious users, Live bettors on major platforms...",
    section: "before",
  },
  {
    key: "beforeThinks",
    label: "Time. Money. Access. Knowledge. Network. Experience.",
    placeholder: "What are they thinking about?",
    section: "before",
  },
  {
    key: "beforeFeels",
    label: "Consequences of the Before Haves",
    placeholder: "How do they feel in their current state?",
    section: "before",
  },
  {
    key: "previousActionsPurchases",
    label: "Previous Actions/Purchases",
    placeholder:
      "What investments have they already made? What's their sunk cost?",
    section: "before",
  },
  {
    key: "beforeAverageDay",
    label: "Average Day (Before)",
    placeholder: "What do their daily behaviors look like?",
    section: "before",
  },
  {
    key: "beforeStatus",
    label: "Status (Before)",
    placeholder:
      "Where are these people in their lives today? What transition are they experiencing?",
    section: "before",
  },
  // AFTER STATE
  {
    key: "afterHaves",
    label: "What traits/haves after your solution?",
    placeholder:
      "How does their Before state change after encountering your solution?",
    section: "after",
  },
  {
    key: "afterFeels",
    label: "How do they feel? (After)",
    placeholder:
      "How do they now feel after experiencing the benefits of your solution?",
    section: "after",
  },
  {
    key: "afterAverageDay",
    label: "Average Day (After)",
    placeholder: "What does their new lifestyle look like?",
    section: "after",
  },
  {
    key: "afterStatus",
    label: "Status (After)",
    placeholder:
      "How does their life status change? How does the new state look?",
    section: "after",
  },
  // NARRATIVE & DRIVERS
  {
    key: "contrarian",
    label: "Contrarian Narrative",
    placeholder:
      "What narratives do you believe to be true that the market hasn't caught on to yet? What trends are shaping up?",
    section: "narrative",
  },
  {
    key: "villain",
    label: "Villain",
    placeholder:
      "Who/what is the external villain standing in the way of your customer's dream life? (Root cause, relatable, singular)",
    section: "narrative",
  },
  {
    key: "slogan",
    label: "Slogan / Rally Cry",
    placeholder: "What are the rally cries that bring your community together?",
    section: "narrative",
  },
  {
    key: "keyPurchaseDrivers",
    label: "Key Purchase Drivers",
    placeholder:
      "What causes them to take action? What needs to be true to enable action?",
    section: "drivers",
  },
];

interface IdealClientProfilerGridProps {
  projectId: string;
}

export function IdealClientProfilerGrid({
  projectId,
}: IdealClientProfilerGridProps) {
  const [data, setData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfiler = async () => {
      try {
        const response = await fetch(
          `/api/ideal-client-profiler?projectId=${projectId}`
        );
        const result = await response.json();
        if (result.profiler) {
          const profileData: Record<string, string> = {};
          FIELDS.forEach((field) => {
            const value = result.profiler[field.key];
            profileData[field.key] = value || "";
          });
          setData(profileData);
        }
      } catch (error) {
        console.error("Error fetching profiler:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiler();
  }, [projectId]);

  const handleChange = (key: string, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/ideal-client-profiler", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, ...data }),
      });
    } catch (error) {
      console.error("Error saving profiler:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading profiler...</div>;
  }

  const beforeFields = FIELDS.filter((f) => f.section === "before");
  const afterFields = FIELDS.filter((f) => f.section === "after");
  const narrativeFields = FIELDS.filter((f) => f.section === "narrative");
  const driverFields = FIELDS.filter((f) => f.section === "drivers");

  return (
    <div className="space-y-8 p-6">
      {/* BEFORE STATE */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-blue-500">
          BEFORE - Current State
        </h2>
        <p className="text-sm text-muted-foreground">
          Map out your ideal client&apos;s current state, challenges, and context
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {beforeFields.map((field) => (
            <Card key={field.key} className="p-4">
              <label className="block text-sm font-semibold mb-2">
                {field.label}
              </label>
              <Textarea
                value={data[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="min-h-24 resize-none"
              />
            </Card>
          ))}
        </div>
      </div>

      {/* AFTER STATE */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-green-500">
          AFTER - Transformed State
        </h2>
        <p className="text-sm text-muted-foreground">
          Define the transformation your solution creates
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {afterFields.map((field) => (
            <Card key={field.key} className="p-4">
              <label className="block text-sm font-semibold mb-2">
                {field.label}
              </label>
              <Textarea
                value={data[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="min-h-24 resize-none"
              />
            </Card>
          ))}
        </div>
      </div>

      {/* NARRATIVE */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-purple-500">Market Narrative</h2>
        <p className="text-sm text-muted-foreground">
          Define your contrarian narrative, villain, and brand story
        </p>
        <div className="grid grid-cols-1 gap-4">
          {narrativeFields.map((field) => (
            <Card key={field.key} className="p-4">
              <label className="block text-sm font-semibold mb-2">
                {field.label}
              </label>
              <Textarea
                value={data[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="min-h-24 resize-none"
              />
            </Card>
          ))}
        </div>
      </div>

      {/* PURCHASE DRIVERS */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-orange-500">Purchase Drivers</h2>
        <p className="text-sm text-muted-foreground">
          Identify what triggers action and buying decisions
        </p>
        <div className="grid grid-cols-1 gap-4">
          {driverFields.map((field) => (
            <Card key={field.key} className="p-4">
              <label className="block text-sm font-semibold mb-2">
                {field.label}
              </label>
              <Textarea
                value={data[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="min-h-24 resize-none"
              />
            </Card>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2"
          size="lg"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? "Saving..." : "Save Profiler"}
        </Button>
      </div>
    </div>
  );
}
