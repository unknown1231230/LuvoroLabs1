"use client";

import React, { useContext } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, BookOpen, LogOut, LayoutDashboard } from 'lucide-react';
import { AuthContext } from '@/context/AuthContext'; // Updated import
import { supabase } from '@/lib/supabase';
import { showSuccess, showError } from '@/utils/toast';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileNav from './MobileNav';

const PublicLayout = () => {
  const { session } = useContext(AuthContext);
  const navigate = useNavigate();
  const isMobile = useIsMobile(); // Now true for screens < 640px

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
          bg-white/10 rounded-2xl shadow-lg backdrop-blur-md border border-white/20">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary flex-shrink-0">
            <img src="/logo.png" alt="Luvoro Labs Logo" className="h-7 w-7" />
            <span className="hidden sm:inline">Luvoro Labs</span>
          </Link>
          {isMobile ? ( // If screen < 640px, show MobileNav
            <MobileNav isAuthenticated={!!session} />
          ) : ( // If screen >= 640px, show desktop nav
            <nav className="flex items-center space-x-2 sm:space-x-4"> {/* Adjusted space-x for smaller screens */}
              <Button variant="ghost" asChild>
                <Link to="/">
                  <Home className="h-4 w-4 md:mr-2" /> {/* md:mr-2 adds margin only on md and up */}
                  <span className="hidden md:inline">Home</span> {/* Hidden on sm, visible on md and up */}
                </Link>
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" asChild>
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
              {session ? (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/dashboard">
                      <LayoutDashboard className="h-4 w-4 md:mr-2" />
                      <span className="hidden md:inline">Dashboard</span>
                    </Link>
                  </Button>
                  <Button variant="ghost" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Logout</span>
                  </Button>
                </>
              ) : (
                <Button asChild>
                  <Link to="/auth">
                    <span className="hidden md:inline">Login / Sign Up</span>
                    <span className="inline md:hidden">Login</span> {/* Show "Login" text on small screens if not icon-only */}
                  </Link>
                </Button>
              )}
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

export default PublicLayout;