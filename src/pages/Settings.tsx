"use client";

import React, { useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { showSuccess, showError } from '@/utils/toast';
import { AuthContext } from '@/context/AuthContext';
import { 
  BookOpen, 
  LayoutDashboard, 
  LogOut, 
  Sun, 
  Moon, 
  Settings as SettingsIcon, 
  User, 
  HelpCircle, 
  Shield, 
  Bell, 
  CreditCard,
  Globe,
  Laptop
} from 'lucide-react';
import { useTheme } from 'next-themes';

const Settings = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

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

  const toggleTheme = (themeOption: string) => {
    setTheme(themeOption);
  };

  if (!user) {
    return (
      <div className="text-center py-10">
        <h1 className="text-3xl font-bold text-destructive">Authentication Required</h1>
        <p className="text-muted-foreground mt-2">Please log in to access settings.</p>
        <Button asChild className="mt-4">
          <Link to="/auth">Login / Sign Up</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center text-primary">Settings</h1>
      
      <Card className="shadow-sm bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" asChild className="w-full justify-start">
            <Link to="/profile">
              <User className="mr-2 h-4 w-4" /> Profile
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full justify-start">
            <Link to="/courses">
              <BookOpen className="mr-2 h-4 w-4" /> Courses
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full justify-start">
            <Link to="/courses/ap-physics">
              <LayoutDashboard className="mr-2 h-4 w-4" /> AP Physics
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-sm bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button 
              variant={theme === 'system' ? "default" : "outline"} 
              className="w-full justify-start"
              onClick={() => toggleTheme('system')}
            >
              <Laptop className="mr-2 h-4 w-4" />
              System
            </Button>
            <Button 
              variant={theme === 'light' ? "default" : "outline"} 
              className="w-full justify-start"
              onClick={() => toggleTheme('light')}
            >
              <Sun className="mr-2 h-4 w-4" />
              Light Mode
            </Button>
            <Button 
              variant={theme === 'dark' ? "default" : "outline"} 
              className="w-full justify-start"
              onClick={() => toggleTheme('dark')}
            >
              <Moon className="mr-2 h-4 w-4" />
              Dark Mode
            </Button>
          </div>
          <Button variant="outline" asChild className="w-full justify-start">
            <Link to="#">
              <Bell className="mr-2 h-4 w-4" /> Notifications
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full justify-start">
            <Link to="#">
              <Globe className="mr-2 h-4 w-4" /> Language
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-sm bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" asChild className="w-full justify-start">
            <Link to="#">
              <Shield className="mr-2 h-4 w-4" /> Privacy Settings
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full justify-start">
            <Link to="#">
              <CreditCard className="mr-2 h-4 w-4" /> Payment Methods
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-sm bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" asChild className="w-full justify-start">
            <Link to="#">
              <HelpCircle className="mr-2 h-4 w-4" /> Help Center
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full justify-start">
            <Link to="#">
              <SettingsIcon className="mr-2 h-4 w-4" /> Feedback
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Button variant="destructive" className="w-full" onClick={handleLogout}>
        <LogOut className="mr-2 h-4 w-4" /> Logout
      </Button>
    </div>
  );
};

export default Settings;