"use client";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Layout from "./components/Layout";
import PublicLayout from "./components/PublicLayout";
import CourseCatalog from "./pages/CourseCatalog";
import APPhysicsCourse from "./pages/APPhysicsCourse";
import LessonPage from "./pages/LessonPage";
import { useEffect, useState, createContext } from "react"; // Import createContext
import { supabase } from "./lib/supabase";
import { Session, User } from "@supabase/supabase-js";

// Create AuthContext
interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
}
export const AuthContext = createContext<AuthContextType>({ session: null, user: null, loading: true });

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null); // New state for user
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null); // Set user
      setLoading(false);
      console.log("Initial session:", session); // Debug log
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null); // Set user on auth state change
      setLoading(false);
      console.log("Auth state changed:", _event, session); // Debug log
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
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthContext.Provider value={{ session, user, loading }}> {/* Provide context */}
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<Index />} />
                <Route path="courses" element={<CourseCatalog />} />
                <Route path="courses/ap-physics" element={<APPhysicsCourse />} />
                <Route path="courses/ap-physics/lessons/:lessonId" element={<LessonPage />} />
                <Route path="auth" element={!session ? <Auth /> : <Navigate to="/" />} />
              </Route>

              {/* Authenticated Routes */}
              <Route
                path="/"
                element={session ? <Layout /> : <Navigate to="/auth" replace />}
              >
                {/* These routes are only accessible when logged in */}
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
    </QueryClientProvider>
  );
};

export default App;