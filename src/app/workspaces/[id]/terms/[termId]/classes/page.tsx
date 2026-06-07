"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, Plus, Loader2, Edit2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/modal";

type SchoolClass = {
  id: string;
  name: string;
  _count: {
    students: number;
  };
};

export default function ClassesPage() {
  const { id, termId } = useParams();

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [className, setClassName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchClasses = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes/${id}`);
      if (res.ok) setClasses(await res.json());
    } catch (error) {
      toast.error("Failed to load classes.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: className, workspaceId: id, termId }),
      });
      if (!res.ok) throw new Error();
      toast.success("Class created!");
      setClassName("");
      setIsModalOpen(false);
      fetchClasses();
    } catch (err) {
      toast.error("Failed to create class.");
    }
  };

  const handleDelete = async (classId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes/${classId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Class deleted!");
      fetchClasses();
    } catch (err) {
      toast.error("Failed to delete class.");
    }
  };

  return (
    <div className="flex flex-col p-8 max-w-6xl mx-auto w-full space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Classes</h1>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Create Class
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Classes</h2>
          <div className="space-y-3">
            {classes.map((c) => (
              <div key={c.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between hover:border-indigo-500/50 transition-colors shadow-sm">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{c.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {c._count.students} Students
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground"><Edit2 className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => handleDelete(c.id)}><Trash2 className="w-4 h-4" /></Button>
                  <div className="w-px h-6 bg-border mx-2" />
                  <Button
                    className="bg-indigo-500 hover:bg-indigo-600"
                    onClick={() => window.location.href = `/workspaces/${id}/terms/${termId}/classes/${c.id}`}
                  >
                    Manage &rarr;
                  </Button>
                </div>
              </div>
            ))}
            {classes.length === 0 && (
              <div className="text-center p-12 border-2 border-dashed border-border rounded-lg text-muted-foreground">
                <p>No classes created yet. Click "Create Class" to get started.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Class">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Class Name</label>
            <Input placeholder="e.g. 10th Grade Math" value={className} onChange={(e) => setClassName(e.target.value)} autoFocus />
          </div>
          <Button type="submit" disabled={!className.trim()} className="w-full bg-indigo-500 hover:bg-indigo-600">
            <Plus className="w-4 h-4 mr-2" /> Create Class
          </Button>
        </form>
      </Modal>
    </div>
  );
}
