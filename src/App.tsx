"use client";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
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
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import { AnimatePresence, motion } from "framer-motion";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

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
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 10, stiffness: 100 }}
          className="text-xl"
        >
          Loading Luvoro Labs...
        </motion.div>
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
          <div className="animated-gradient" />
          <BrowserRouter>
            <AuthContext.Provider value={{ session, user, loading }}>
              <div className="min-h-screen flex flex-col bg-background text-foreground safe-area-inset-top safe-area-inset-bottom">
                <AnimatePresence mode="wait">
                  <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<PublicLayout />}>
                      <Route index element={
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.4 }}
                        >
                          {session ? <Navigate to="/profile" replace /> : <HomePage />}
                        </motion.div>
                      } />
                      <Route path="courses" element={
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.4 }}
                        >
                          <CourseCatalog />
                        </motion.div>
                      } />
                      <Route path="courses/ap-physics" element={
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.4 }}
                        >
                          <APPhysicsCourse />
                        </motion.div>
                      } />
                      <Route path="courses/ap-physics/lessons/:lessonId" element={
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.4 }}
                        >
                          <LessonPage />
                        </motion.div>
                      } />
                      <Route path="courses/:courseId/unit-test/:moduleId" element={
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.4 }}
                        >
                          <UnitTestingPage />
                        </motion.div>
                      } />
                      <Route path="courses/:courseId/unit-test/:moduleId/results/:sessionId" element={
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.4 }}
                        >
                          <UnitTestResultsPage />
                        </motion.div>
                      } />
                      <Route path="auth" element={
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.4 }}
                        >
                          {session ? <Navigate to="/profile" replace /> : <Auth />}
                        </motion.div>
                      } />
                      <Route path="profile" element={
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.4 }}
                        >
                          {session ? <Profile /> : <Navigate to="/auth" replace />}
                        </motion.div>
                      } />
                      <Route path="settings" element={
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.4 }}
                        >
                          {session ? <Settings /> : <Navigate to="/auth" replace />}
                        </motion.div>
                      } />
                      <Route path="*" element={
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.4 }}
                        >
                          <NotFound />
                        </motion.div>
                      } />
                    </Route>
                  </Routes>
                </AnimatePresence>
              </div>
            </AuthContext.Provider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;