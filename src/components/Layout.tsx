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
import MobileFooterNav from './MobileFooterNav';
import { AuthContext } from '@/context/AuthContext';
import { ThemeToggle } from './ThemeToggle';

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
      {isMobile ? null : (
        <header className="sticky top-0 z-40 w-full py-2 header-container">
          <div className="container flex items-center justify-between px-4 py-2 glass">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary flex-shrink-0">
              <img src="/logo.png" alt="Luvoro Labs Logo" className="h-7 w-7" />
              <span className="hidden sm:inline">Luvoro Labs</span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              {isMobile ? (
                <MobileNav isAuthenticated={!!session} />
              ) : (
                <nav className="flex items-center space-x-2 sm:space-x-4">
                  {session ? (
                    <>
                      <Button variant="ghost" asChild className="text-foreground hover:text-primary">
                        <Link to="/profile">
                          <span className="flex items-center">
                            <LayoutDashboard className="h-4 w-4 md:mr-2" />
                            <span className="hidden md:inline">Profile</span>
                          </span>
                        </Link>
                      </Button>
                      <Button variant="ghost" asChild className="text-foreground hover:text-primary">
                        <Link to="/courses">
                          <span className="flex items-center">
                            <BookOpen className="h-4 w-4 md:mr-2" />
                            <span className="hidden md:inline">Courses</span>
                          </span>
                        </Link>
                      </Button>
                      <Button variant="ghost" asChild className="text-foreground hover:text-primary">
                        <Link to="/settings">
                          <span className="flex items-center">
                            <Settings className="mr-2 h-4 w-4" />Settings
                          </span>
                        </Link>
                      </Button>
                      <Button variant="ghost" onClick={handleLogout} className="justify-start text-destructive hover:text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" asChild className="text-foreground hover:text-primary">
                        <Link to="/">
                          <span className="flex items-center">
                            <Home className="h-4 w-4 md:mr-2" />
                            <span className="hidden md:inline">Home</span>
                          </span>
                        </Link>
                      </Button>
                      <Button variant="ghost" asChild className="text-foreground hover:text-primary">
                        <Link to="/courses">
                          <span className="flex items-center">
                            <BookOpen className="h-4 w-4 md:mr-2" />
                            <span className="hidden md:inline">Courses</span>
                          </span>
                        </Link>
                      </Button>
                      <Button asChild className="justify-start">
                        <Link to="/auth">
                          <span>Login / Sign Up</span>
                        </Link>
                      </Button>
                    </>
                  )}
                </nav>
              )}
              <ThemeToggle />
            </div>
          </div>
        </header>
      )}
      <main className="flex-grow container py-8">
        <Outlet />
        <div className="h-[64px] pb-[env(safe-area-inset-bottom)]" aria-hidden="true" />
      </main>
      {isMobile && <MobileFooterNav />}
    </div>
  );
};

export default Layout;