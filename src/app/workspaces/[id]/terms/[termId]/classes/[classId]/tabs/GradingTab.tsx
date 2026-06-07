"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Check } from "lucide-react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";

export default function GradingTab({ classId, termId }: { classId: string, termId: string }) {
  const [students, setStudents] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [internalMarks, setInternalMarks] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Track which grade cell is currently saving
  const [savingGradeId, setSavingGradeId] = useState<string | null>(null);

  // --- Column Resizing Logic ---
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const draggingRef = useRef<{ id: string, startX: number, startWidth: number } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(`col-widths-${classId}-${termId}`);
    if (stored) {
      try { setColumnWidths(JSON.parse(stored)); } catch (e) { }
    }
  }, [classId, termId]);

  const saveWidths = (newWidths: Record<string, number>) => {
    setColumnWidths(newWidths);
    localStorage.setItem(`col-widths-${classId}-${termId}`, JSON.stringify(newWidths));
  };

  const handleMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const startWidth = columnWidths[id] || 160;
    draggingRef.current = { id, startX: e.pageX, startWidth };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [columnWidths]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      const { id, startX, startWidth } = draggingRef.current;
      const delta = e.pageX - startX;
      let newWidth = startWidth + delta;

      if (newWidth < 100) newWidth = 100; // Min width
      if (newWidth > 500) newWidth = 500; // Max width

      setColumnWidths(prev => ({ ...prev, [id]: newWidth }));
    };

    const handleMouseUp = () => {
      if (draggingRef.current) {
        // Save to local storage on mouse up to avoid extreme localstorage spam during drag
        setColumnWidths(prev => {
          localStorage.setItem(`col-widths-${classId}-${termId}`, JSON.stringify(prev));
          return prev;
        });
      }
      draggingRef.current = null;
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [classId, termId]);
  // -----------------------------

  const [isProjectsExpanded, setIsProjectsExpanded] = useState(false);

  const fetchEverything = async () => {
    try {
      const [stuRes, actRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/${classId}`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/activities?classId=${classId}&termId=${termId}`)
      ]);

      const stData = await stuRes.json();
      const acData = await actRes.json();

      setStudents(stData);
      setActivities(acData);

      const marksMap: Record<string, any> = {};
      await Promise.all(stData.map(async (student: any) => {
        const markRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/grades/${student.id}/internal-mark?classId=${classId}&termId=${termId}`);
        if (markRes.ok) {
          marksMap[student.id] = await markRes.json();
        }
      }));
      setInternalMarks(marksMap);

    } catch (err) {
      toast.error("Failed to load grading spreadsheet.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEverything();
  }, [classId, termId]);

  const handleGradeUpdate = async (gradeId: string, studentId: string, field: "isCompleted" | "scoreAchieved", value: any) => {
    setSavingGradeId(gradeId);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/grades/${gradeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) throw new Error();

      const markRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/grades/${studentId}/internal-mark?classId=${classId}&termId=${termId}`);
      if (markRes.ok) {
        const newMark = await markRes.json();
        setInternalMarks(prev => ({ ...prev, [studentId]: newMark }));
      }
    } catch (err) {
      toast.error("Failed to save grade");
    } finally {
      setSavingGradeId(null);
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;

  const regularActivities = activities.filter(a => a.activityType !== "PROJECT");
  const projectActivities = activities.filter(a => a.activityType === "PROJECT");

  return (
    <Card className="overflow-hidden border-border shadow-md">
      <div className="overflow-x-auto">
        <table className="w-max min-w-full text-sm text-left border-collapse" style={{ tableLayout: "fixed" }}>
          <thead className="text-xs uppercase bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-4 font-semibold sticky left-0 bg-muted/50 shadow-[1px_0_0_0_#e2e8f0] dark:shadow-[1px_0_0_0_#27272a] z-20" style={{ width: columnWidths["student-name"] || 200 }}>
                <div className="flex items-center">
                  Student Name
                </div>
                <div
                  className="absolute top-0 right-0 w-2 h-full cursor-col-resize hover:bg-primary/50 opacity-0 hover:opacity-100 transition-opacity z-20"
                  onMouseDown={(e) => handleMouseDown(e, "student-name")}
                />
                <div className="absolute top-0 right-0 w-[1px] h-full bg-border" />
              </th>
              {regularActivities.map(act => (
                <th key={act.id} className="relative font-semibold z-10" style={{ width: columnWidths[act.id] || 160 }}>
                  <div className="flex flex-col px-4 py-4">
                    <span className="text-primary truncate">{act.title}</span>
                    <span className="text-[10px] text-muted-foreground mt-1 tracking-wider">{act.activityType} • {act.evaluationType === "COMPLETION_BASED" ? "Check" : `Out of ${act.maxScore}`}</span>
                  </div>
                  <div
                    className="absolute top-0 right-0 w-2 h-full cursor-col-resize hover:bg-primary/50 opacity-0 hover:opacity-100 transition-opacity z-20 group-hover:opacity-100"
                    onMouseDown={(e) => handleMouseDown(e, act.id)}
                  />
                  <div className="absolute top-0 right-0 w-[1px] h-full bg-border" />
                </th>
              ))}
              {projectActivities.length > 0 && (
                isProjectsExpanded ? (
                  <>
                    <th className="px-2 py-4 font-semibold bg-indigo-500/5 cursor-pointer hover:bg-indigo-500/10 transition-colors border-l border-indigo-500/20" onClick={() => setIsProjectsExpanded(false)} title="Collapse Projects" style={{ width: 40 }}>
                      <div className="flex items-center justify-center text-indigo-500">
                        <span className="text-lg font-bold">&lsaquo;</span>
                      </div>
                    </th>
                    {projectActivities.map(act => (
                      <th key={act.id} className="relative font-semibold bg-indigo-500/5 z-10" style={{ width: columnWidths[act.id] || 160 }}>
                        <div className="flex flex-col px-4 py-4">
                          <span className="text-indigo-500 truncate">{act.title}</span>
                          <span className="text-[10px] text-muted-foreground mt-1 tracking-wider">PROJECT • {act.evaluationType === "COMPLETION_BASED" ? "Check" : `Out of ${act.maxScore}`}</span>
                        </div>
                        <div
                          className="absolute top-0 right-0 w-2 h-full cursor-col-resize hover:bg-indigo-500/50 opacity-0 hover:opacity-100 transition-opacity z-20 group-hover:opacity-100"
                          onMouseDown={(e) => handleMouseDown(e, act.id)}
                        />
                        <div className="absolute top-0 right-0 w-[1px] h-full bg-border" />
                      </th>
                    ))}
                  </>
                ) : (
                  <th className="relative px-4 py-4 font-semibold cursor-pointer hover:bg-muted/80 transition-colors group z-10 bg-indigo-500/5"
                    // onClick={() => setIsProjectsExpanded(true)} 
                    title="Expand Projects" style={{ width: columnWidths["projects-grouped"] || 200 }}>
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between">
                        <span className="text-indigo-500 truncate">Projects</span>
                        {/* <span className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity text-xs">&rsaquo; Expand</span> */}
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1 tracking-wider">GROUPED • {projectActivities.length} ASSIGNED</span>
                    </div>
                    <div
                      className="absolute top-0 right-0 w-2 h-full cursor-col-resize hover:bg-indigo-500/50 opacity-0 hover:opacity-100 transition-opacity z-20 group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, "projects-grouped"); }}
                    />
                    <div className="absolute top-0 right-0 w-[1px] h-full bg-border" />
                  </th>
                )
              )}
              <th className="relative px-4 py-4 font-bold text-primary bg-indigo-500/5 shadow-[-1px_0_0_0_#e2e8f0] dark:shadow-[-1px_0_0_0_#27272a] z-10" style={{ width: columnWidths["final-mark"] || 140 }}>
                <div className="flex items-center">
                  FINAL MARK
                </div>
                <div
                  className="absolute top-0 right-0 w-2 h-full cursor-col-resize hover:bg-indigo-500/50 opacity-0 hover:opacity-100 transition-opacity z-20"
                  onMouseDown={(e) => handleMouseDown(e, "final-mark")}
                />
                <div className="absolute top-0 right-0 w-[1px] h-full bg-border" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {students.map(student => (
              <tr key={student.id} className="hover:bg-muted/10 transition-colors">
                <td className="px-4 py-4 font-medium sticky left-0 bg-card shadow-[1px_0_0_0_#e2e8f0] dark:shadow-[1px_0_0_0_#27272a] z-10">
                  {student.name}
                </td>

                {regularActivities.map(act => {
                  const grade = act.grades?.find((g: any) => g.studentId === student.id);
                  const tdClass = "px-4 py-3 relative border-r border-border";

                  if (!grade) {
                    return <td key={act.id} className={`${tdClass} text-muted-foreground text-xs italic`}>Not Assigned</td>;
                  }

                  return (
                    <td key={act.id} className={tdClass}>
                      {savingGradeId === grade.id && (
                        <div className="absolute top-1 right-1"><Loader2 className="w-3 h-3 animate-spin text-primary" /></div>
                      )}

                      {act.evaluationType === "COMPLETION_BASED" ? (
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="w-5 h-5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                            defaultChecked={grade.isCompleted}
                            onChange={(e) => handleGradeUpdate(grade.id, student.id, "isCompleted", e.target.checked)}
                          />
                        </div>
                      ) : (
                        <Input
                          type="number"
                          className="h-8 w-full max-w-[80px] px-2"
                          defaultValue={grade.scoreAchieved ?? ""}
                          placeholder={`/${act.maxScore}`}
                          onBlur={(e) => {
                            if (e.target.value !== String(grade.scoreAchieved ?? "")) {
                              handleGradeUpdate(grade.id, student.id, "scoreAchieved", e.target.value);
                            }
                          }}
                        />
                      )}
                    </td>
                  );
                })}

                {projectActivities.length > 0 && (
                  isProjectsExpanded ? (
                    <>
                      <td className="px-2 py-3 bg-indigo-500/5 border-l border-indigo-500/20 border-r border-border" />
                      {projectActivities.map(act => {
                        const grade = act.grades?.find((g: any) => g.studentId === student.id);
                        if (!grade) return <td key={act.id} className="px-4 py-4 text-muted-foreground text-xs italic bg-indigo-500/5 border-r border-border">Not Assigned</td>;
                        return (
                          <td key={act.id} className="px-4 py-3 relative bg-indigo-500/5 border-r border-border">
                            {savingGradeId === grade.id && (
                              <div className="absolute top-1 right-1"><Loader2 className="w-3 h-3 animate-spin text-primary" /></div>
                            )}
                            {act.evaluationType === "COMPLETION_BASED" ? (
                              <input
                                type="checkbox"
                                className="w-5 h-5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                                defaultChecked={grade.isCompleted}
                                onChange={(e) => handleGradeUpdate(grade.id, student.id, "isCompleted", e.target.checked)}
                              />
                            ) : (
                              <Input
                                type="number"
                                className="h-8 w-full max-w-[80px] px-2"
                                defaultValue={grade.scoreAchieved ?? ""}
                                placeholder={`/${act.maxScore}`}
                                onBlur={(e) => {
                                  if (e.target.value !== String(grade.scoreAchieved ?? "")) {
                                    handleGradeUpdate(grade.id, student.id, "scoreAchieved", e.target.value);
                                  }
                                }}
                              />
                            )}
                          </td>
                        );
                      })}
                    </>
                  ) : (
                    <td className="px-3 py-2 align-top border-x border-border/50 bg-indigo-500/5 border-r border-border">
                      <div className="space-y-1 w-full" style={{ minWidth: (columnWidths["projects-grouped"] || 200) - 24 }}>
                        {projectActivities.map(act => {
                          const grade = act.grades?.find((g: any) => g.studentId === student.id);
                          if (!grade) return null;

                          return (
                            <div key={act.id} className="flex items-center justify-between p-1 rounded hover:bg-muted/40 transition-colors relative">
                              <span className="text-xs font-medium w-full max-w-[120px] truncate mr-2" title={act.title}>{act.title}</span>

                              {savingGradeId === grade.id && (
                                <Loader2 className="w-3 h-3 animate-spin text-primary absolute -left-4" />
                              )}

                              <div className="flex items-center shrink-0">
                                {act.evaluationType === "COMPLETION_BASED" ? (
                                  <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                                    defaultChecked={grade.isCompleted}
                                    onChange={(e) => handleGradeUpdate(grade.id, student.id, "isCompleted", e.target.checked)}
                                  />
                                ) : (
                                  <div className="flex items-center relative">
                                    <Input
                                      type="number"
                                      className="h-6 w-12 text-xs px-1 text-center"
                                      defaultValue={grade.scoreAchieved ?? ""}
                                      onBlur={(e) => {
                                        if (e.target.value !== String(grade.scoreAchieved ?? "")) {
                                          handleGradeUpdate(grade.id, student.id, "scoreAchieved", e.target.value);
                                        }
                                      }}
                                    />
                                    <span className="ml-1 text-[10px] text-muted-foreground">/{act.maxScore}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {projectActivities.filter(act => act.grades?.find((g: any) => g.studentId === student.id)).length === 0 && (
                          <div className="text-muted-foreground text-xs italic py-1 text-center">Not Assigned</div>
                        )}
                      </div>
                    </td>
                  )
                )}

                <td className="px-4 py-4 font-bold text-lg bg-indigo-500/5 shadow-[-1px_0_0_0_#e2e8f0] dark:shadow-[-1px_0_0_0_#27272a]">
                  {internalMarks[student.id] ? (
                    <span className={internalMarks[student.id].finalScore < 10 ? "text-red-500" : "text-emerald-500"}>
                      {internalMarks[student.id].finalScore} <span className="text-sm font-normal text-muted-foreground">/ {internalMarks[student.id].outOf}</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">--</span>
                  )}
                </td>
              </tr>
            ))}

            {students.length === 0 && (
              <tr><td colSpan={activities.length + 2} className="p-8 text-center text-muted-foreground">No students in this class.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
