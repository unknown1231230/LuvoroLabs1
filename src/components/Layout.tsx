"use client";

import React, { useContext } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { showSuccess, showError } from '@/utils/toast';
import { Home, BookOpen, Award, Settings, LogOut, LayoutDashboard } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileNav from './MobileNav';
import { AuthContext } from '@/App';

const Layout = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { session } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        showError(error.message);
      } else {
        showSuccess("Logged out successfully!");
        navigate('/auth');
      }
    } catch (error: any) {
      showError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full py-2">
        <div className="container flex items-center justify-between px-4 py-2
          bg-white/10 rounded-2xl shadow-lg backdrop-blur-md border border-white/20">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary flex-shrink-0">
            <img src="/logo.png" alt="Luvoro Labs Logo" className="h-7 w-7" />
            <span className="hidden sm:inline">Luvoro Labs</span>
          </Link>
          {isMobile ? (
            <MobileNav isAuthenticated={!!session} />
          ) : (
            <nav className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link to="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</Link>
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" asChild>
                    <Link to="/courses"><BookOpen className="h-4 w-4" /></Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Courses</p>
                </TooltipContent>
              </Tooltip>
              <Button variant="ghost" asChild>
                <Link to="/achievements"><Award className="mr-2 h-4 w-4" />Achievements</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/settings"><Settings className="mr-2 h-4 w-4" />Settings</Link>
              </Button>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />Logout
              </Button>
            </nav>
          )}
        </div>
      </header>
      <main className="flex-grow container py-8">
        <Outlet />
      </main>
      <footer className="border-t bg-card py-4">
        {/* MadeWithDyad component removed */}
      </footer>
    </div>
  );
};

export default Layout;