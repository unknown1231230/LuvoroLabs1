"use client";

import React, { useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Flame, Trophy, Lightbulb, Users, BookOpen, CheckCircle, ClipboardCheck } from 'lucide-react';
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/context/AuthContext";
import { getTotalLessonsCount, findPersonalizedRecommendations } from "@/utils/courseContent";
import { 
  fetchUserCompletedLessonsCount, 
  fetchSiteMetric, 
  fetchUserLessonProgress, 
  fetchStreakHistory,
  fetchLessonsCompletedToday,
  fetchTotalQuizAttempts,
  fetchQuizzesTakenToday
} from "@/utils/supabaseUtils";

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

const Profile = () => {
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
    queryFn: () => userId ? fetchUserLessonProgress(userId) : Promise.resolve([]),
    enabled: !!userId && !authLoading,
  });

  const { data: personalizedRecommendations = [], isLoading: isLoadingRecommendations } = useQuery({
    queryKey: ['personalizedRecommendations', userId, userCompletedLessonIds],
    queryFn: () => findPersonalizedRecommendations(userId, userCompletedLessonIds),
    enabled: !authLoading,
  });

  const { data: siteViews = 0, isLoading: isLoadingSiteViews } = useQuery({
    queryKey: ['siteViews'],
    queryFn: () => fetchSiteMetric('site_views'),
  });

  // New queries for daily and total activity
  const { data: lessonsCompletedToday = 0, isLoading: isLoadingLessonsToday } = useQuery({
    queryKey: ['lessonsCompletedToday', userId],
    queryFn: () => userId ? fetchLessonsCompletedToday(userId) : Promise.resolve(0),
    enabled: !!userId && !authLoading,
  });

  const { data: totalQuizAttempts = 0, isLoading: isLoadingTotalQuizzes } = useQuery({
    queryKey: ['totalQuizAttempts', userId],
    queryFn: () => userId ? fetchTotalQuizAttempts(userId) : Promise.resolve(0),
    enabled: !!userId && !authLoading,
  });

  const { data: quizzesTakenToday = 0, isLoading: isLoadingQuizzesToday } = useQuery({
    queryKey: ['quizzesTakenToday', userId],
    queryFn: () => userId ? fetchQuizzesTakenToday(userId) : Promise.resolve(0),
    enabled: !!userId && !authLoading,
  });

  const { data: streakHistory = [], isLoading: isLoadingStreakHistory } = useQuery({
    queryKey: ['streakHistory', userId],
    queryFn: () => userId ? fetchStreakHistory(userId) : Promise.resolve([]),
    enabled: !!userId && !authLoading,
  });

  const userProgress = totalLessonsCount > 0 ? Math.round((userCompletedLessonsCount / totalLessonsCount) * 100) : 0;

  // Prepare streak history data for Recharts, ensuring correct date parsing
  const formattedStreakHistory = streakHistory.map(entry => ({
    date: new Date(entry.recorded_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    streak: entry.streak_count,
  }));

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-24 h-24 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
          <span className="text-4xl font-bold text-primary">L</span>
        </div>
        <h1 className="text-3xl font-bold text-primary">Your Learning Profile</h1>
        <p className="text-muted-foreground mt-2">Track your progress and achievements</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="shadow-sm bg-card border-border">
          <CardContent className="p-4 text-center">
            <Flame className="h-6 w-6 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-600">{currentStreak} Days</p>
            <p className="text-sm text-muted-foreground">Streak</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm bg-card border-border">
          <CardContent className="p-4 text-center">
            <Trophy className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-600">{achievementsUnlocked}</p>
            <p className="text-sm text-muted-foreground">Achievements</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Section */}
      <Card className="shadow-sm bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Overall Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingTotalLessons || isLoadingUserCompletedLessons || authLoading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <Progress value={userProgress} className="w-full" />
                <span className="text-lg font-semibold text-foreground">{userProgress}%</span>
              </div>
              <p className="text-muted-foreground mt-2">You've completed {userCompletedLessonsCount} out of {totalLessonsCount} lessons.</p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <Card className="shadow-sm bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Today's Activity</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <p className="text-xl font-bold text-foreground">{lessonsCompletedToday}</p>
            <p className="text-sm text-muted-foreground">Lessons</p>
          </div>
          <div className="text-center">
            <ClipboardCheck className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-xl font-bold text-foreground">{quizzesTakenToday}</p>
            <p className="text-sm text-muted-foreground">Quizzes</p>
          </div>
        </CardContent>
      </Card>

      {/* Streak History */}
      <Card className="shadow-sm bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Streak History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingStreakHistory || authLoading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : formattedStreakHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={formattedStreakHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} itemStyle={{ color: 'hsl(var(--foreground))' }} />
                <Legend />
                <Line type="monotone" dataKey="streak" stroke="hsl(var(--primary))" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground">No streak history available yet. Complete a lesson to start your streak!</p>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="shadow-sm bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Recommended Next Steps</CardTitle>
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
    </div>
  );
};

export default Profile;