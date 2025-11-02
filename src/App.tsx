"use client";

import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Auth from "./pages/Auth";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { AuthContext } from "./context/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
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
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <img 
          src="/logo.png" 
          alt="Luvoro Labs Logo" 
          className="h-16 w-16 animate-spin mb-4" 
        />
        <p className="text-xl">Loading Luvoro Labs...</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme" attribute="class">
        <Toaster />
        <BrowserRouter>
          <AuthContext.Provider value={{ session, user, loading }}>
            <Routes>
              <Route path="/" element={session ? <Navigate to="/profile" replace /> : <HomePage />} />
              <Route path="auth" element={session ? <Navigate to="/" replace /> : <Auth />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthContext.Provider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;