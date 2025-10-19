"use client";

import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { showSuccess, showError } from '@/utils/toast';
import { Home, BookOpen, Award, Settings, LogOut } from 'lucide-react';

const Layout = () => {
  const navigate = useNavigate();

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
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md border-border/60 shadow-sm">
        <div className="container flex h-16 items-center justify-between py-4">
          <Link to="/" className="text-2xl font-bold text-primary">Luvoro Labs</Link>
          <nav className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/"><Home className="mr-2 h-4 w-4" />Dashboard</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/courses"><BookOpen className="mr-2 h-4 w-4" />Courses</Link>
            </Button>
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