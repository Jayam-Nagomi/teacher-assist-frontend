"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { GraduationCap, Plus, Folder, Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type Workspace = {
  id: string;
  name: string;
  defaultTotalMaxMark: number;
};

export default function WorkspacesPage() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchWorkspaces = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspaces`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        router.push("/");
        toast.error("Session expired. Please log in again.");
        return;
      }
      
      if (!res.ok) throw new Error("Failed to fetch workspaces");
      const data = await res.json();
      setWorkspaces(data);
    } catch (error) {
      toast.error("Could not load workspaces. Is the backend running?");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspaces`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: newWorkspaceName }),
      });
      
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        router.push("/");
        toast.error("Session expired. Please log in again.");
        return;
      }
      
      if (!res.ok) throw new Error("Failed to create workspace");
      
      const newWorkspace = await res.json();
      setWorkspaces([...workspaces, newWorkspace]);
      setNewWorkspaceName("");
      toast.success("Workspace created!");
    } catch (error) {
      toast.error("Failed to create workspace.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
    toast.success("Logged out successfully");
  };

  return (
    <div className="flex flex-col flex-1 p-8 max-w-5xl mx-auto w-full space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Workspaces</h1>
        </div>
        <Button variant="ghost" onClick={handleLogout} className="text-muted-foreground hover:text-red-500">
          <LogOut className="w-4 h-4 mr-2" />
          Log Out
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create Workspace Form */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="w-5 h-5" />
              New Academic Year
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Workspace Name
                </label>
                <Input
                  placeholder="e.g. 2026-2027"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting || !newWorkspaceName}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create Workspace
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Workspaces List */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Your Workspaces</h2>
          {isLoading ? (
            <div className="flex items-center justify-center p-12 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : workspaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border rounded-xl text-center space-y-3">
              <Folder className="w-12 h-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">No workspaces found.</p>
              <p className="text-sm text-muted-foreground">Create one to start managing your classes and terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {workspaces.map((workspace) => (
                <Card key={workspace.id} className="hover:border-primary/50 transition-colors cursor-pointer group">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      {workspace.name}
                      <Folder className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Total Max Mark: {workspace.defaultTotalMaxMark}
                    </p>
                    <Button variant="ghost" className="w-full mt-4 justify-between" onClick={() => window.location.href = `/workspaces/${workspace.id}`}>
                      Manage <span className="ml-2">&rarr;</span>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
