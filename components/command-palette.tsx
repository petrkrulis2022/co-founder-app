"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import { STAGES } from "@/lib/stages";

interface CommandPaletteProps {
  projectId: string;
}

export function CommandPalette({ projectId }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navigateTo = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Jump to stage, export, or overview..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => navigateTo(`/project/${projectId}`)}>
            Overview
          </CommandItem>
          <CommandItem onSelect={() => navigateTo("/dashboard")}>
            Dashboard
          </CommandItem>
          <CommandItem
            onSelect={() => navigateTo(`/project/${projectId}/export`)}
          >
            Export
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Stages">
          {STAGES.map((stage) => {
            const path = `/project/${projectId}/${stage.key}`;

            return (
              <CommandItem key={stage.key} onSelect={() => navigateTo(path)}>
                <span
                  className="inline-block w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: stage.color }}
                />
                {String(stage.number).padStart(2, "0")}. {stage.label}
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
