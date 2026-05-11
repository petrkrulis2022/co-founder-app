"use client";

import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface BlueOceanStrategyData {
  id: string;
  projectId: string;
  competingOn: string | null;
  eliminate: string | null;
  reduce: string | null;
  raise: string | null;
  create: string | null;
  blueOceanFocus: string | null;
  blueOceanBenefits: string | null;
  alternativesThreaten: string | null;
  targetCustomers: string | null;
  updatedAt: string;
}

interface BlueOceanStrategyGridProps {
  projectId: string;
}

export function BlueOceanStrategyGrid({
  projectId,
}: BlueOceanStrategyGridProps) {
  const [data, setData] = useState<BlueOceanStrategyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `/api/blue-ocean-strategy?projectId=${projectId}`,
        );
        const result = await res.json();
        if (result.strategy) {
          setData(result.strategy);
        }
      } catch (error) {
        console.error("Error fetching strategy:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  const handleSave = async (field: string, value: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/blue-ocean-strategy", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          [field]: value || null,
        }),
      });
      if (res.ok) {
        const result = await res.json();
        setData(result.strategy);
      }
    } catch (error) {
      console.error("Error saving strategy:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const currentData = data || {
    competingOn: "",
    eliminate: "",
    reduce: "",
    raise: "",
    create: "",
    blueOceanFocus: "",
    blueOceanBenefits: "",
    alternativesThreaten: "",
    targetCustomers: "",
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-8">
      {/* RED OCEAN vs BLUE OCEAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* RED OCEAN - Competing On */}
        <Card className="border-red-500/30 bg-red-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              Red Ocean: Competing On
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              What factors does the industry compete on? (Price, features,
              quality, speed, etc.)
            </p>
          </CardHeader>
          <CardContent>
            <Textarea
              value={currentData.competingOn || ""}
              onChange={(e) =>
                setData({
                  ...(currentData as any),
                  competingOn: e.target.value,
                })
              }
              onBlur={(e) => handleSave("competingOn", e.target.value)}
              placeholder="List the key competitive factors in your industry..."
              className="min-h-32"
            />
          </CardContent>
        </Card>

        {/* BLUE OCEAN - Focus */}
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              Blue Ocean: Your Strategic Focus
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              What will you focus on that competitors ignore? (New value,
              differentiation)
            </p>
          </CardHeader>
          <CardContent>
            <Textarea
              value={currentData.blueOceanFocus || ""}
              onChange={(e) =>
                setData({
                  ...(currentData as any),
                  blueOceanFocus: e.target.value,
                })
              }
              onBlur={(e) => handleSave("blueOceanFocus", e.target.value)}
              placeholder="Describe your unique strategic focus..."
              className="min-h-32 border-blue-500/50"
            />
          </CardContent>
        </Card>
      </div>

      {/* FOUR ACTIONS FRAMEWORK */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Four Actions Framework</h2>
          <p className="text-muted-foreground mt-1">
            Reconstruct buyer value elements to shift from red ocean to blue
            ocean
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ELIMINATE */}
          <Card className="border-orange-500/30 bg-orange-500/5">
            <CardHeader>
              <Badge className="w-fit bg-orange-600">ELIMINATE</Badge>
              <CardTitle className="text-lg mt-3">What to Eliminate</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Which factors the industry takes for granted should be
                eliminated?
              </p>
            </CardHeader>
            <CardContent>
              <Textarea
                value={currentData.eliminate || ""}
                onChange={(e) =>
                  setData({
                    ...(currentData as any),
                    eliminate: e.target.value,
                  })
                }
                onBlur={(e) => handleSave("eliminate", e.target.value)}
                placeholder="Features or services you will eliminate..."
                className="min-h-32"
              />
            </CardContent>
          </Card>

          {/* REDUCE */}
          <Card className="border-yellow-500/30 bg-yellow-500/5">
            <CardHeader>
              <Badge className="w-fit bg-yellow-600">REDUCE</Badge>
              <CardTitle className="text-lg mt-3">What to Reduce</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Which factors should be reduced below industry standards?
              </p>
            </CardHeader>
            <CardContent>
              <Textarea
                value={currentData.reduce || ""}
                onChange={(e) =>
                  setData({ ...(currentData as any), reduce: e.target.value })
                }
                onBlur={(e) => handleSave("reduce", e.target.value)}
                placeholder="Features to reduce or simplify..."
                className="min-h-32"
              />
            </CardContent>
          </Card>

          {/* RAISE */}
          <Card className="border-green-500/30 bg-green-500/5">
            <CardHeader>
              <Badge className="w-fit bg-green-600">RAISE</Badge>
              <CardTitle className="text-lg mt-3">What to Raise</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Which factors should be raised above industry standards?
              </p>
            </CardHeader>
            <CardContent>
              <Textarea
                value={currentData.raise || ""}
                onChange={(e) =>
                  setData({ ...(currentData as any), raise: e.target.value })
                }
                onBlur={(e) => handleSave("raise", e.target.value)}
                placeholder="Features to invest in and improve..."
                className="min-h-32"
              />
            </CardContent>
          </Card>

          {/* CREATE */}
          <Card className="border-purple-500/30 bg-purple-500/5">
            <CardHeader>
              <Badge className="w-fit bg-purple-600">CREATE</Badge>
              <CardTitle className="text-lg mt-3">What to Create</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                What completely new factors should be created that the industry
                has never offered?
              </p>
            </CardHeader>
            <CardContent>
              <Textarea
                value={currentData.create || ""}
                onChange={(e) =>
                  setData({ ...(currentData as any), create: e.target.value })
                }
                onBlur={(e) => handleSave("create", e.target.value)}
                placeholder="New features or services to introduce..."
                className="min-h-32"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* BLUE OCEAN DEFINITION */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Blue Ocean Value Proposition</h2>
          <p className="text-muted-foreground mt-1">
            Define your unique value and competitive advantages
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Blue Ocean Benefits</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                What specific benefits do customers gain from your blue ocean
                strategy?
              </p>
            </CardHeader>
            <CardContent>
              <Textarea
                value={currentData.blueOceanBenefits || ""}
                onChange={(e) =>
                  setData({
                    ...(currentData as any),
                    blueOceanBenefits: e.target.value,
                  })
                }
                onBlur={(e) => handleSave("blueOceanBenefits", e.target.value)}
                placeholder="List the key benefits your blue ocean creates..."
                className="min-h-32"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Target Customers</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Who are your target customers in the blue ocean?
              </p>
            </CardHeader>
            <CardContent>
              <Textarea
                value={currentData.targetCustomers || ""}
                onChange={(e) =>
                  setData({
                    ...(currentData as any),
                    targetCustomers: e.target.value,
                  })
                }
                onBlur={(e) => handleSave("targetCustomers", e.target.value)}
                placeholder="Describe your ideal blue ocean customer..."
                className="min-h-32"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alternatives That Threaten</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                What alternatives could threaten your blue ocean? (Not direct
                competitors)
              </p>
            </CardHeader>
            <CardContent>
              <Textarea
                value={currentData.alternativesThreaten || ""}
                onChange={(e) =>
                  setData({
                    ...(currentData as any),
                    alternativesThreaten: e.target.value,
                  })
                }
                onBlur={(e) =>
                  handleSave("alternativesThreaten", e.target.value)
                }
                placeholder="List potential alternatives that could displace you..."
                className="min-h-32"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
