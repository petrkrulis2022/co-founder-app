"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface MobileSidebarProps {
  projectName: string;
  children: React.ReactNode;
}

export function MobileSidebar({ projectName, children }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-transparent bg-transparent px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M2 4h12M2 8h12M2 12h12" />
        </svg>
        <span className="truncate max-w-[160px]">{projectName}</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-[260px] p-0 bg-card">
        <div onClick={() => setOpen(false)}>{children}</div>
      </SheetContent>
    </Sheet>
  );
}
