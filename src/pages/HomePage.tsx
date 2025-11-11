"use client";

import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Atom, FlaskConical, Brain, Sparkles, TrendingUp, Award } from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { fetchSiteMetric } from '@/utils/supabaseUtils';
import { courses as allCourses } from '@/utils/courseContent';
import AnimatedRocket from '@/components/AnimatedRocket';

const HomePage = () => {
  const { session, loading: authLoading } = useContext(AuthContext);

  const { data: siteSignUps = 0, isLoading: isLoadingSiteSignUps } = useQuery({
    queryKey: ['siteSignUps'],
    queryFn: () => fetchSiteMetric('site_sign_ups'),
  });

  const featuredCourses = allCourses.slice(0, 3);

  return (
    <React.Fragment>
      <div className="space-y-16">
        {/* Hero Section */}
        <section className="text-center py-20 relative overflow-hidden">
          <div className="absolute inset-0 animated-gradient-bg opacity-10"></div>
          <div className="relative z-10">
            <AnimatedRocket />
            <h1 className="text-6xl font-extrabold mb-6 text-gradient float-animation">
              Launch Your Learning Journey
            </h1>
            <p className="text-xl max-w-3xl mx-auto mb-10 text-muted-foreground leading-relaxed">
              Welcome to Luvoro Labs, your launchpad for mastering AP subjects. Dive into
              interactive lessons, track your progress, and achieve academic excellence.
            </p>
            <div className="flex justify-center space-x-6">
              {session ? (
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 enhanced-button glow px-8 py-4 text-lg btn-hover-fix"
                >
                  <Link to="/dashboard">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Go to Dashboard
                  </Link>
                </Button>
              ) : (
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 enhanced-button glow px-8 py-4 text-lg btn-hover-fix"
                >
                  <Link to="/auth">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Explore Courses
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="enhanced-card text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gradient">Community</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingSiteSignUps ? (
                <p className="text-center text-muted-foreground">Loading...</p>
              ) : (
                <p className="text-4xl font-bold text-primary">{siteSignUps.toLocaleString()}</p>
              )}
              <p className="text-muted-foreground mt-2">Active Learners</p>
            </CardContent>
          </Card>

          <Card className="enhanced-card text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gradient">Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">{allCourses.length}</p>
              <p className="text-muted-foreground mt-2">AP Subjects</p>
            </CardContent>
          </Card>

          <Card className="enhanced-card text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gradient">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">95%</p>
              <p className="text-muted-foreground mt-2">Student Satisfaction</p>
            </CardContent>
          </Card>
        </section>

        {/* Featured Courses Section */}
        <section className="space-y-12">
          <div className="text-center">
            <h2 className="text-5xl font-bold text-gradient mb-4">Our Courses</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started with our most popular AP courses, designed for deep understanding and exam readiness.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map((course, index) => (
              <Card key={course.id} className="enhanced-card group">
                <CardHeader className="text-center">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    {course.icon}
                  </div>
                  <CardTitle className="text-xl text-gradient">{course.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-muted-foreground mb-6 leading-relaxed">
                    {course.description}
                  </CardDescription>
                  {course.isComingSoon ? (
                    <Button className="w-full enhanced-button" disabled>
                      Coming Soon
                    </Button>
                  ) : (
                    <Button 
                      asChild 
                      className="w-full enhanced-button glow bg-primary text-primary-foreground hover:bg-primary/90 btn-hover-fix"
                    >
                      <Link to={course.link!}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        View Course
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Button 
              asChild 
              size="lg" 
              variant="outline" 
              className="enhanced-button border-2 hover:border-primary hover:bg-primary/10 px-8 py-3 btn-outline-hover-fix"
            >
              <Link to="/courses">
                <BookOpen className="mr-2 h-5 w-5" />
                View All Courses
              </Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="space-y-12 py-16">
          <div className="text-center">
            <h2 className="text-5xl font-bold text-gradient mb-4">Why Choose Luvoro Labs?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience learning reimagined with cutting-edge features designed for your success.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold">AI-Powered Learning</h3>
              <p className="text-muted-foreground">Get instant feedback on your answers with our advanced AI grading system.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Progress Tracking</h3>
              <p className="text-muted-foreground">Monitor your learning journey with detailed analytics and streak tracking.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                <FlaskConical className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Interactive Simulations</h3>
              <p className="text-muted-foreground">Learn by doing with hands-on physics simulations and experiments.</p>
            </div>
          </div>
        </section>
      </div>
    </React.Fragment>
  );
};

export default HomePage;