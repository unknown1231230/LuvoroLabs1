"use client";

import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, BookOpen, User, LogIn, GraduationCap, Settings } from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';

const MobileFooterNav = () => {
  const { session } = useContext(AuthContext);
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    return currentPath === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 glass rounded-t-3xl z-50 border-t border-border/50">
      <div className="flex justify-around items-center h-16 px-2" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 0px)' }}>
        {session ? (
          <>
            <div className="relative flex-1 flex justify-center items-center">
              {isActive('/profile') && (
                <div className="absolute -top-2 w-10 h-2 rounded-full glass active-indicator" />
              )}
              <Button variant="ghost" asChild className={`flex flex-col items-center justify-center h-full ${isActive('/profile') ? 'text-primary' : 'text-muted-foreground'}`}>
                <Link to="/profile" className="flex flex-col items-center">
                  <GraduationCap className={`h-6 w-6 ${isActive('/profile') ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-xs mt-1 font-medium ${isActive('/profile') ? 'text-primary' : 'text-muted-foreground'}`}>Profile</span>
                </Link>
              </Button>
            </div>
            
            <div className="relative flex-1 flex justify-center items-center">
              {isActive('/courses') && (
                <div className="absolute -top-2 w-10 h-2 rounded-full glass active-indicator" />
              )}
              <Button variant="ghost" asChild className={`flex flex-col items-center justify-center h-full ${isActive('/courses') ? 'text-primary' : 'text-muted-foreground'}`}>
                <Link to="/courses" className="flex flex-col items-center">
                  <BookOpen className={`h-6 w-6 ${isActive('/courses') ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-xs mt-1 font-medium ${isActive('/courses') ? 'text-primary' : 'text-muted-foreground'}`}>Courses</span>
                </Link>
              </Button>
            </div>
            
            <div className="relative flex-1 flex justify-center items-center">
              {isActive('/settings') && (
                <div className="absolute -top-2 w-10 h-2 rounded-full glass active-indicator" />
              )}
              <Button variant="ghost" asChild className={`flex flex-col items-center justify-center h-full ${isActive('/settings') ? 'text-primary' : 'text-muted-foreground'}`}>
                <Link to="/settings" className="flex flex-col items-center">
                  <Settings className={`h-6 w-6 ${isActive('/settings') ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-xs mt-1 font-medium ${isActive('/settings') ? 'text-primary' : 'text-muted-foreground'}`}>Settings</span>
                </Link>
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="relative flex-1 flex justify-center items-center">
              {isActive('/') && (
                <div className="absolute -top-2 w-10 h-2 rounded-full glass active-indicator" />
              )}
              <Button variant="ghost" asChild className={`flex flex-col items-center justify-center h-full ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`}>
                <Link to="/" className="flex flex-col items-center">
                  <Home className={`h-6 w-6 ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-xs mt-1 font-medium ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`}>Home</span>
                </Link>
              </Button>
            </div>
            
            <div className="relative flex-1 flex justify-center items-center">
              {isActive('/courses') && (
                <div className="absolute -top-2 w-10 h-2 rounded-full glass active-indicator" />
              )}
              <Button variant="ghost" asChild className={`flex flex-col items-center justify-center h-full ${isActive('/courses') ? 'text-primary' : 'text-muted-foreground'}`}>
                <Link to="/courses" className="flex flex-col items-center">
                  <BookOpen className={`h-6 w-6 ${isActive('/courses') ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-xs mt-1 font-medium ${isActive('/courses') ? 'text-primary' : 'text-muted-foreground'}`}>Courses</span>
                </Link>
              </Button>
            </div>
            
            <div className="relative flex-1 flex justify-center items-center">
              {isActive('/auth') && (
                <div className="absolute -top-2 w-10 h-2 rounded-full glass active-indicator" />
              )}
              <Button variant="ghost" asChild className={`flex flex-col items-center justify-center h-full ${isActive('/auth') ? 'text-primary' : 'text-muted-foreground'}`}>
                <Link to="/auth" className="flex flex-col items-center">
                  <LogIn className={`h-6 w-6 ${isActive('/auth') ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-xs mt-1 font-medium ${isActive('/auth') ? 'text-primary' : 'text-muted-foreground'}`}>Login</span>
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MobileFooterNav;