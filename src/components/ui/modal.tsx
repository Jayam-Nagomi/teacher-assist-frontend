"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="bg-card w-full max-w-md rounded-lg shadow-xl border border-border flex flex-col animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-semibold text-lg">{title}</h2>
            <button onClick={onClose} className="p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
