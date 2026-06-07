"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, CheckCircle, Clock, Loader2, Trophy, Filter, ArrowUpDown } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { CustomSelect } from "@/components/ui/custom-select";

export default function DashboardPage() {
  const { termId } = useParams();
  const [stats, setStats] = useState({ totalActivities: 0, needsGrading: 0, gradingComplete: 0 });
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Sorting
  const [classFilter, setClassFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("MARKS_DESC");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, leaderboardRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/activities/term-stats/${termId}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/grades/term-leaderboard/${termId}`)
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (leaderboardRes.ok) setLeaderboard(await leaderboardRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [termId]);

  // Derived unique classes for the filter dropdown
  const uniqueClasses = useMemo(() => {
    const classes = new Set(leaderboard.map(s => s.className));
    return Array.from(classes);
  }, [leaderboard]);

  // Filtered and Sorted Leaderboard
  const filteredLeaderboard = useMemo(() => {
    let result = [...leaderboard];
    
    if (classFilter !== "ALL") {
      result = result.filter(s => s.className === classFilter);
    }
    
    result.sort((a, b) => {
      if (sortOrder === "MARKS_DESC") return b.finalScore - a.finalScore;
      if (sortOrder === "MARKS_ASC") return a.finalScore - b.finalScore;
      if (sortOrder === "NAME_ASC") return a.studentName.localeCompare(b.studentName);
      if (sortOrder === "NAME_DESC") return b.studentName.localeCompare(a.studentName);
      return 0;
    });

    return result;
  }, [leaderboard, classFilter, sortOrder]);

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="flex flex-col p-8 max-w-5xl mx-auto w-full space-y-8">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
          <LayoutDashboard className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Term Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalActivities}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Needs Grading (Student Tasks)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500 flex items-center">
              <Clock className="w-6 h-6 mr-2" /> {stats.needsGrading}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Grading Complete</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-500 flex items-center">
              <CheckCircle className="w-6 h-6 mr-2" /> {stats.gradingComplete}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden shadow-md border-border">
        <CardHeader className="bg-muted/10 border-b border-border py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-xl flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-indigo-500" />
              Term Leaderboard
            </CardTitle>
            
            <div className="flex items-center space-x-3">
              <CustomSelect 
                className="w-48"
                icon={<Filter className="w-4 h-4" />}
                value={classFilter}
                onChange={setClassFilter}
                options={[
                  { value: "ALL", label: "All Classes" },
                  ...uniqueClasses.map(c => ({ value: c, label: c }))
                ]}
              />

              <CustomSelect 
                className="w-56"
                icon={<ArrowUpDown className="w-4 h-4" />}
                value={sortOrder}
                onChange={setSortOrder}
                options={[
                  { value: "MARKS_DESC", label: "Marks (High to Low)" },
                  { value: "MARKS_ASC", label: "Marks (Low to High)" },
                  { value: "NAME_ASC", label: "Name (A to Z)" },
                  { value: "NAME_DESC", label: "Name (Z to A)" },
                ]}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-y-auto">
          {filteredLeaderboard.length === 0 ? (
             <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
               <Trophy className="w-12 h-12 mb-4 opacity-20" />
               <p>No student data available yet.</p>
             </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 border-b border-border sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 font-semibold">Rank</th>
                  <th className="px-6 py-4 font-semibold">Student Name</th>
                  <th className="px-6 py-4 font-semibold">Class</th>
                  <th className="px-6 py-4 font-semibold text-right">Final Mark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLeaderboard.map((student, index) => (
                  <tr key={student.studentId} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4 font-medium text-muted-foreground">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 font-semibold text-foreground">
                      {student.studentName}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {student.className}
                    </td>
                    <td className="px-6 py-4 font-bold text-lg text-right">
                      <span className={student.finalScore < (student.outOf / 2) ? "text-red-500" : "text-emerald-500"}>
                        {student.finalScore}
                      </span>
                      <span className="text-sm font-normal text-muted-foreground ml-1">/ {student.outOf}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
