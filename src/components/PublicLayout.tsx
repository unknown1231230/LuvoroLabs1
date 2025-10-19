"use client";

import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, BookOpen } from 'lucide-react';

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full py-2">
        <div className="container flex h-16 items-center justify-between px-4 py-4
          bg-white/10 rounded-2xl shadow-lg backdrop-blur-md border border-white/20">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
            <img src="/logo.png" alt="Luvoro Labs Logo" className="h-8 w-8" />
            Luvoro Labs
          </Link>
          <nav className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/"><Home className="mr-2 h-4 w-4" />Home</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/courses"><BookOpen className="mr-2 h-4 w-4" />Courses</Link>
            </Button>
            <Button asChild>
              <Link to="/auth">Login / Sign Up</Link>
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

export default PublicLayout;