import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        await supabase.auth.signUp({ email, password });
      } else {
        await supabase.auth.signInWithPassword({ email, password });
      }
      navigate('/');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`, 
        },
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{isSignUp ? "Sign Up" : "Login"}</CardTitle>
          <CardDescription>
            {isSignUp ? "Create your Luvoro Labs account" : "Welcome back to Luvoro Labs"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : (isSignUp ? "Sign Up" : "Login")}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button 
              onClick={() => setIsSignUp(!isSignUp)} 
              className="text-primary hover:underline"
            >
              {isSignUp ? "Login" : "Sign Up"}
            </button>
          </div>
          <div className="relative flex justify-center text-xs uppercase mt-6">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
          <Button
            variant="outline"
            className="w-full mt-6 flex items-center justify-center gap-2"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <FaGoogle className="h-4 w-4" />
            <span>{loading ? "Loading..." : "Google"}</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;