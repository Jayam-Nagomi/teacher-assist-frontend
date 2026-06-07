"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash, Loader2, Plus, Edit2, BookOpen } from "lucide-react";
import toast from "react-hot-toast";
import { CustomSelect } from "@/components/ui/custom-select";
import { Modal } from "@/components/ui/modal";

export default function HomeworkTab({ classId, termId }: { classId: string, termId: string }) {
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [evaluationType, setEvaluationType] = useState("COMPLETION_BASED");
  const [maxScore, setMaxScore] = useState("");

  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editTopic, setEditTopic] = useState("");
  const [editMaxScore, setEditMaxScore] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const fetchActivities = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activities?classId=${classId}&termId=${termId}&type=TASK`);
      if (res.ok) setActivities(await res.json());
    } catch (err) {
      toast.error("Failed to fetch homework");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [classId, termId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim() || !topic.trim()) return;
    if ((evaluationType === "PERFORMANCE_BASED" || evaluationType === "HYBRID") && !maxScore) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title, subject, topic, classId, termId, 
          activityType: "TASK", 
          evaluationType,
          maxScore: (evaluationType === "PERFORMANCE_BASED" || evaluationType === "HYBRID") ? maxScore : null
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Homework assigned to class!");
      setTitle(""); setSubject(""); setTopic(""); setMaxScore(""); setEvaluationType("COMPLETION_BASED");
      setIsCreateModalOpen(false);
      fetchActivities();
    } catch (err) {
      toast.error("Failed to create homework.");
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
      toast.success("Homework updated!");
      setEditingActivity(null);
      fetchActivities();
    } catch (err) {
      toast.error("Failed to update homework.");
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activities/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setActivities(activities.filter(a => a.id !== id));
      toast.success("Homework deleted");
    } catch (err) {
      toast.error("Failed to delete homework");
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Homework Assignments</h2>
        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-indigo-500 hover:bg-indigo-600">
          <BookOpen className="w-4 h-4 mr-2" /> Assign Homework
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Assigned Homework</CardTitle>
          <div className="text-sm font-medium px-3 py-1 bg-primary/10 text-primary rounded-full">
            {activities.length} Assignments
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : activities.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground border border-dashed border-border rounded-lg">
              No homework assigned yet. Click "Assign Homework" to create one.
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map(a => (
                <div key={a.id} className="p-4 border border-border rounded-lg flex justify-between items-start bg-card shadow-sm hover:border-primary/50 transition-colors">
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Assign Homework">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input placeholder="e.g. Chapter 4 Exercises" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject</label>
            <Input placeholder="e.g. Math" value={subject} onChange={e => setSubject(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Topic</label>
            <Input placeholder="e.g. Algebra" value={topic} onChange={e => setTopic(e.target.value)} />
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
              <Input type="number" placeholder="e.g. 10" value={maxScore} onChange={e => setMaxScore(e.target.value)} />
            </div>
          )}
          <Button type="submit" disabled={!title || !subject || !topic || ((evaluationType === "PERFORMANCE_BASED" || evaluationType === "HYBRID") && !maxScore)} className="w-full bg-indigo-500 hover:bg-indigo-600">
            <Plus className="w-4 h-4 mr-2" /> Assign to Class
          </Button>
        </form>
      </Modal>

      <Modal isOpen={!!editingActivity} onClose={() => setEditingActivity(null)} title="Edit Homework">
        <form onSubmit={handleEdit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input placeholder="e.g. Chapter 4 Exercises" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject</label>
            <Input placeholder="e.g. Math" value={editSubject} onChange={e => setEditSubject(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Topic</label>
            <Input placeholder="e.g. Algebra" value={editTopic} onChange={e => setEditTopic(e.target.value)} />
          </div>
          {(editingActivity?.evaluationType === "PERFORMANCE_BASED" || editingActivity?.evaluationType === "HYBRID") && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Score</label>
              <Input type="number" placeholder="e.g. 10" value={editMaxScore} onChange={e => setEditMaxScore(e.target.value)} />
            </div>
          )}
          <Button type="submit" disabled={isEditing || !editTitle || !editSubject || !editTopic || ((editingActivity?.evaluationType === "PERFORMANCE_BASED" || editingActivity?.evaluationType === "HYBRID") && !editMaxScore)} className="w-full bg-indigo-500 hover:bg-indigo-600">
            {isEditing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />} Save Changes
          </Button>
        </form>
      </Modal>
    </div>
  );
}
