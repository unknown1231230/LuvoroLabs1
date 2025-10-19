"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Flame, Trophy, Lightbulb, BookOpen, Users, CheckCircle, ClipboardCheck } from 'lucide-react';
import { useContext } from "react";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/context/AuthContext"; // Updated import
import { getTotalLessonsCount, findPersonalizedRecommendations } from "@/utils/courseContent";
import { 
  fetchUserCompletedLessonsCount, 
  fetchSiteMetric, 
  fetchUserLessonProgress, 
  fetchStreakHistory,
  fetchLessonsCompletedToday, // New import
  fetchTotalQuizAttempts,     // New import
  fetchQuizzesTakenToday      // New import
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

const Dashboard = () => {
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
    // By appending T00:00:00, we ensure the date is parsed in the user's local timezone, not UTC.
    date: new Date(entry.recorded_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    streak: entry.streak_count,
  }));

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

      {/* Progress & Activity Summary Section */}
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
            <CardTitle className="flex items-center gap-2">Activity Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Lessons Today</p>
              {isLoadingLessonsToday || authLoading ? (
                <p className="text-xl font-bold">...</p>
              ) : (
                <p className="text-xl font-bold">{lessonsCompletedToday}</p>
              )}
            </div>
            <div className="text-center">
              <ClipboardCheck className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Quizzes Today</p>
              {isLoadingQuizzesToday || authLoading ? (
                <p className="text-xl font-bold">...</p>
              ) : (
                <p className="text-xl font-bold">{quizzesTakenToday}</p>
              )}
            </div>
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Total Lessons</p>
              {isLoadingUserCompletedLessons || authLoading ? (
                <p className="text-xl font-bold">...</p>
              ) : (
                <p className="text-xl font-bold">{userCompletedLessonsCount}</p>
              )}
            </div>
            <div className="text-center">
              <ClipboardCheck className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Total Quizzes</p>
              {isLoadingTotalQuizzes || authLoading ? (
                <p className="text-xl font-bold">...</p>
              ) : (
                <p className="text-xl font-bold">{totalQuizAttempts}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Streak History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStreakHistory || authLoading ? (
              <p className="text-center text-muted-foreground">Loading...</p>
            ) : formattedStreakHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={formattedStreakHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="streak" stroke="#ffc658" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground">No streak history available yet. Complete a lesson to start your streak!</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Dashboard;