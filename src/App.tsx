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

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-xl text-gray-600 dark:text-gray-400">Loading Luvoro Labs...</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme" attribute="class"> {/* Added attribute="class" */}
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-left" className="sonner-custom-offset" />
          <AnimatedBackground />
          <BrowserRouter>
            <AuthContext.Provider value={{ session, user, loading }}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<PublicLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="courses" element={<CourseCatalog />} />
                  <Route path="courses/ap-physics" element={<APPhysicsCourse />} />
                  <Route path="courses/ap-physics/lessons/:lessonId" element={<LessonPage />} />
                  <Route path="courses/:courseId/unit-test/:moduleId" element={<UnitTestingPage />} />
                  <Route path="courses/:courseId/unit-test/:moduleId/results/:sessionId" element={<UnitTestResultsPage />} />
                  <Route path="auth" element={!session ? <Auth /> : <Navigate to="/dashboard" />} />
                </Route>

                {/* Authenticated Routes */}
                <Route
                  path="/"
                  element={session ? <Layout /> : <Navigate to="/auth" replace />}
                >
                  {/* These routes are only accessible when logged in */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/lessons" element={<div>Lessons Page (Coming Soon!)</div>} />
                  <Route path="/achievements" element={<div>Achievements Page (Coming Soon!)</div>} />
                  <Route path="/settings" element={<div>Settings Page (Coming Soon!)</div>} />
                </Route>
                
                {/* Catch-all for 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthContext.Provider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;