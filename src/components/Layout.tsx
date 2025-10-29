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
    <div className="min-h-screen flex flex-col bg-background text-foreground safe-area-inset-top safe-area-inset-bottom">
      <header className="sticky top-0 z-40 w-full py-2">
        <div className="container flex items-center justify-between px-4 py-2
          bg-card rounded-2xl shadow-lg border border-border">
          {/* ... existing header content ... */}
        </div>
      </header>
      <main className="flex-grow container py-8">
        <Outlet />
      </main>
      <footer className="border-t bg-card py-4">
        {/* ... existing footer content ... */}
      </footer>
    </div>
  );
};

export default Layout;