"use client";

import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, LayoutDashboard, User, LogOut } from 'lucide-react';
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
    <div className="fixed bottom-0 left-0 right-0 border-t bg-card z-50 pb-safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        <Button variant="ghost" asChild className={`flex flex-col items-center justify-center h-full ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`}>
          <Link to="/" className="flex flex-col items-center">
            <Home className={`h-5 w-5 ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="text-xs mt-1">Home</span>
          </Link>
        </Button>
        
        <Button variant="ghost" asChild className={`flex flex-col items-center justify-center h-full ${isActive('/courses') ? 'text-primary' : 'text-muted-foreground'}`}>
          <Link to="/courses" className="flex flex-col items-center">
            <BookOpen className={`h-5 w-5 ${isActive('/courses') ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="text-xs mt-1">Courses</span>
          </Link>
        </Button>
        
        {session ? (
          <>
            <Button variant="ghost" asChild className={`flex flex-col items-center justify-center h-full ${isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'}`}>
              <Link to="/dashboard" className="flex flex-col items-center">
                <LayoutDashboard className={`h-5 w-5 ${isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="text-xs mt-1">Dashboard</span>
              </Link>
            </Button>
            
            <Button variant="ghost" asChild className={`flex flex-col items-center justify-center h-full ${isActive('/profile') ? 'text-primary' : 'text-muted-foreground'}`}>
              <Link to="/profile" className="flex flex-col items-center">
                <User className={`h-5 w-5 ${isActive('/profile') ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="text-xs mt-1">Profile</span>
              </Link>
            </Button>
          </>
        ) : (
          <Button variant="ghost" asChild className={`flex flex-col items-center justify-center h-full ${isActive('/auth') ? 'text-primary' : 'text-muted-foreground'}`}>
            <Link to="/auth" className="flex flex-col items-center">
              <User className={`h-5 w-5 ${isActive('/auth') ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="text-xs mt-1">Account</span>
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default MobileFooterNav;