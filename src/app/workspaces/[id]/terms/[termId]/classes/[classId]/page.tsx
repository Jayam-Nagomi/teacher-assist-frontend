"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, FileText, Target, ClipboardList, Calculator, Download, ArrowLeft } from "lucide-react";

// The sub-components that will be rendered based on the active tab
import StudentsTab from "./tabs/StudentsTab";
import HomeworkTab from "./tabs/HomeworkTab";
import TestsTab from "./tabs/TestsTab";
import ProjectsTab from "./tabs/ProjectsTab";
import GradingTab from "./tabs/GradingTab";

export default function ClassDetailsPage() {
  const { id: workspaceId, termId, classId } = useParams();
  const [activeTab, setActiveTab] = useState("students");

  const tabs = [
    { id: "students", label: "Students", icon: <Users className="w-4 h-4 mr-2" /> },
    { id: "homework", label: "Homework", icon: <FileText className="w-4 h-4 mr-2" /> },
    { id: "tests", label: "Tests", icon: <Target className="w-4 h-4 mr-2" /> },
    { id: "projects", label: "Projects", icon: <ClipboardList className="w-4 h-4 mr-2" /> },
    { id: "grading", label: "Grading Engine", icon: <Calculator className="w-4 h-4 mr-2" /> },
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      
      {/* Header */}
      <div className="flex-none px-8 py-6 border-b border-border bg-card">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => window.location.href = `/workspaces/${workspaceId}/terms/${termId}/classes`}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Class Manager</h1>
          
          <div className="ml-auto">
            <Button variant="outline" onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/grades/export/${classId}/${termId}`, '_blank')}>
              <Download className="w-4 h-4 mr-2" /> Export Grades CSV
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-t-lg font-medium text-sm transition-colors border-b-2 ${
                activeTab === tab.id 
                  ? "border-primary text-primary bg-primary/5" 
                  : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-8 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          {activeTab === "students" && <StudentsTab classId={String(classId)} />}
          {activeTab === "homework" && <HomeworkTab classId={String(classId)} termId={String(termId)} />}
          {activeTab === "tests" && <TestsTab classId={String(classId)} termId={String(termId)} />}
          {activeTab === "projects" && <ProjectsTab classId={String(classId)} termId={String(termId)} />}
          {activeTab === "grading" && <GradingTab classId={String(classId)} termId={String(termId)} />}
        </div>
      </div>
      
    </div>
  );
}
