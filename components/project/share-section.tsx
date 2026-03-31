"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface ShareLink {
  id: string;
  token: string;
  label: string | null;
  permissions: { canView: string[]; canComment: boolean };
  expiresAt: string | null;
  viewCount: number;
  lastViewedAt: string | null;
  createdAt: string;
}

const SECTION_OPTIONS = [
  { value: "lean_canvas", label: "Lean Canvas" },
  { value: "stress_scores", label: "Stress Scores" },
  { value: "pitch_sections", label: "Pitch Sections" },
  { value: "stage_summaries", label: "Stage Summaries" },
  { value: "sprint_details", label: "Sprint Details" },
];

export function ShareSection({ projectId }: { projectId: string }) {
  const [links, setLinks] = useState<ShareLink[]>([]);
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [expiry, setExpiry] = useState("never");
  const [sections, setSections] = useState<string[]>([
    "lean_canvas",
    "stress_scores",
    "pitch_sections",
    "stage_summaries",
  ]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch(`/api/share?projectId=${projectId}`)
      .then((r) => r.json())
      .then((data) => setLinks(data.links ?? []))
      .catch(() => {});
  }, [projectId]);

  async function handleCreate() {
    setCreating(true);
    try {
      let expiresAt: string | undefined;
      if (expiry !== "never") {
        const d = new Date();
        d.setDate(d.getDate() + parseInt(expiry));
        expiresAt = d.toISOString();
      }
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          label: label.trim() || undefined,
          permissions: { canView: sections, canComment: false },
          expiresAt,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      await navigator.clipboard.writeText(data.url);
      toast.success("Share link created & copied!");
      setOpen(false);
      setLabel("");
      setExpiry("never");
      // Refresh list
      const listRes = await fetch(`/api/share?projectId=${projectId}`);
      const listData = await listRes.json();
      setLinks(listData.links ?? []);
    } catch {
      toast.error("Failed to create share link");
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(token: string) {
    try {
      await fetch("/api/share", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      setLinks((prev) => prev.filter((l) => l.token !== token));
      toast.success("Link revoked");
    } catch {
      toast.error("Failed to revoke link");
    }
  }

  async function handleCopy(token: string) {
    const url = `${window.location.origin}/share/${token}`;
    await navigator.clipboard.writeText(url);
    toast.success("Link copied!");
  }

  function toggleSection(value: string) {
    setSections((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value],
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
            Share with Advisors
          </CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="text-xs text-[#00d4ff] hover:underline cursor-pointer">
              + Create Link
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Share Link</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Label (optional)
                  </label>
                  <Input
                    placeholder="e.g. For YC mentor"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Expires
                  </label>
                  <Select
                    value={expiry}
                    onValueChange={(val) => {
                      if (val) setExpiry(val);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Sections to share
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SECTION_OPTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={sections.includes(opt.value)}
                          onChange={() => toggleSection(opt.value)}
                          className="rounded border-border"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={handleCreate}
                  disabled={creating || sections.length === 0}
                  className="w-full bg-[#00ff9d] text-[#050505] hover:bg-[#00ff9d]/90"
                >
                  {creating ? "Creating..." : "Create & Copy Link"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {links.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No share links yet. Create one to get feedback from advisors.
          </p>
        ) : (
          <div className="space-y-2">
            {links.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border text-xs"
              >
                <div className="space-y-0.5">
                  <p className="font-medium">{link.label || "Untitled link"}</p>
                  <p className="text-muted-foreground">
                    {link.viewCount} views
                    {link.expiresAt && (
                      <>
                        {" · "}
                        {new Date(link.expiresAt) < new Date() ? (
                          <span className="text-red-400">Expired</span>
                        ) : (
                          <>
                            Expires{" "}
                            {new Date(link.expiresAt).toLocaleDateString()}
                          </>
                        )}
                      </>
                    )}
                    {" · "}
                    {new Date(link.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px]"
                    onClick={() => handleCopy(link.token)}
                  >
                    Copy
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] text-red-400 hover:text-red-300"
                    onClick={() => handleRevoke(link.token)}
                  >
                    Revoke
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
