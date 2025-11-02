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

  // Calculate safe area inset bottom with fallback
  const safeAreaInsetBottom = typeof window !== 'undefined' 
    ? parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom') || '0') 
    : 0;
  
  // Ensure we have a minimum height for the footer
  const footerHeight = Math.max(safeAreaInsetBottom + 56, 56);

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 glass rounded-t-3xl z-50 border-t border-border/50"
      style={{ 
        height: `${footerHeight}px`,
        paddingBottom: `${safeAreaInsetBottom}px`
      }}
    >
      <div className="flex justify-around items-center h-full px-4">
        {session ? (
          <>
            <div className="flex-1 flex justify-center items-center">
              <Button variant="ghost" asChild className={`flex flex-col items-center justify-center h-full ${isActive('/profile') ? 'text-primary' : 'text-muted-foreground'}`}>
                <Link to="/profile" className="flex flex-col items-center">
                  <GraduationCap className={`h-6 w-6 ${isActive('/profile') ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-xs mt-1 font-medium ${isActive('/profile') ? 'text-primary' : 'text-muted-foreground'}`}>Profile</span>
                </Link>
              </Button>
            </div>
            
            <div className="flex-1 flex justify-center items-center">
              <Button variant="ghost" asChild className={`flex flex-col items-center justify-center h-full ${isActive('/courses') ? 'text-primary' : 'text-muted-foreground'}`}>
                <Link to="/courses" className="flex flex-col items-center">
                  <BookOpen className={`h-6 w-6 ${isActive('/courses') ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-xs mt-1 font-medium ${isActive('/courses') ? 'text-primary' : 'text-muted-foreground'}`}>Courses</span>
                </Link>
              </Button>
            </div>
            
            <div className="flex-1 flex justify-center items-center">
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
            <div className="flex-1 flex justify-center items-center">
              <Button variant="ghost" asChild className={`flex flex-col items-center justify-center h-full ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`}>
                <Link to="/" className="flex flex-col items-center">
                  <Home className={`h-6 w-6 ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-xs mt-1 font-medium ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`}>Home</span>
                </Link>
              </Button>
            </div>
            
            <div className="flex-1 flex justify-center items-center">
              <Button variant="ghost" asChild className={`flex flex-col items-center justify-center h-full ${isActive('/courses') ? 'text-primary' : 'text-muted-foreground'}`}>
                <Link to="/courses" className="flex flex-col items-center">
                  <BookOpen className={`h-6 w-6 ${isActive('/courses') ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-xs mt-1 font-medium ${isActive('/courses') ? 'text-primary' : 'text-muted-foreground'}`}>Courses</span>
                </Link>
              </Button>
            </div>
            
            <div className="flex-1 flex justify-center items-center">
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