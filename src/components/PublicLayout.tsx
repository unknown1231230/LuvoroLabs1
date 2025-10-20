"use client";

import React, { useContext } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, BookOpen, LogOut, LayoutDashboard } from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { showSuccess, showError } from '@/utils/toast';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileNav from './MobileNav';
import { ThemeToggle } from './ThemeToggle';

const PublicLayout = () => {
  const { session } = useContext(AuthContext);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        showError(error.message);
      } else {
        showSuccess("Logged out successfully!");
        navigate('/auth');
      }
    } catch (error: any)      {
        showError(error.message);
      }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full py-2">
        <div className="container flex items-center justify-between px-4 py-2
          bg-card rounded-2xl shadow-lg border border-border">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary flex-shrink-0">
            <img src="/logo.png" alt="Luvoro Labs Logo" className="h-7 w-7" />
            <span className="hidden sm:inline">Luvoro Labs</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            {isMobile ? (
              <MobileNav isAuthenticated={!!session} />
            ) : (
              <nav className="flex items-center space-x-2 sm:space-x-4">
                <Button variant="ghost" asChild className="text-foreground hover:text-primary">
                  <Link to="/">
                    <span>
                      <Home className="h-4 w-4 md:mr-2" />
                      <span className="hidden md:inline">Home</span>
                    </span>
                  </Link>
                </Button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" asChild className="text-foreground hover:text-primary">
                      <Link to="/courses">
                        <span>
                          <BookOpen className="h-4 w-4 md:mr-2" />
                          <span className="hidden md:inline">Courses</span>
                        </span>
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Courses</p>
                  </TooltipContent>
                </Tooltip>
                {session ? (
                  <>
                    <Button variant="ghost" asChild className="text-foreground hover:text-primary">
                      <Link to="/dashboard">
                        <span>
                          <LayoutDashboard className="h-4 w-4 md:mr-2" />
                          <span className="hidden md:inline">Dashboard</span>
                        </span>
                      </Link>
                    </Button>
                    <Button variant="ghost" onClick={handleLogout} className="text-foreground hover:text-primary">
                      <LogOut className="h-4 w-4 md:mr-2" />
                      <span className="hidden md:inline">Logout</span>
                    </Button>
                  </>
                ) : (
                  <Button asChild>
                    <Link to="/auth">
                      <span>
                        <span className="hidden md:inline">Login / Sign Up</span>
                        <span className="inline md:hidden">Login</span>
                      </span>
                    </Link>
                  </Button>
                )}
              </nav>
            )}
            <ThemeToggle />
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

export default PublicLayout;