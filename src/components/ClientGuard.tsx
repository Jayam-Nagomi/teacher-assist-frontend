"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "./ui/button";

export function ClientGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center space-y-6 bg-background p-8">
        <div className="p-6 bg-red-500/10 rounded-full">
          <ShieldAlert className="w-16 h-16 text-red-500" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">Access Denied</h1>
        <p className="text-muted-foreground text-lg text-center max-w-md">
          You must be logged in to access this secure grading workspace. Please return to the home page and authenticate.
        </p>
        <Button size="lg" className="h-12 px-8 bg-primary text-primary-foreground" onClick={() => router.push('/')}>
          Return to Home
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
