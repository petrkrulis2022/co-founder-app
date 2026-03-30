"use client";

import { useState, useRef, useEffect } from "react";

interface CanvasCellProps {
  label: string;
  fieldKey: string;
  value?: string;
  blockNumber: number;
  projectId: string;
  onSave: (fieldKey: string, value: string) => void;
}

export function CanvasCell({
  label,
  fieldKey,
  value,
  blockNumber,
  projectId,
  onSave,
}: CanvasCellProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(value || "");
  }, [value]);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = textareaRef.current.value.length;
    }
  }, [editing]);

  const handleSave = async () => {
    const trimmed = draft.trim();
    if (trimmed === (value || "").trim()) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/lean-canvas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          [fieldKey]: trimmed || null,
        }),
      });
      if (res.ok) {
        onSave(fieldKey, trimmed);
      }
    } finally {
      setSaving(false);
      setEditing(false);
    }
  };

  const hasFill = !!value?.trim();

  return (
    <div
      className="border border-border rounded-lg p-3 bg-card min-h-[120px] relative group cursor-pointer transition-colors hover:border-foreground/20"
      onClick={() => !editing && setEditing(true)}
    >
      {/* Watermark number */}
      <span className="absolute top-2 right-2 text-[40px] font-bold text-secondary pointer-events-none select-none leading-none">
        {blockNumber}
      </span>

      {/* Label + filled indicator */}
      <div className="flex items-center gap-1.5 mb-2 relative z-10">
        {hasFill && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] shrink-0" />
        )}
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      </div>

      {editing ? (
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setDraft(value || "");
              setEditing(false);
            }
          }}
          disabled={saving}
          className="w-full bg-transparent text-sm resize-none outline-none min-h-[60px] relative z-10 text-foreground"
          placeholder={`Enter ${label.toLowerCase()}...`}
        />
      ) : (
        <div className="relative z-10">
          {value ? (
            <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-6">
              {value}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground/50 italic">
              Click to edit
            </p>
          )}
        </div>
      )}
    </div>
  );
}
