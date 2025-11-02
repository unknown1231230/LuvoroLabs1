"use client";

import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, User, LogIn, GraduationCap, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthContext } from '@/context/AuthContext';

const MobileFooterNav = () => {
  const { session } = useContext(AuthContext);
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    return currentPath === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-[env(safe-area-inset-bottom)]">
      <div className="glass rounded-2xl rounded-b-none border border-border mb-4 shadow-lg">
        <div className="flex justify-around items-center h-[64px]">
          {session ? (
            <>
              <Button variant="ghost" asChild className={`flex flex-col items-center justify-center h-full ${isActive('/profile') ? 'text-primary' : 'text-muted-foreground'}`}>
                <Link to="/profile" className="flex flex-col items-center">
                  <GraduationCap className={`h-6 w-6 ${isActive('/profile') ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-xs mt-1 font-medium ${isActive('/profile') ? 'text-primary' : 'text-muted-foreground'}`}>Profile</span>
                </Link>
              </Button>
              
              <Button variant="ghost" asChild className={`flex flex-col items-center justify-center h-full ${isActive('/courses') ? 'text-primary' : 'text-muted-foreground'}`}>
                <Link to="/courses" className="flex flex-col items-center">
                  <BookOpen className={`h-6 w-6 ${isActive('/courses') ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-xs mt-1 font-medium ${isActive('/courses') ? 'text-primary' : 'text-muted-foreground'}`}>Courses</span>
                </Link>
              </Button>
              
              <Button variant="ghost" asChild className={`flex flex-col items-center justify-center h-full ${isActive('/settings') ? 'text-primary' : 'text-muted-foreground'}`}>
                <Link to="/settings" className="flex flex-col items-center">
                  <Settings className={`h-6 w-6 ${isActive('/settings') ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-xs mt-1 font-medium ${isActive('/settings') ? 'text-primary' : 'text-muted-foreground'}`}>Settings</span>
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className={`flex flex-col items-center justify-center h-full ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`}>
                <Link to="/" className="flex flex-col items-center">
                  <Home className={`h-6 w-6 ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-xs mt-1 font-medium ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`}>Home</span>
                </Link>
              </Button>
              
              <Button variant="ghost" asChild className={`flex flex-col items-center justify-center h-full ${isActive('/courses') ? 'text-primary' : 'text-muted-foreground'}`}>
                <Link to="/courses" className="flex flex-col items-center">
                  <BookOpen className={`h-6 w-6 ${isActive('/courses') ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-xs mt-1 font-medium ${isActive('/courses') ? 'text-primary' : 'text-muted-foreground'}`}>Courses</span>
                </Link>
              </Button>
              
              <Button variant="ghost" asChild className={`flex flex-col items-center justify-center h-full ${isActive('/auth') ? 'text-primary' : 'text-muted-foreground'}`}>
                <Link to="/auth" className="flex flex-col items-center">
                  <LogIn className={`h-6 w-6 ${isActive('/auth') ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-xs mt-1 font-medium ${isActive('/auth') ? 'text-primary' : 'text-muted-foreground'}`}>Login</span>
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