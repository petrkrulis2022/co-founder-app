"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface MobileSidebarProps {
  projectName: string;
  children: React.ReactNode;
}

export function MobileSidebar({ projectName, children }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        <Button variant="ghost" size="sm" className="text-sm gap-2">
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
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[260px] p-0 bg-card">
        <div onClick={() => setOpen(false)}>{children}</div>
      </SheetContent>
    </Sheet>
  );
}
