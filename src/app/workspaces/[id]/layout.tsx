"use client";

import { useParams, usePathname } from "next/navigation";
import { Calendar, Settings, ArrowLeft, GraduationCap, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // If we are deep inside a Term layout, hide this Workspace sidebar entirely
  if (pathname.includes("/terms/")) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Workspace Sidebar */}
      <aside className={cn(
        "border-r border-border bg-muted/10 flex flex-col h-full transition-all duration-300 relative",
        isCollapsed ? "w-16" : "w-64"
      )}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3 overflow-hidden">
              <a href="/workspaces" className="p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground shrink-0">
                <ArrowLeft className="w-4 h-4" />
              </a>
              <div className="flex items-center space-x-2 font-semibold whitespace-nowrap">
                <GraduationCap className="w-5 h-5 text-primary shrink-0" />
                <span>Workspace</span>
              </div>
            </div>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className={cn(
              "p-2 hover:bg-muted rounded-md text-muted-foreground transition-colors",
              isCollapsed && "mx-auto"
            )}
          >
            {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-2 overflow-hidden">
          <a
            href={`/workspaces/${id}`}
            className={cn(
              "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === `/workspaces/${id}` ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              isCollapsed ? "justify-center" : "space-x-3"
            )}
            title={isCollapsed ? "Terms" : undefined}
          >
            <Calendar className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Terms</span>}
          </a>
          <a
            href={`/workspaces/${id}/settings`}
            className={cn(
              "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname.includes('/settings') ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              isCollapsed ? "justify-center" : "space-x-3"
            )}
            title={isCollapsed ? "Settings" : undefined}
          >
            <Settings className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Settings</span>}
          </a>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
