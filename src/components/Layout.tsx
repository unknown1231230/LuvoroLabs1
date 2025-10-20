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
import { AuthContext } from '@/context/AuthContext';
import { ThemeToggle } from './ThemeToggle'; // New: Import ThemeToggle

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
          bg-card rounded-2xl shadow-lg border border-border"> {/* Updated header styling */}
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary flex-shrink-0">
            <img src="/logo.png" alt="Luvoro Labs Logo" className="h-7 w-7" />
            <span className="hidden sm:inline">Luvoro Labs</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4"> {/* Wrap nav and toggle */}
            {isMobile ? (
              <MobileNav isAuthenticated={!!session} />
            ) : (
              <nav className="flex items-center space-x-2 sm:space-x-4">
                <Button variant="ghost" asChild className="text-foreground hover:text-primary"> {/* Adjusted text color */}
                  <Link to="/dashboard">
                    <LayoutDashboard className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Dashboard</span>
                  </Link>
                </Button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" asChild className="text-foreground hover:text-primary"> {/* Adjusted text color */}
                      <Link to="/courses">
                        <BookOpen className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">Courses</span>
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Courses</p>
                  </TooltipContent>
                </Tooltip>
                <Button variant="ghost" asChild className="text-foreground hover:text-primary"> {/* Adjusted text color */}
                  <Link to="/achievements">
                    <Award className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Achievements</span>
                  </Link>
                </Button>
                <Button variant="ghost" asChild className="text-foreground hover:text-primary"> {/* Adjusted text color */}
                  <Link to="/settings">
                    <Settings className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Settings</span>
                  </Link>
                </Button>
                <Button variant="ghost" onClick={handleLogout} className="text-foreground hover:text-primary"> {/* Adjusted text color */}
                  <LogOut className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Logout</span>
                </Button>
              </nav>
            )}
            <ThemeToggle /> {/* New: ThemeToggle */}
          </div>
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