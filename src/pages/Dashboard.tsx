"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { BarChart, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar } from 'recharts';
import { Flame, Trophy, Lightbulb, BookOpen, Users } from 'lucide-react';
import { useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/App";
import { getTotalLessonsCount, findPersonalizedRecommendations } from "@/utils/courseContent";
import { fetchUserCompletedLessonsCount, fetchSiteMetric, fetchUserLessonProgress, fetchWeeklyLessonCompletions, fetchWeeklyQuizAttempts } from "@/utils/supabaseUtils";

const fetchUserStreak = async (userId: string) => {
  const { data, error } = await supabase
    .from('streaks')
    .select('current_streak')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
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

const Dashboard = () => { // Renamed from Index to Dashboard
  const { user, loading: authLoading } = useContext(AuthContext);
  const userId = user?.id || null;

  // Fetch dynamic data using react-query
  const { data: currentStreak = 0, isLoading: isLoadingStreak } = useQuery({
    queryKey: ['userStreak', userId],
    queryFn: () => userId ? fetchUserStreak(userId) : Promise.resolve(0),
    enabled: !!userId && !authLoading,
  });

  const { data: achievementsUnlocked = 0, isLoading: isLoadingAchievements } = useQuery({
    queryKey: ['userAchievements', userId],
    queryFn: () => userId ? fetchUserAchievements(userId) : Promise.resolve(0),
    enabled: !!userId && !authLoading,
  });

  const { data: totalLessonsCount = 0, isLoading: isLoadingTotalLessons } = useQuery({
    queryKey: ['totalLessonsCount'],
    queryFn: getTotalLessonsCount,
  });

  const { data: userCompletedLessonsCount = 0, isLoading: isLoadingUserCompletedLessons } = useQuery({
    queryKey: ['userCompletedLessonsCount', userId],
    queryFn: () => userId ? fetchUserCompletedLessonsCount(userId) : Promise.resolve(0),
    enabled: !!userId && !authLoading,
  });

  const { data: userCompletedLessonIds = [], isLoading: isLoadingUserCompletedLessonIds } = useQuery({
    queryKey: ['userCompletedLessonIds', userId],
    queryFn: () => userId ? fetchUserLessonProgress(userId) : Promise.resolve([]), // Fetch all completed lesson IDs
    enabled: !!userId && !authLoading,
  });

  const { data: personalizedRecommendations = [], isLoading: isLoadingRecommendations } = useQuery({
    queryKey: ['personalizedRecommendations', userId, userCompletedLessonIds],
    queryFn: () => findPersonalizedRecommendations(userId, userCompletedLessonIds),
    enabled: !authLoading, // Recommendations can be generated even if user is null (will return login message)
  });

  const { data: studentsHelped = 0, isLoading: isLoadingStudentsHelped } = useQuery({
    queryKey: ['studentsHelped'],
    queryFn: () => fetchSiteMetric('students_helped'),
  });

  const { data: weeklyLessons = [], isLoading: isLoadingWeeklyLessons } = useQuery({
    queryKey: ['weeklyLessons', userId],
    queryFn: () => userId ? fetchWeeklyLessonCompletions(userId) : Promise.resolve([]),
    enabled: !!userId && !authLoading,
  });

  const { data: weeklyQuizzes = [], isLoading: isLoadingWeeklyQuizzes } = useQuery({
    queryKey: ['weeklyQuizzes', userId],
    queryFn: () => userId ? fetchWeeklyQuizAttempts(userId) : Promise.resolve([]),
    enabled: !!userId && !authLoading,
  });

  const userProgress = totalLessonsCount > 0 ? Math.round((userCompletedLessonsCount / totalLessonsCount) * 100) : 0;

  // Combine weekly lessons and quizzes for the chart
  const combinedWeeklyData = weeklyLessons.map((lessonWeek, index) => ({
    name: lessonWeek.name,
    lessons: lessonWeek.lessons,
    quizzes: weeklyQuizzes.find(quizWeek => quizWeek.name === lessonWeek.name)?.quizzes || 0,
  }));

  const streakData = [
    { day: 'Mon', streak: 1 },
    { day: 'Tue', streak: 2 },
    { day: 'Wed', streak: 3 },
    { day: 'Thu', streak: 4 },
    { day: 'Fri', streak: 5 },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-center text-primary flex items-center justify-center gap-3">
        <img src="/logo.png" alt="Luvoro Labs Logo" className="h-10 w-10" />
        Luvoro Labs Dashboard
      </h1>
      <p className="text-center text-muted-foreground max-w-2xl mx-auto">
        Welcome to your personalized learning hub. Track your progress, unlock achievements, and explore new courses!
      </p>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Flame className="text-orange-500" />Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStreak || authLoading ? (
              <p className="text-center text-muted-foreground">Loading...</p>
            ) : (
              <>
                <p className="text-5xl font-extrabold text-center text-orange-600">{currentStreak} Days</p>
                <p className="text-center text-muted-foreground mt-2">Keep up the great work!</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Trophy className="text-yellow-500" />Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAchievements || authLoading ? (
              <p className="text-center text-muted-foreground">Loading...</p>
            ) : (
              <>
                <p className="text-5xl font-extrabold text-center text-yellow-600">{achievementsUnlocked}</p>
                <p className="text-center text-muted-foreground mt-2">Unlocked so far!</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Lightbulb className="text-blue-500" />Personalized Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingRecommendations || authLoading ? (
              <p className="text-center text-muted-foreground">Loading...</p>
            ) : (
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                {personalizedRecommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Global Metrics Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="text-purple-500" />Students Helped</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStudentsHelped ? (
              <p className="text-center text-muted-foreground">Loading...</p>
            ) : (
              <>
                <p className="text-5xl font-extrabold text-center text-purple-600">{studentsHelped.toLocaleString()}</p>
                <p className="text-center text-muted-foreground mt-2">And counting!</p>
              </>
            )}
          </CardContent>
        </Card>
        {/* Placeholder for other global metrics if needed */}
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
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingTotalLessons || isLoadingUserCompletedLessons || authLoading ? (
              <p className="text-center text-muted-foreground">Loading...</p>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <Progress value={userProgress} className="w-full" />
                  <span className="text-lg font-semibold">{userProgress}%</span>
                </div>
                <p className="text-muted-foreground mt-2">You've completed {userCompletedLessonsCount} out of {totalLessonsCount} lessons.</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingWeeklyLessons || isLoadingWeeklyQuizzes || authLoading ? (
              <p className="text-center text-muted-foreground">Loading...</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={combinedWeeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="lessons" fill="#8884d8" name="Lessons Completed" />
                  <Bar dataKey="quizzes" fill="#82ca9d" name="Quizzes Taken" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-sm">
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
            <p className="text-muted-foreground mt-2 text-sm">
              *Streak history data is currently illustrative. A dedicated streak log table in Supabase would be needed for dynamic history.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Dashboard;