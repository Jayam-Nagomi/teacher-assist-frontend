"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash, Loader2, UserPlus, FileSpreadsheet, Edit2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";

type Student = { id: string; name: string };

export default function StudentsTab({ classId }: { classId: string }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [bulkNames, setBulkNames] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editName, setEditName] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/${classId}`);
      if (res.ok) setStudents(await res.json());
    } catch (err) {
      toast.error("Failed to fetch students");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [classId]);

  const handleBulkImport = async () => {
    if (!bulkNames.trim()) return;
    
    setIsImporting(true);
    const namesArray = bulkNames.split("\n").filter(n => n.trim() !== "");
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, names: namesArray }),
      });
      
      if (!res.ok) throw new Error();
      
      const data = await res.json();
      toast.success(data.message);
      setBulkNames("");
      setIsImportModalOpen(false);
      fetchStudents(); // Refresh list
    } catch (err) {
      toast.error("Failed to import students.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !editName.trim()) return;

    setIsEditing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/${editingStudent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (!res.ok) throw new Error();
      toast.success("Student updated successfully!");
      setEditingStudent(null);
      fetchStudents();
    } catch (err) {
      toast.error("Failed to update student.");
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setStudents(students.filter(s => s.id !== id));
      toast.success("Student deleted");
    } catch (err) {
      toast.error("Failed to delete student");
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Class Roster</h2>
        <Button onClick={() => setIsImportModalOpen(true)} className="bg-indigo-500 hover:bg-indigo-600">
          <FileSpreadsheet className="w-4 h-4 mr-2" /> Bulk Import
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Students List</CardTitle>
          <div className="text-sm font-medium px-3 py-1 bg-primary/10 text-primary rounded-full">
            {students.length} Students
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : students.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground border border-dashed border-border rounded-lg">
              No students found. Use the bulk importer to add them.
            </div>
          ) : (
            <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
              {students.map((student, idx) => (
                <div key={student.id} className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center space-x-4">
                    <span className="text-muted-foreground text-sm w-4">{idx + 1}.</span>
                    <span className="font-medium">{student.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-foreground" 
                      onClick={() => {
                        setEditingStudent(student);
                        setEditName(student.name);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => handleDelete(student.id)}>
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Bulk Import Students">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Paste a list of student names (one per line) below to instantly import them into the class.
          </p>
          <textarea 
            className="w-full h-48 p-3 bg-muted/30 border border-border rounded-md text-sm font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
            placeholder={`Alice Johnson\nBob Smith\nCharlie Brown`}
            value={bulkNames}
            onChange={(e) => setBulkNames(e.target.value)}
          />
          <Button onClick={handleBulkImport} disabled={isImporting || !bulkNames.trim()} className="w-full bg-indigo-500 hover:bg-indigo-600">
            {isImporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
            Import Students
          </Button>
        </div>
      </Modal>

      <Modal isOpen={!!editingStudent} onClose={() => setEditingStudent(null)} title="Edit Student">
        <form onSubmit={handleEditStudent} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Student Name</label>
            <Input 
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="e.g. Alice Johnson"
              autoFocus
            />
          </div>
          <Button type="submit" disabled={isEditing || !editName.trim()} className="w-full bg-indigo-500 hover:bg-indigo-600">
            {isEditing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </form>
      </Modal>
    </div>
  );
}
