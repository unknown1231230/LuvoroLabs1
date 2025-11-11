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
import MobileFooterNav from './MobileFooterNav';
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
    } catch (error: any) {
      showError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {isMobile ? null : (
        <header className="sticky top-0 z-40 w-full py-2 header-container">
          <div className="container flex items-center justify-between px-4 py-2 glass">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary flex-shrink-0 enhanced-button">
              <img src="/logo.png" alt="Luvoro Labs Logo" className="h-8 w-8" />
              <span className="hidden sm:inline text-gradient">Luvoro Labs</span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              {isMobile ? (
                <MobileNav isAuthenticated={!!session} />
              ) : (
                <nav className="flex items-center space-x-2 sm:space-x-4">
                  {session ? (
                    <>
                      <Button variant="ghost" asChild className="text-foreground hover:text-primary enhanced-button btn-secondary-hover-fix">
                        <Link to="/profile">
                          <span className="flex items-center">
                            <LayoutDashboard className="h-4 w-4 md:mr-2" />
                            <span className="hidden md:inline">Profile</span>
                          </span>
                        </Link>
                      </Button>
                      <Button variant="ghost" asChild className="text-foreground hover:text-primary enhanced-button btn-secondary-hover-fix">
                        <Link to="/courses">
                          <span className="flex items-center">
                            <BookOpen className="h-4 w-4 md:mr-2" />
                            <span className="hidden md:inline">Courses</span>
                          </span>
                        </Link>
                      </Button>
                      <Button variant="ghost" onClick={handleLogout} className="text-foreground hover:text-primary enhanced-button btn-secondary-hover-fix">
                        <LogOut className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">Logout</span>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" asChild className="text-foreground hover:text-primary enhanced-button btn-secondary-hover-fix">
                        <Link to="/">
                          <span className="flex items-center">
                            <Home className="h-4 w-4 md:mr-2" />
                            <span className="hidden md:inline">Home</span>
                          </span>
                        </Link>
                      </Button>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" asChild className="text-foreground hover:text-primary enhanced-button btn-secondary-hover-fix">
                            <Link to="/courses">
                              <span className="flex items-center">
                                <BookOpen className="h-4 w-4 md:mr-2" />
                                <span className="hidden md:inline">Courses</span>
                              </span>
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Explore Courses</p>
                        </TooltipContent>
                      </Tooltip>
                      <Button asChild className="enhanced-button glow btn-hover-fix">
                        <Link to="/auth">
                          <span className="flex items-center">
                            <span className="hidden md:inline">Login / Sign Up</span>
                            <span className="inline md:hidden">Login</span>
                          </span>
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
      <main className={`flex-grow container py-8 ${isMobile ? 'pb-20' : ''}`}>
        <Outlet />
      </main>
      {isMobile && <MobileFooterNav />}
    </div>
  );
};

export default PublicLayout;