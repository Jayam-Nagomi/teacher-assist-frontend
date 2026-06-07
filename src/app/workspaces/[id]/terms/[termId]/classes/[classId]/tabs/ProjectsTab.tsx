"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash, Loader2, Plus, Users, Edit2, Search, Briefcase } from "lucide-react";
import toast from "react-hot-toast";
import { CustomSelect } from "@/components/ui/custom-select";
import { Modal } from "@/components/ui/modal";

type Student = { id: string; name: string };

export default function ProjectsTab({ classId, termId }: { classId: string, termId: string }) {
  const [activities, setActivities] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [evaluationType, setEvaluationType] = useState("PERFORMANCE_BASED");
  const [maxScore, setMaxScore] = useState("");
  
  // Selected students for the project
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");

  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editTopic, setEditTopic] = useState("");
  const [editMaxScore, setEditMaxScore] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const fetchData = async () => {
    try {
      const [actRes, stuRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/activities?classId=${classId}&termId=${termId}&type=PROJECT`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/${classId}`)
      ]);
      
      if (actRes.ok) setActivities(await actRes.json());
      if (stuRes.ok) setStudents(await stuRes.json());
    } catch (err) {
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [classId, termId]);

  const toggleStudent = (id: string) => {
    setSelectedStudents(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim() || !topic.trim() || selectedStudents.length === 0) {
      toast.error("Please fill all fields and select at least 1 student.");
      return;
    }
    if ((evaluationType === "PERFORMANCE_BASED" || evaluationType === "HYBRID") && !maxScore) {
      toast.error("Please enter a max score.");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title, subject, topic, classId, termId, 
          activityType: "PROJECT", 
          evaluationType, 
          maxScore: (evaluationType === "PERFORMANCE_BASED" || evaluationType === "HYBRID") ? maxScore : null,
          assignedStudentIds: selectedStudents
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Project assigned!");
      setTitle(""); setSubject(""); setTopic(""); setMaxScore(""); setSelectedStudents([]); setEvaluationType("PERFORMANCE_BASED");
      setStudentSearchQuery("");
      setIsCreateModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error("Failed to assign project.");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !editSubject.trim() || !editTopic.trim()) return;

    setIsEditing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activities/${editingActivity.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: editTitle, 
          subject: editSubject, 
          topic: editTopic,
          maxScore: editMaxScore ? editMaxScore : null
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Project updated!");
      setEditingActivity(null);
      fetchData();
    } catch (err) {
      toast.error("Failed to update project.");
    } finally {
      setIsEditing(false);
    }
  };

  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activities/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setActivities(activities.filter(a => a.id !== id));
      toast.success("Project deleted");
    } catch (err) {
      toast.error("Failed to delete project");
    }
  };

  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()));

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Project Assignments</h2>
        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-indigo-500 hover:bg-indigo-600">
          <Briefcase className="w-4 h-4 mr-2" /> Assign Project
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Assigned Projects</CardTitle>
          <div className="text-sm font-medium px-3 py-1 bg-primary/10 text-primary rounded-full">
            {activities.length} Projects
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : activities.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground border border-dashed border-border rounded-lg">
              No projects assigned yet. Click "Assign Project" to create one.
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map(a => (
                <div key={a.id} className="p-4 border border-border rounded-lg flex flex-col space-y-3 bg-card shadow-sm hover:border-primary/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-lg">{a.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        <span className="font-medium text-foreground">{a.subject}</span> • {a.topic}
                      </p>
                      <div className="mt-2 text-xs font-medium bg-muted/50 text-muted-foreground inline-flex px-2 py-1 rounded">
                        {a.evaluationType === "COMPLETION_BASED" && "Completion Based (Checkmark)"}
                        {a.evaluationType === "PERFORMANCE_BASED" && `Performance Based (Out of ${a.maxScore})`}
                        {a.evaluationType === "HYBRID" && `Hybrid (Check + Out of ${a.maxScore})`}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-foreground" 
                        onClick={() => {
                          setEditingActivity(a);
                          setEditTitle(a.title);
                          setEditSubject(a.subject);
                          setEditTopic(a.topic);
                          setEditMaxScore(a.maxScore ? String(a.maxScore) : "");
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => handleDelete(a.id)}>
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground mt-4 pt-3 border-t border-border/50">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Assigned to {a.grades?.length || 0} student{a.grades?.length !== 1 && 's'}
                    </div>
                    <button 
                      onClick={() => setExpandedProjectId(expandedProjectId === a.id ? null : a.id)}
                      className="text-primary hover:underline text-xs font-medium"
                    >
                      {expandedProjectId === a.id ? "Hide Details" : "View Details"}
                    </button>
                  </div>
                  {expandedProjectId === a.id && (
                    <div className="mt-3 p-3 bg-muted/30 rounded-md border border-border/50 text-sm">
                      <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Assigned Students</span>
                      <ul className="space-y-1">
                        {a.grades?.map((grade: any) => (
                          <li key={grade.id} className="flex items-center space-x-2 text-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                            <span>{grade.student?.name || "Unknown Student"}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Assign Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Project Name</label>
            <Input placeholder="e.g. Science Fair Model" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject</label>
            <Input placeholder="e.g. Physics" value={subject} onChange={e => setSubject(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Topic</label>
            <Input placeholder="e.g. Thermodynamics" value={topic} onChange={e => setTopic(e.target.value)} />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Grading System</label>
            <CustomSelect 
              value={evaluationType}
              onChange={setEvaluationType}
              options={[
                { value: "COMPLETION_BASED", label: "Completion Based (Checkmark)" },
                { value: "PERFORMANCE_BASED", label: "Performance Based (Score)" },
                { value: "HYBRID", label: "Hybrid (Checkmark + Score)" }
              ]}
            />
          </div>
          {(evaluationType === "PERFORMANCE_BASED" || evaluationType === "HYBRID") && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Score</label>
              <Input type="number" placeholder="e.g. 20" value={maxScore} onChange={e => setMaxScore(e.target.value)} />
            </div>
          )}

          <div className="space-y-2 pt-2 border-t border-border mt-4">
            <label className="text-sm font-medium flex items-center justify-between">
              Select Students
              <span className="text-xs text-muted-foreground">{selectedStudents.length} selected</span>
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                className="pl-9 h-9" 
                placeholder="Search students..." 
                value={studentSearchQuery} 
                onChange={(e) => setStudentSearchQuery(e.target.value)} 
              />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1 p-2 bg-muted/30 border border-border rounded-md mt-2">
              {filteredStudents.map(s => (
                <label key={s.id} className="flex items-center space-x-2 p-1 hover:bg-muted/50 rounded cursor-pointer">
                  <input type="checkbox" checked={selectedStudents.includes(s.id)} onChange={() => toggleStudent(s.id)} className="rounded border-border text-primary focus:ring-primary" />
                  <span className="text-sm">{s.name}</span>
                </label>
              ))}
              {filteredStudents.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No students match your search.</p>}
            </div>
          </div>

          <Button type="submit" disabled={!title || !subject || !topic || selectedStudents.length === 0 || ((evaluationType === "PERFORMANCE_BASED" || evaluationType === "HYBRID") && !maxScore)} className="w-full mt-4 bg-indigo-500 hover:bg-indigo-600">
            <Plus className="w-4 h-4 mr-2" /> Assign Project
          </Button>
        </form>
      </Modal>

      <Modal isOpen={!!editingActivity} onClose={() => setEditingActivity(null)} title="Edit Project">
        <form onSubmit={handleEdit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Project Name</label>
            <Input placeholder="e.g. Science Fair Model" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject</label>
            <Input placeholder="e.g. Physics" value={editSubject} onChange={e => setEditSubject(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Topic</label>
            <Input placeholder="e.g. Thermodynamics" value={editTopic} onChange={e => setEditTopic(e.target.value)} />
          </div>
          {(editingActivity?.evaluationType === "PERFORMANCE_BASED" || editingActivity?.evaluationType === "HYBRID") && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Score</label>
              <Input type="number" placeholder="e.g. 20" value={editMaxScore} onChange={e => setEditMaxScore(e.target.value)} />
            </div>
          )}
          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md border border-border">
            Note: Assigned students cannot be modified after creation.
          </div>
          <Button type="submit" disabled={isEditing || !editTitle || !editSubject || !editTopic || ((editingActivity?.evaluationType === "PERFORMANCE_BASED" || editingActivity?.evaluationType === "HYBRID") && !editMaxScore)} className="w-full bg-indigo-500 hover:bg-indigo-600">
            {isEditing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />} Save Changes
          </Button>
        </form>
      </Modal>
    </div>
  );
}
