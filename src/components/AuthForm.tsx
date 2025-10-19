import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/lib/supabase';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa'; // Import Google icon

const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let authResponse;
      if (isSignUp) {
        authResponse = await supabase.auth.signUp({ email, password });
      } else {
        authResponse = await supabase.auth.signInWithPassword({ email, password });
      }

      console.log("Supabase Auth Response:", authResponse);

      if (authResponse.error) {
        showError(authResponse.error.message);
      } else if (authResponse.data.user) {
        showSuccess(isSignUp ? "Sign up successful! Please check your email to verify." : "Logged in successfully!");
        navigate('/');
      }
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // IMPORTANT: This URL must exactly match one of the "Redirect URLs" configured in your Supabase project
          // and also one of the "Authorized redirect URIs" in your Google Cloud Console OAuth client.
          // Supabase will redirect to this URL after Google authenticates the user.
          redirectTo: 'https://luvorolabs.vercel.app/dashboard', 
        },
      });

      if (error) {
        showError(error.message);
      } else {
        // Supabase will handle the redirect, so no need for navigate() here
      }
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
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
          <Button variant="link" onClick={() => setIsSignUp(!isSignUp)} className="p-0 h-auto">
            {isSignUp ? "Login" : "Sign Up"}
          </Button>
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
          {loading ? "Loading..." : "Google"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AuthForm;