"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { BarChart, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar } from 'recharts';
import { Flame, Trophy, Lightbulb, BookOpen } from 'lucide-react';
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// --- Supabase Data Fetching Functions (Conceptual - requires database tables) ---
// You will need to create 'streaks' and 'achievements' tables in Supabase.
// Example 'streaks' table schema:
// CREATE TABLE streaks (
//   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
//   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
//   current_streak INT DEFAULT 0,
//   last_active_date DATE,
//   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
// );
//
// Example 'achievements' table schema:
// CREATE TABLE achievements (
//   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
//   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
//   achievement_name TEXT NOT NULL,
//   description TEXT,
//   unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
// );

const fetchUserStreak = async (userId: string) => {
  const { data, error } = await supabase
    .from('streaks')
    .select('current_streak')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
    console.error("Error fetching streak:", error);
    return 0;
  }
  return data?.current_streak || 0;
};

const fetchUserAchievements = async (userId: string) => {
  const { count, error } = await supabase
    .from('achievements')
    .select('*', { count: 'exact' })
    .eq('user_id', userId);

  if (error && error.code !== 'PGRST116') {
    console.error("Error fetching achievements:", error);
    return 0;
  }
  return count || 0;
};

const Index = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
      }
    });
  }, []);

  // Fetch dynamic data using react-query
  const { data: currentStreak = 0, isLoading: isLoadingStreak } = useQuery({
    queryKey: ['userStreak', userId],
    queryFn: () => userId ? fetchUserStreak(userId) : Promise.resolve(0),
    enabled: !!userId,
  });

  const { data: achievementsUnlocked = 0, isLoading: isLoadingAchievements } = useQuery({
    queryKey: ['userAchievements', userId],
    queryFn: () => userId ? fetchUserAchievements(userId) : Promise.resolve(0),
    enabled: !!userId,
  });

  // Mock data for demonstration (if not logged in or no data)
  const userProgress = 75; // This would also be dynamic
  const completedLessons = 12; // This would also be dynamic
  const personalizedRecommendations = [
    "Review 'Algebraic Equations' - you missed a few questions on the last quiz.",
    "Try the 'Introduction to Physics' lab for a new challenge.",
    "Practice 'Calculus Derivatives' with an AP-style quiz."
  ];

  const progressData = [
    { name: 'Week 1', lessons: 4, quizzes: 3 },
    { name: 'Week 2', lessons: 6, quizzes: 5 },
    { name: 'Week 3', lessons: 5, quizzes: 4 },
    { name: 'Week 4', lessons: 7, quizzes: 6 },
  ];

  const streakData = [
    { day: 'Mon', streak: 1 },
    { day: 'Tue', streak: 2 },
    { day: 'Wed', streak: 3 },
    { day: 'Thu', streak: 4 },
    { day: 'Fri', streak: 5 },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-center text-primary">Luvoro Labs Dashboard</h1>
      <p className="text-center text-muted-foreground max-w-2xl mx-auto">
        Welcome to your personalized learning hub. Track your progress, unlock achievements, and explore new courses!
      </p>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Flame className="text-orange-500" />Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStreak ? (
              <p className="text-center text-muted-foreground">Loading...</p>
            ) : (
              <>
                <p className="text-5xl font-extrabold text-center text-orange-600">{currentStreak} Days</p>
                <p className="text-center text-muted-foreground mt-2">Keep up the great work!</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Trophy className="text-yellow-500" />Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAchievements ? (
              <p className="text-center text-muted-foreground">Loading...</p>
            ) : (
              <>
                <p className="text-5xl font-extrabold text-center text-yellow-600">{achievementsUnlocked}</p>
                <p className="text-center text-muted-foreground mt-2">Unlocked so far!</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Lightbulb className="text-blue-500" />Personalized Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              {personalizedRecommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Course Catalog Link */}
      <section className="text-center">
        <Button asChild size="lg">
          <Link to="/courses">
            <BookOpen className="mr-2 h-5 w-5" /> Explore Our Course Catalog
          </Link>
        </Button>
      </section>

      <Separator />

      {/* Progress & Analytics Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Progress value={userProgress} className="w-full" />
              <span className="text-lg font-semibold">{userProgress}%</span>
            </div>
            <p className="text-muted-foreground mt-2">You've completed {completedLessons} lessons.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="lessons" fill="#8884d8" name="Lessons Completed" />
                <Bar dataKey="quizzes" fill="#82ca9d" name="Quizzes Taken" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Streak History</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={streakData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="streak" stroke="#ffc658" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Index;