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
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <div className="relative w-32 h-32 mb-8">
          {/* Earth in the center */}
          <div className="absolute inset-0 w-24 h-24 mx-auto my-auto rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 shadow-2xl">
            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-blue-300 to-transparent opacity-30"></div>
            <div className="absolute top-4 left-6 w-4 h-3 bg-green-500 rounded-full opacity-70"></div>
            <div className="absolute top-8 right-5 w-3 h-2 bg-green-600 rounded-full opacity-60"></div>
            <div className="absolute bottom-6 left-8 w-2 h-2 bg-green-500 rounded-full opacity-50"></div>
          </div>
          
          {/* Rocket orbiting around Earth */}
          <div 
            className="absolute inset-0 w-8 h-8"
            style={{
              animation: 'orbit 3s linear infinite',
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <div 
                className="text-primary"
                style={{
                  animation: 'counter-rotate 3s linear infinite',
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L14.09 8.26L21 9L16 14L17.45 21L12 17.77L6.55 21L8 14L3 9L9.91 8.26L12 2Z" fill="currentColor"/>
                </svg>
              </div>
            </div>
          </div>
          
          {/* Orbit path */}
          <div className="absolute inset-0 w-32 h-32 mx-auto my-auto rounded-full border-2 border-dashed border-gray-300 opacity-20"></div>
        </div>
        
        <p className="text-xl font-medium text-primary mb-2">Launching Luvoro Labs...</p>
        <p className="text-sm text-muted-foreground">Preparing your learning journey</p>
        
        <style>{`
          @keyframes orbit {
            from {
              transform: rotate(0deg) translateX(60px) rotate(0deg);
            }
            to {
              transform: rotate(360deg) translateX(60px) rotate(-360deg);
            }
          }
          
          @keyframes counter-rotate {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(-360deg);
            }
          }
        `}</style>
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
                    <Route index element={session ? <Navigate to="/profile" replace /> : <HomePage />} />
                    <Route path="courses" element={<CourseCatalog />} />
                    <Route path="courses/ap-physics" element={<APPhysicsCourse />} />
                    <Route path="courses/ap-physics/lessons/:lessonId" element={<LessonPage />} />
                    <Route path="courses/:courseId/unit-test/:moduleId" element={<UnitTestingPage />} />
                    <Route path="courses/:courseId/unit-test/:moduleId/results/:sessionId" element={<UnitTestResultsPage />} />
                    <Route path="auth" element={session ? <Navigate to="/profile" replace /> : <Auth />} />
                    <Route path="profile" element={session ? <Profile /> : <Navigate to="/auth" replace />} />
                    <Route path="settings" element={session ? <Settings /> : <Navigate to="/auth" replace />} />
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