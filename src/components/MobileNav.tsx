"use client";

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, BookOpen, LogOut, LayoutDashboard, Award, Settings } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { showSuccess, showError } from '@/utils/toast';

interface MobileNavProps {
  isAuthenticated: boolean;
}

const MobileNav: React.FC<MobileNavProps> = ({ isAuthenticated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        showError(error.message);
      } else {
        showSuccess("Logged out successfully!");
        navigate('/auth');
        setIsOpen(false); // Close sheet on logout
      }
    } catch (error: any) {
      showError(error.message);
    }
  };

  const closeSheet = () => setIsOpen(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[250px] sm:w-[300px] flex flex-col">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2 text-xl font-bold text-primary">
            <img src="/logo.png" alt="Luvoro Labs Logo" className="h-7 w-7" />
            Luvoro Labs
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4 flex-grow">
          <Button variant="ghost" asChild onClick={closeSheet} className="justify-start">
            <Link to="/">
              <>
                <Home className="mr-2 h-4 w-4" />Home
              </>
            </Link>
          </Button>
          <Button variant="ghost" asChild onClick={closeSheet} className="justify-start">
            <Link to="/courses">
              <>
                <BookOpen className="mr-2 h-4 w-4" />Courses
              </>
            </Link>
          </Button>
          {isAuthenticated ? (
            <>
              <Button variant="ghost" asChild onClick={closeSheet} className="justify-start">
                <Link to="/dashboard">
                  <>
                    <LayoutDashboard className="mr-2 h-4 w-4" />Dashboard
                  </>
                </Link>
              </Button>
              <Button variant="ghost" asChild onClick={closeSheet} className="justify-start">
                <Link to="/achievements">
                  <>
                    <Award className="mr-2 h-4 w-4" />Achievements
                  </>
                </Link>
              </Button>
              <Button variant="ghost" asChild onClick={closeSheet} className="justify-start">
                <Link to="/settings">
                  <>
                    <Settings className="mr-2 h-4 w-4" />Settings
                  </>
                </Link>
              </Button>
              <Button variant="ghost" onClick={handleLogout} className="justify-start text-destructive hover:text-destructive">
                <>
                  <LogOut className="mr-2 h-4 w-4" />Logout
                </>
              </Button>
            </>
          ) : (
            <Button asChild onClick={closeSheet} className="justify-start">
              <Link to="/auth">
                <>
                  Login / Sign Up
                </>
              </Link>
            </Button>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;