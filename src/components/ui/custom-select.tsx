"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  className?: string;
  placeholder?: string;
  icon?: React.ReactNode;
}

export function CustomSelect({ value, onChange, options, className, placeholder, icon }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={cn("relative w-full", className)} ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors shadow-sm"
      >
        <div className="flex items-center space-x-2 truncate">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <span className="truncate">{selectedOption?.label || placeholder || "Select..."}</span>
        </div>
        <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full min-w-[8rem] overflow-auto rounded-md border border-border bg-card text-card-foreground shadow-md animate-in fade-in-80 zoom-in-95">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                "relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 px-3 text-sm outline-none hover:bg-muted transition-colors",
                value === option.value && "bg-indigo-500/10 text-indigo-500 font-medium"
              )}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
