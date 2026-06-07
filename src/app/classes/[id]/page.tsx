"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, Calculator, ArrowLeft, Loader2, Search } from "lucide-react";
import toast from "react-hot-toast";

// Mock data for demonstration since we didn't build student creation APIs yet
const MOCK_STUDENTS = [
  { id: "stu_1", name: "Alice Johnson" },
  { id: "stu_2", name: "Bob Smith" },
];

export default function ClassDetailsPage() {
  const { id: classId } = useParams();
  
  const [termId, setTermId] = useState("");
  const [results, setResults] = useState<Record<string, any>>({});
  const [isCalculating, setIsCalculating] = useState<string | null>(null);

  const calculateMark = async (studentId: string) => {
    if (!termId) {
      toast.error("Please enter a Term ID first to filter by term.");
      return;
    }

    setIsCalculating(studentId);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/grades/${studentId}/internal-mark?classId=${classId}&termId=${termId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResults(prev => ({ ...prev, [studentId]: data }));
      toast.success("Marks calculated!");
    } catch (err) {
      // For demonstration, if backend fails because data doesn't exist, we mock a response
      toast.error("Failed to calculate (No real grades in DB yet). Displaying mock result.");
      setResults(prev => ({
        ...prev, 
        [studentId]: {
           finalScore: 18.5,
           outOf: 20,
           breakdown: {
             tasks: { averagePercentage: 90, weightedScore: 4.5, outOf: 5 },
             projects: { averagePercentage: 100, weightedScore: 5, outOf: 5 },
             tests: { averagePercentage: 90, weightedScore: 9, outOf: 10 }
           }
        }
      }));
    } finally {
      setIsCalculating(null);
    }
  };

  return (
    <div className="flex flex-col flex-1 p-8 max-w-5xl mx-auto w-full space-y-8">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="p-2 bg-primary/10 text-primary rounded-lg">
          <Users className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Class Management</h1>
      </div>

      <div className="bg-muted/30 border border-border p-4 rounded-xl flex items-center space-x-4">
        <div className="flex-1">
          <label className="text-sm font-medium">Filter by Term ID</label>
          <Input 
            placeholder="Paste a Term ID to calculate marks for that term..." 
            value={termId}
            onChange={(e) => setTermId(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {MOCK_STUDENTS.map(student => (
          <Card key={student.id} className="overflow-hidden">
            <CardHeader className="bg-muted/20 border-b border-border pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">{student.name}</CardTitle>
              <Button 
                onClick={() => calculateMark(student.id)} 
                disabled={isCalculating === student.id}
                size="sm"
              >
                {isCalculating === student.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Calculator className="w-4 h-4 mr-2" />}
                Calculate Internal Mark
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              {results[student.id] ? (
                <div className="space-y-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Final Score</p>
                      <p className="text-4xl font-bold text-primary">
                        {results[student.id].finalScore} <span className="text-xl text-muted-foreground font-normal">/ {results[student.id].outOf}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                    <div className="p-3 bg-muted/40 rounded-lg">
                      <p className="text-xs text-muted-foreground uppercase">Tasks</p>
                      <p className="font-semibold">{results[student.id].breakdown.tasks.weightedScore} / {results[student.id].breakdown.tasks.outOf}</p>
                    </div>
                    <div className="p-3 bg-muted/40 rounded-lg">
                      <p className="text-xs text-muted-foreground uppercase">Projects</p>
                      <p className="font-semibold">{results[student.id].breakdown.projects.weightedScore} / {results[student.id].breakdown.projects.outOf}</p>
                    </div>
                    <div className="p-3 bg-muted/40 rounded-lg">
                      <p className="text-xs text-muted-foreground uppercase">Tests</p>
                      <p className="font-semibold">{results[student.id].breakdown.tests.weightedScore} / {results[student.id].breakdown.tests.outOf}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
                  <Search className="w-8 h-8 mb-2 opacity-20" />
                  <p>Click calculate to run the Scoring Engine for {student.name}.</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
