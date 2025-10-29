"use client";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Layout from "./components/Layout";
import PublicLayout from "./components/PublicLayout";
import CourseCatalog from "./pages/CourseCatalog";
import APPhysicsCourse from "./pages/APPhysicsCourse";
import LessonPage from "./pages/LessonPage";
import UnitTestingPage from "./pages/UnitTestingPage";
import UnitTestResultsPage from "./pages/UnitTestResultsPage";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { AuthContext } from "./context/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import AnimatedBackground from "./components/AnimatedBackground";
import { incrementSiteMetric } from "./utils/supabaseUtils";
import type { Session, User } from "@supabase/supabase-js";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    incrementSiteMetric('site_views');

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
      console.log("Initial session:", session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
      console.log("Auth state changed:", _event, session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p className="text-xl">Loading Luvoro Labs...</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme" attribute="class">
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-left" className="sonner-custom-offset" />
          <AnimatedBackground />
          <BrowserRouter>
            <AuthContext.Provider value={{ session, user, loading }}>
              <div className="min-h-screen flex flex-col bg-background text-foreground safe-area-inset-top safe-area-inset-bottom">
                <Routes>
                  <Route path="/" element={<PublicLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="courses" element={<CourseCatalog />} />
                    <Route path="courses/ap-physics" element={<APPhysicsCourse />} />
                    <Route path="courses/ap-physics/lessons/:lessonId" element={<LessonPage />} />
                    <Route path="courses/:courseId/unit-test/:moduleId" element={<UnitTestingPage />} />
                    <Route path="courses/:courseId/unit-test/:moduleId/results/:sessionId" element={<UnitTestResultsPage />} />
                    <Route path="auth" element={<Auth />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </div>
            </AuthContext.Provider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;