"use client";

import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, BarChart3, User, LogOut, GraduationCap, Brain, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthContext } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { showSuccess, showError } from '@/utils/toast';

const MobileFooterNav = () => {
  const { session } = useContext(AuthContext);
  const location = useLocation();
  const currentPath = location.pathname;

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        showError(error.message);
      } else {
        showSuccess("Logged out successfully!");
      }
    } catch (error: any) {
      showError(error.message);
    }
  };

  const isActive = (path: string) => {
    return currentPath === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 pb-safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        <Button variant="ghost" asChild className={`flex flex-col items-center justify-center h-full ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`}>
          <Link to="/" className="flex flex-col items-center">
            <Rocket className={`h-6 w-6 ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className={`text-xs mt-1 font-medium ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`}>Home</span>
          </Link>
        </Button>
        
        <Button variant="ghost" asChild className={`flex flex-col items-center justify-center h-full ${isActive('/courses') ? 'text-primary' : 'text-muted-foreground'}`}>
          <Link to="/courses" className="flex flex-col items-center">
            <BookOpen className={`h-6 w-6 ${isActive('/courses') ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className={`text-xs mt-1 font-medium ${isActive('/courses') ? 'text-primary' : 'text-muted-foreground'}`}>Courses</span>
          </Link>
        </Button>
        
        {session ? (
          <>
            <Button variant="ghost" asChild className={`flex flex-col items-center justify-center h-full ${isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'}`}>
              <Link to="/dashboard" className="flex flex-col items-center">
                <BarChart3 className={`h-6 w-6 ${isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-xs mt-1 font-medium ${isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'}`}>Progress</span>
              </Link>
            </Button>
            
            <Button variant="ghost" asChild className={`flex flex-col items-center justify-center h-full ${isActive('/profile') ? 'text-primary' : 'text-muted-foreground'}`}>
              <Link to="/profile" className="flex flex-col items-center">
                <GraduationCap className={`h-6 w-6 ${isActive('/profile') ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-xs mt-1 font-medium ${isActive('/profile') ? 'text-primary' : 'text-muted-foreground'}`}>Profile</span>
              </Link>
            </Button>
          </>
        ) : (
          <Button variant="ghost" asChild className={`flex flex-col items-center justify-center h-full ${isActive('/auth') ? 'text-primary' : 'text-muted-foreground'}`}>
            <Link to="/auth" className="flex flex-col items-center">
              <User className={`h-6 w-6 ${isActive('/auth') ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-xs mt-1 font-medium ${isActive('/auth') ? 'text-primary' : 'text-muted-foreground'}`}>Account</span>
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default MobileFooterNav;