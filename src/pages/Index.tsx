import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { BarChart, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar } from 'recharts';
import { Flame, Trophy, Lightbulb } from 'lucide-react';

const Index = () => {
  // Mock data for demonstration
  const userProgress = 75;
  const completedLessons = 12;
  const currentStreak = 5;
  const achievementsUnlocked = 3;
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

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Flame className="text-orange-500" />Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-extrabold text-center text-orange-600">{currentStreak} Days</p>
            <p className="text-center text-muted-foreground mt-2">Keep up the great work!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Trophy className="text-yellow-500" />Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-extrabold text-center text-yellow-600">{achievementsUnlocked}</p>
            <p className="text-center text-muted-foreground mt-2">Unlocked so far!</p>
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

      <MadeWithDyad />
    </div>
  );
};

export default Index;