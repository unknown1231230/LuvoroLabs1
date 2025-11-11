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
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gradient mb-4 float-animation">Settings</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Customize your learning experience and manage your account preferences.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="enhanced-card">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <User className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-gradient">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" asChild className="w-full justify-start enhanced-button btn-outline-hover-fix">
              <Link to="/profile">
                <User className="mr-2 h-4 w-4" /> Profile
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full justify-start enhanced-button btn-outline-hover-fix">
              <Link to="/courses">
                <BookOpen className="mr-2 h-4 w-4" /> Courses
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full justify-start enhanced-button btn-outline-hover-fix">
              <Link to="/courses/ap-physics">
                <LayoutDashboard className="mr-2 h-4 w-4" /> AP Physics
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="enhanced-card">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-4">
              <SettingsIcon className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-gradient">Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button 
                variant={theme === 'system' ? "default" : "outline"} 
                className="w-full justify-start enhanced-button btn-hover-fix"
                onClick={() => toggleTheme('system')}
              >
                <Laptop className="mr-2 h-4 w-4" />
                System
              </Button>
              <Button 
                variant={theme === 'light' ? "default" : "outline"} 
                className="w-full justify-start enhanced-button btn-hover-fix"
                onClick={() => toggleTheme('light')}
              >
                <Sun className="mr-2 h-4 w-4" />
                Light Mode
              </Button>
              <Button 
                variant={theme === 'dark' ? "default" : "outline"} 
                className="w-full justify-start enhanced-button btn-hover-fix"
                onClick={() => toggleTheme('dark')}
              >
                <Moon className="mr-2 h-4 w-4" />
                Dark Mode
              </Button>
            </div>
            <Button variant="outline" asChild className="w-full justify-start enhanced-button btn-outline-hover-fix">
              <Link to="#">
                <Bell className="mr-2 h-4 w-4" /> Notifications
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full justify-start enhanced-button btn-outline-hover-fix">
              <Link to="#">
                <Globe className="mr-2 h-4 w-4" /> Language
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="enhanced-card">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-gradient">Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" asChild className="w-full justify-start enhanced-button btn-outline-hover-fix">
              <Link to="#">
                <Shield className="mr-2 h-4 w-4" /> Privacy Settings
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full justify-start enhanced-button btn-outline-hover-fix">
              <Link to="#">
                <CreditCard className="mr-2 h-4 w-4" /> Payment Methods
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="enhanced-card">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mb-4">
              <HelpCircle className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-gradient">Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" asChild className="w-full justify-start enhanced-button btn-outline-hover-fix">
              <Link to="#">
                <HelpCircle className="mr-2 h-4 w-4" /> Help Center
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full justify-start enhanced-button btn-outline-hover-fix">
              <Link to="#">
                <SettingsIcon className="mr-2 h-4 w-4" /> Feedback
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button variant="destructive" className="enhanced-button" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>
    </div>
  );
};

export default Settings;