"use client";

import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, BookOpen, User, LogIn, GraduationCap, Settings } from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const MobileFooterNav = () => {
  const { session } = useContext(AuthContext);
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    return currentPath === path;
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 pointer-events-none pb-[env(safe-area-inset-bottom)]">
      <div className="glass rounded-2xl border border-border shadow-lg pointer-events-auto mx-auto max-w-md backdrop-blur-xl">
        <div className="flex justify-around items-center h-[64px] px-2">
          {session ? (
            <>
              <Button 
                variant="ghost" 
                asChild 
                className={cn(
                  "flex flex-col items-center justify-center h-full enhanced-button",
                  isActive('/profile') ? 'text-primary' : 'text-muted-foreground',
                  "btn-secondary-hover-fix"
                )}
              >
                <Link to="/profile" className="flex flex-col items-center">
                  <GraduationCap className={cn("h-6 w-6", isActive('/profile') ? 'text-primary' : 'text-muted-foreground')} />
                  <span className={cn("text-xs mt-1 font-medium", isActive('/profile') ? 'text-primary' : 'text-muted-foreground')}>Profile</span>
                </Link>
              </Button>
              
              <Button 
                variant="ghost" 
                asChild 
                className={cn(
                  "flex flex-col items-center justify-center h-full enhanced-button",
                  isActive('/courses') ? 'text-primary' : 'text-muted-foreground',
                  "btn-secondary-hover-fix"
                )}
              >
                <Link to="/courses" className="flex flex-col items-center">
                  <BookOpen className={cn("h-6 w-6", isActive('/courses') ? 'text-primary' : 'text-muted-foreground')} />
                  <span className={cn("text-xs mt-1 font-medium", isActive('/courses') ? 'text-primary' : 'text-muted-foreground')}>Courses</span>
                </Link>
              </Button>
              
              <Button 
                variant="ghost" 
                asChild 
                className={cn(
                  "flex flex-col items-center justify-center h-full enhanced-button",
                  isActive('/settings') ? 'text-primary' : 'text-muted-foreground',
                  "btn-secondary-hover-fix"
                )}
              >
                <Link to="/settings" className="flex flex-col items-center">
                  <Settings className={cn("h-6 w-6", isActive('/settings') ? 'text-primary' : 'text-muted-foreground')} />
                  <span className={cn("text-xs mt-1 font-medium", isActive('/settings') ? 'text-primary' : 'text-muted-foreground')}>Settings</span>
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="ghost" 
                asChild 
                className={cn(
                  "flex flex-col items-center justify-center h-full enhanced-button",
                  isActive('/') ? 'text-primary' : 'text-muted-foreground',
                  "btn-secondary-hover-fix"
                )}
              >
                <Link to="/" className="flex flex-col items-center">
                  <Home className={cn("h-6 w-6", isActive('/') ? 'text-primary' : 'text-muted-foreground')} />
                  <span className={cn("text-xs mt-1 font-medium", isActive('/') ? 'text-primary' : 'text-muted-foreground')}>Home</span>
                </Link>
              </Button>
              
              <Button 
                variant="ghost" 
                asChild 
                className={cn(
                  "flex flex-col items-center justify-center h-full enhanced-button",
                  isActive('/courses') ? 'text-primary' : 'text-muted-foreground',
                  "btn-secondary-hover-fix"
                )}
              >
                <Link to="/courses" className="flex flex-col items-center">
                  <BookOpen className={cn("h-6 w-6", isActive('/courses') ? 'text-primary' : 'text-muted-foreground')} />
                  <span className={cn("text-xs mt-1 font-medium", isActive('/courses') ? 'text-primary' : 'text-muted-foreground')}>Courses</span>
                </Link>
              </Button>
              
              <Button 
                variant="ghost" 
                asChild 
                className={cn(
                  "flex flex-col items-center justify-center h-full enhanced-button",
                  isActive('/auth') ? 'text-primary' : 'text-muted-foreground',
                  "btn-secondary-hover-fix"
                )}
              >
                <Link to="/auth" className="flex flex-col items-center">
                  <LogIn className={cn("h-6 w-6", isActive('/auth') ? 'text-primary' : 'text-muted-foreground')} />
                  <span className={cn("text-xs mt-1 font-medium", isActive('/auth') ? 'text-primary' : 'text-muted-foreground')}>Login</span>
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileFooterNav;