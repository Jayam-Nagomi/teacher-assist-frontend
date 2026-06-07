"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Sun, Moon, Laptop } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col flex-1 p-8 max-w-4xl mx-auto w-full space-y-8">
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-primary/10 text-primary rounded-lg">
          <Settings className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Workspace Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Customize the look and feel of the application.
          </p>
          <div className="flex gap-4">
            <Button 
              variant={theme === "light" ? "default" : "outline"} 
              onClick={() => setTheme("light")}
            >
              <Sun className="w-4 h-4 mr-2" /> Light
            </Button>
            <Button 
              variant={theme === "dark" ? "default" : "outline"} 
              onClick={() => setTheme("dark")}
            >
              <Moon className="w-4 h-4 mr-2" /> Dark
            </Button>
            <Button 
              variant={theme === "system" ? "default" : "outline"} 
              onClick={() => setTheme("system")}
            >
              <Laptop className="w-4 h-4 mr-2" /> System
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Workspace Defaults</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Global grading defaults will be configured here in a future update.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
