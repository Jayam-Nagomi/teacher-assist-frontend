"use client";

import { useParams, usePathname } from "next/navigation";
import { LayoutDashboard, Users, ArrowLeft, BookOpen, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function TermLayout({ children }: { children: React.ReactNode }) {
  const { id, termId } = useParams();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Term Sidebar */}
      <aside className={cn(
        "border-r border-border bg-card flex flex-col h-full shadow-sm z-10 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3 overflow-hidden">
              <a href={`/workspaces/${id}`} className="p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground shrink-0">
                <ArrowLeft className="w-4 h-4" />
              </a>
              <div className="flex items-center space-x-2 font-semibold whitespace-nowrap">
                <BookOpen className="w-5 h-5 text-indigo-500 shrink-0" />
                <span>Academic Term</span>
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
            href={`/workspaces/${id}/terms/${termId}/dashboard`}
            className={cn(
              "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname.includes('/dashboard') ? "bg-indigo-500/10 text-indigo-500" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              isCollapsed ? "justify-center" : "space-x-3"
            )}
            title={isCollapsed ? "Dashboard" : undefined}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Dashboard</span>}
          </a>
          <a
            href={`/workspaces/${id}/terms/${termId}/classes`}
            className={cn(
              "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname.includes('/classes') ? "bg-indigo-500/10 text-indigo-500" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              isCollapsed ? "justify-center" : "space-x-3"
            )}
            title={isCollapsed ? "Classes" : undefined}
          >
            <Users className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Classes</span>}
          </a>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto bg-muted/20 relative">
        {children}
      </main>
    </div>
  );
}
