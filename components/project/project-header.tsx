"use client";

import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

interface ProjectHeaderProps {
  projectId: string;
  initialName: string;
  initialThesis: string;
  domain: string;
  status: string;
}

export function ProjectHeader({
  projectId,
  initialName,
  initialThesis,
  domain,
  status,
}: ProjectHeaderProps) {
  const [name, setName] = useState(initialName);
  const [thesis, setThesis] = useState(initialThesis);
  const [editingName, setEditingName] = useState(false);
  const [editingThesis, setEditingThesis] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const thesisRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editingName && nameRef.current) {
      nameRef.current.focus();
      nameRef.current.select();
    }
  }, [editingName]);

  useEffect(() => {
    if (editingThesis && thesisRef.current) {
      thesisRef.current.focus();
    }
  }, [editingThesis]);

  const save = async (field: "name" | "thesis", value: string) => {
    await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
  };

  const handleNameBlur = () => {
    setEditingName(false);
    const trimmed = name.trim();
    if (trimmed && trimmed !== initialName) {
      save("name", trimmed);
    } else if (!trimmed) {
      setName(initialName);
    }
  };

  const handleThesisBlur = () => {
    setEditingThesis(false);
    if (thesis.trim() !== initialThesis.trim()) {
      save("thesis", thesis.trim());
    }
  };

  return (
    <div className="space-y-2">
      {/* Name */}
      {editingName ? (
        <input
          ref={nameRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleNameBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleNameBlur();
            if (e.key === "Escape") {
              setName(initialName);
              setEditingName(false);
            }
          }}
          className="text-2xl font-bold bg-transparent border-b border-[#00ff9d]/50 outline-none w-full pb-1"
        />
      ) : (
        <h1
          className="text-2xl font-bold cursor-pointer hover:text-[#00ff9d] transition-colors"
          onClick={() => setEditingName(true)}
          title="Click to edit"
        >
          {name}
        </h1>
      )}

      {/* Badges */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-[10px]">
          {domain}
        </Badge>
        <Badge
          variant="outline"
          className="text-[10px]"
          style={{
            borderColor:
              status === "active"
                ? "#00ff9d"
                : status === "paused"
                  ? "#fbbf24"
                  : "#6b7280",
          }}
        >
          {status}
        </Badge>
      </div>

      {/* Thesis */}
      {editingThesis ? (
        <textarea
          ref={thesisRef}
          value={thesis}
          onChange={(e) => setThesis(e.target.value)}
          onBlur={handleThesisBlur}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setThesis(initialThesis);
              setEditingThesis(false);
            }
          }}
          rows={2}
          className="w-full text-sm text-muted-foreground bg-transparent border-b border-[#00ff9d]/30 outline-none resize-none max-w-2xl"
          placeholder="Describe your startup idea..."
        />
      ) : (
        <p
          className="text-sm text-muted-foreground max-w-2xl cursor-pointer hover:text-foreground transition-colors"
          onClick={() => setEditingThesis(true)}
          title="Click to edit"
        >
          {thesis || "Click to add a thesis..."}
        </p>
      )}
    </div>
  );
}
