"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { GraduationCap, ArrowLeft, Users, Calendar, Plus, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

type SchoolClass = { id: string; name: string };
type Term = { id: string; name: string };

export default function WorkspaceDetailsPage() {
  const { id } = useParams();
  
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  
  const [newClassName, setNewClassName] = useState("");
  const [newTermName, setNewTermName] = useState("");
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesRes, termsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes/${id}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/terms/${id}`),
        ]);
        
        if (classesRes.ok) setClasses(await classesRes.json());
        if (termsRes.ok) setTerms(await termsRes.json());
      } catch (error) {
        toast.error("Failed to load workspace data.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handleCreateTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTermName.trim()) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/terms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTermName, workspaceId: id }),
      });
      if (!res.ok) throw new Error("Failed");
      setTerms([...terms, await res.json()]);
      setNewTermName("");
      toast.success("Term created!");
    } catch (err) {
      toast.error("Failed to create term.");
    }
  };

  return (
    <div className="flex flex-col flex-1 p-8 max-w-5xl mx-auto w-full space-y-8">
      <div className="flex items-center space-x-4">
        <h1 className="text-3xl font-bold text-foreground">Terms Management</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-4 md:col-span-2">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Academic Terms
            </h2>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <form onSubmit={handleCreateTerm} className="flex gap-2 max-w-sm">
                  <Input 
                    placeholder="e.g. Term 1" 
                    value={newTermName}
                    onChange={(e) => setNewTermName(e.target.value)}
                  />
                  <Button type="submit" disabled={!newTermName}><Plus className="w-4 h-4 mr-2"/> Create Term</Button>
                </form>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  {terms.map((t) => (
                    <div key={t.id} className="p-4 bg-muted/50 rounded-lg border border-border text-sm flex flex-col justify-between items-start space-y-4 hover:border-primary/50 transition-colors">
                      <span className="font-medium text-lg">{t.name}</span>
                      <Button variant="default" className="w-full" onClick={() => window.location.href = `/workspaces/${id}/terms/${t.id}/dashboard`}>
                         Open Term &rarr;
                      </Button>
                    </div>
                  ))}
                </div>
                {terms.length === 0 && <p className="text-sm text-muted-foreground py-4">No terms created yet. Create one to start managing classes.</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
