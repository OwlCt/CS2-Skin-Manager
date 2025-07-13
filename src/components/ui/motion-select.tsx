"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Option = {
  value: string;
  label: React.ReactNode;
};

interface MotionSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function MotionSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className,
}: MotionSelectProps) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex min-w-0 w-full items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground shadow-sm transition focus:outline-none focus:ring-2 focus:ring-ring/50",
            "font-medium",
            className
          )}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className={cn(!selected && "text-muted-foreground")}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 opacity-60" />
        </button>
      </PopoverTrigger>
      <AnimatePresence>
        {open && (
          <PopoverContent
            align="start"
            className="p-0 min-w-0 w-[var(--radix-popover-trigger-width)] max-w-md bg-popover rounded-xl border border-border shadow-lg"
            sideOffset={4}
            asChild
          >
            <motion.ul
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18 }}
              className="max-h-72 overflow-auto rounded-xl py-1"
              role="listbox"
            >
              {options.map((option) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={option.value === value}
                  tabIndex={0}
                  className={cn(
                    "cursor-pointer select-none px-5 py-3 text-base transition-colors font-medium",
                    option.value === value
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-muted/60",
                    "rounded-lg"
                  )}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      onChange(option.value);
                      setOpen(false);
                    }
                  }}
                >
                  {option.label}
                </li>
              ))}
            </motion.ul>
          </PopoverContent>
        )}
      </AnimatePresence>
    </Popover>
  );
}
