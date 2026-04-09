"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Plus, X } from "lucide-react";

interface CanvasCellProps {
  label: string;
  fieldKey: string;
  value?: string;
  blockNumber: number;
  projectId: string;
  onSave: (fieldKey: string, value: string) => void;
  minHeight?: string;
}

function parseEntries(value?: string): string[] {
  if (!value?.trim()) return [];
  return value
    .split("\n")
    .map((l) => l.replace(/^•\s*/, "").trim())
    .filter(Boolean);
}

function entriesToValue(entries: string[]): string {
  return entries
    .map((e) => e.trim())
    .filter(Boolean)
    .join("\n");
}

export function CanvasCell({
  label,
  fieldKey,
  value,
  blockNumber,
  projectId,
  onSave,
  minHeight = "120px",
}: CanvasCellProps) {
  const [entries, setEntries] = useState<string[]>(() => parseEntries(value));
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [addingNew, setAddingNew] = useState(false);
  const [newEntryText, setNewEntryText] = useState("");
  const [saving, setSaving] = useState(false);
  const editRef = useRef<HTMLTextAreaElement>(null);
  const newEntryRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEntries(parseEntries(value));
  }, [value]);

  useEffect(() => {
    if (editingIndex !== null && editRef.current) {
      editRef.current.focus();
      editRef.current.selectionStart = editRef.current.value.length;
    }
  }, [editingIndex]);

  useEffect(() => {
    if (addingNew && newEntryRef.current) {
      newEntryRef.current.focus();
    }
  }, [addingNew]);

  const persist = useCallback(
    async (nextEntries: string[]) => {
      const newValue = entriesToValue(nextEntries);
      const oldValue = entriesToValue(entries);
      if (newValue === oldValue) return;
      setSaving(true);
      try {
        const res = await fetch("/api/lean-canvas", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            [fieldKey]: newValue || null,
          }),
        });
        if (res.ok) {
          setEntries(nextEntries);
          onSave(fieldKey, newValue);
        }
      } finally {
        setSaving(false);
      }
    },
    [entries, fieldKey, onSave, projectId],
  );

  const commitEdit = useCallback(
    (index: number) => {
      const trimmed = editingText.trim();
      setEditingIndex(null);
      if (!trimmed) {
        // remove if emptied
        const next = entries.filter((_, i) => i !== index);
        void persist(next);
      } else if (trimmed !== entries[index]) {
        const next = entries.map((e, i) => (i === index ? trimmed : e));
        void persist(next);
      }
    },
    [editingText, entries, persist],
  );

  const commitNew = useCallback(() => {
    const trimmed = newEntryText.trim();
    setAddingNew(false);
    setNewEntryText("");
    if (trimmed) {
      const next = [...entries, trimmed];
      void persist(next);
    }
  }, [entries, newEntryText, persist]);

  const removeEntry = useCallback(
    (e: React.MouseEvent, index: number) => {
      e.stopPropagation();
      const next = entries.filter((_, i) => i !== index);
      void persist(next);
    },
    [entries, persist],
  );

  const hasFill = entries.length > 0;

  return (
    <div
      className="border border-border rounded-lg p-3 bg-card relative group transition-colors hover:border-foreground/20 flex flex-col"
      style={{ minHeight }}
    >
      {/* Watermark number */}
      <span className="absolute top-2 right-2 text-[40px] font-bold text-secondary pointer-events-none select-none leading-none">
        {blockNumber}
      </span>

      {/* Label row */}
      <div className="flex items-center gap-1.5 mb-2 relative z-10">
        {hasFill && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] shrink-0" />
        )}
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex-1">
          {label}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setAddingNew(true);
          }}
          className="opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 text-muted-foreground hover:text-foreground transition-opacity"
          title="Add entry"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Entries */}
      <div className="relative z-10 flex flex-col gap-1.5 flex-1">
        {entries.length === 0 && !addingNew && (
          <p className="text-xs text-muted-foreground/50 italic">
            Click + to add an entry
          </p>
        )}

        {entries.map((entry, index) => (
          <div
            key={index}
            className="group/entry relative bg-secondary/50 rounded px-2 py-1.5 cursor-pointer hover:bg-secondary transition-colors"
            onClick={() => {
              if (editingIndex !== index) {
                setEditingIndex(index);
                setEditingText(entry);
              }
            }}
          >
            {editingIndex === index ? (
              <textarea
                ref={editRef}
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                onBlur={() => commitEdit(index)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    commitEdit(index);
                  }
                  if (e.key === "Escape") {
                    setEditingIndex(null);
                    setEditingText("");
                  }
                }}
                disabled={saving}
                rows={2}
                className="w-full bg-transparent text-sm resize-none outline-none text-foreground"
              />
            ) : (
              <p className="text-sm text-foreground pr-4">{entry}</p>
            )}
            {editingIndex !== index && (
              <button
                onClick={(e) => removeEntry(e, index)}
                className="absolute top-1 right-1 opacity-0 group-hover/entry:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                title="Remove entry"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}

        {/* New entry input */}
        {addingNew && (
          <div className="bg-secondary/50 rounded px-2 py-1.5">
            <textarea
              ref={newEntryRef}
              value={newEntryText}
              onChange={(e) => setNewEntryText(e.target.value)}
              onBlur={commitNew}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  commitNew();
                }
                if (e.key === "Escape") {
                  setAddingNew(false);
                  setNewEntryText("");
                }
              }}
              rows={2}
              placeholder="Type entry, Enter to save..."
              className="w-full bg-transparent text-sm resize-none outline-none text-foreground placeholder:text-muted-foreground/50"
            />
          </div>
        )}
      </div>

      {/* New Entry button at bottom */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setAddingNew(true);
        }}
        className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors relative z-10"
      >
        <Plus className="w-3 h-3" />
        New Entry
      </button>
    </div>
  );
}
