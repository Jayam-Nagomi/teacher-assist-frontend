"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash, Loader2, Plus, Edit2, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/modal";

export default function TestsTab({ classId, termId }: { classId: string, termId: string }) {
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [maxScore, setMaxScore] = useState("");

  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editTopic, setEditTopic] = useState("");
  const [editMaxScore, setEditMaxScore] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const fetchActivities = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activities?classId=${classId}&termId=${termId}&type=TEST`);
      if (res.ok) setActivities(await res.json());
    } catch (err) {
      toast.error("Failed to fetch tests");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [classId, termId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim() || !topic.trim() || !maxScore) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title, subject, topic, classId, termId, 
          activityType: "TEST", 
          evaluationType: "PERFORMANCE_BASED",
          maxScore
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Test scheduled for class!");
      setTitle(""); setSubject(""); setTopic(""); setMaxScore("");
      setIsCreateModalOpen(false);
      fetchActivities();
    } catch (err) {
      toast.error("Failed to schedule test.");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !editSubject.trim() || !editTopic.trim() || !editMaxScore) return;

    setIsEditing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activities/${editingActivity.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: editTitle, 
          subject: editSubject, 
          topic: editTopic,
          maxScore: editMaxScore
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Test updated!");
      setEditingActivity(null);
      fetchActivities();
    } catch (err) {
      toast.error("Failed to update test.");
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activities/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setActivities(activities.filter(a => a.id !== id));
      toast.success("Test deleted");
    } catch (err) {
      toast.error("Failed to delete test");
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Scheduled Tests</h2>
        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-indigo-500 hover:bg-indigo-600">
          <FileText className="w-4 h-4 mr-2" /> Schedule Test
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Scheduled Tests</CardTitle>
          <div className="text-sm font-medium px-3 py-1 bg-primary/10 text-primary rounded-full">
            {activities.length} Tests
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : activities.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground border border-dashed border-border rounded-lg">
              No tests scheduled yet. Click "Schedule Test" to create one.
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
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Out Of</p>
                      <p className="font-bold text-lg">{a.maxScore}</p>
                    </div>
                    <div className="flex items-center space-x-1 border-l border-border pl-4">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-foreground" 
                        onClick={() => {
                          setEditingActivity(a);
                          setEditTitle(a.title);
                          setEditSubject(a.subject);
                          setEditTopic(a.topic);
                          setEditMaxScore(String(a.maxScore));
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => handleDelete(a.id)}>
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Schedule Test">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input placeholder="e.g. Midterm 1" value={title} onChange={e => setTitle(e.target.value)} />
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
            <label className="text-sm font-medium">Max Score</label>
            <Input type="number" placeholder="e.g. 50" value={maxScore} onChange={e => setMaxScore(e.target.value)} />
          </div>
          <Button type="submit" disabled={!title || !subject || !topic || !maxScore} className="w-full bg-indigo-500 hover:bg-indigo-600">
            <Plus className="w-4 h-4 mr-2" /> Schedule Test
          </Button>
        </form>
      </Modal>

      <Modal isOpen={!!editingActivity} onClose={() => setEditingActivity(null)} title="Edit Test">
        <form onSubmit={handleEdit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input placeholder="e.g. Midterm 1" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject</label>
            <Input placeholder="e.g. Math" value={editSubject} onChange={e => setEditSubject(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Topic</label>
            <Input placeholder="e.g. Algebra" value={editTopic} onChange={e => setEditTopic(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Max Score</label>
            <Input type="number" placeholder="e.g. 50" value={editMaxScore} onChange={e => setEditMaxScore(e.target.value)} />
          </div>
          <Button type="submit" disabled={isEditing || !editTitle || !editSubject || !editTopic || !editMaxScore} className="w-full bg-indigo-500 hover:bg-indigo-600">
            {isEditing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />} Save Changes
          </Button>
        </form>
      </Modal>
    </div>
  );
}
