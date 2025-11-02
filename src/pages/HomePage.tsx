"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';

const HomePage = () => {
  const { session } = React.useContext(AuthContext);

  return (
    <div className="space-y-12 max-w-4xl mx-auto px-4 py-8">
      <section className="text-center py-16 rounded-lg">
        <h1 className="text-5xl font-extrabold mb-4">Luvoro Labs</h1>
        <p className="text-xl max-w-3xl mx-auto mb-8">
          Welcome to Luvoro Labs, your launchpad for mastering AP subjects.
        </p>
        <div className="flex justify-center space-x-4">
          {session ? (
            <Button asChild size="lg">
              <Link to="/profile">Go to Dashboard</Link>
            </Button>
          ) : (
            <Button asChild size="lg">
              <Link to="/auth">
                <span className="flex items-center">
                  Get Started <BookOpen className="ml-2 h-4 w-4" />
                </span>
              </Link>
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;