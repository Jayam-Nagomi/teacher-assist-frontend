"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun, GraduationCap, Mail, Lock, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function Home() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect straight to workspaces
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/workspaces");
    }
  }, [router]);

  const handleAuth = async (e: React.FormEvent, type: "login" | "signup") => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || `Failed to ${type}`);
      }

      localStorage.setItem("token", data.token);
      toast.success(type === "login" ? "Welcome back!" : "Account created successfully!");
      router.push("/workspaces");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="absolute top-4 right-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full shadow-sm"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="p-4 bg-indigo-500 text-white rounded-2xl shadow-xl shadow-indigo-500/20">
          <GraduationCap className="w-10 h-10" />
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-foreground">
          Teacher Assist
        </h1>
      </div>

      <p className="text-muted-foreground text-xl max-w-lg text-center leading-relaxed">
        A stress-free, beautifully designed grading workspace for your academic years and terms.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4 mt-12 w-full max-w-md">
        <Button size="lg" className="w-full text-lg h-14 bg-indigo-500 hover:bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-1" onClick={() => { setIsLoginOpen(true); setEmail(""); setPassword(""); }}>
          Log In
        </Button>
        <Button size="lg" variant="outline" className="w-full text-lg h-14 rounded-xl border-border hover:bg-muted/50 transition-all" onClick={() => { setIsSignupOpen(true); setEmail(""); setPassword(""); }}>
          Sign Up
        </Button>
      </div>

      <Modal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} title="Welcome Back">
        <form onSubmit={(e) => handleAuth(e, "login")} className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input type="email" placeholder="teacher@school.edu" className="pl-10" value={email} onChange={e => setEmail(e.target.value)} autoFocus />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input type="password" placeholder="••••••••" className="pl-10" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </div>
          <Button type="submit" disabled={!email || !password || isLoading} className="w-full bg-indigo-500 hover:bg-indigo-600 h-12 text-md mt-4">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Log In"}
          </Button>
        </form>
      </Modal>

      <Modal isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)} title="Create your Account">
        <form onSubmit={(e) => handleAuth(e, "signup")} className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input type="email" placeholder="teacher@school.edu" className="pl-10" value={email} onChange={e => setEmail(e.target.value)} autoFocus />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input type="password" placeholder="Choose a secure password" className="pl-10" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </div>
          <Button type="submit" disabled={!email || !password || isLoading} className="w-full bg-indigo-500 hover:bg-indigo-600 h-12 text-md mt-4">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up"}
          </Button>
        </form>
      </Modal>
    </main>
  );
}
