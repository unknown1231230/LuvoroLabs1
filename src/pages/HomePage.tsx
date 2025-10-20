"use client";

import React, { useContext } from 'react'; // Explicitly import React
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Atom, FlaskConical, Brain, Rocket } from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { fetchSiteMetric } from '@/utils/supabaseUtils';
import { courses as allCourses } from '@/utils/courseContent';

const HomePage = () => {
  const { session, loading: authLoading } = useContext(AuthContext);

  const { data: siteViews = 0, isLoading: isLoadingSiteViews } = useQuery({
    queryKey: ['siteViews'],
    queryFn: () => fetchSiteMetric('site_views'),
  });

  const featuredCourses = allCourses.slice(0, 3);

  return (
    <React.Fragment>
      <div className="space-y-12">
        {/* Hero Section */}
        <section className="text-center py-16 bg-transparent text-foreground rounded-lg">
          <Rocket className="h-24 w-24 mx-auto mb-6 text-primary" />
          <h1 className="text-5xl font-extrabold mb-4 text-foreground">Launch Your Learning Journey</h1>
          <p className="text-xl max-w-3xl mx-auto mb-8 text-muted-foreground">
            Welcome to Luvoro Labs, your launchpad for mastering AP subjects. Dive into
            interactive lessons, track your progress, and achieve academic excellence.
          </p>
          <div className="flex justify-center space-x-4">
            {session ? (
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/auth">
                  <>
                    Explore Courses <BookOpen className="ml-2 h-4 w-4" />
                  </>
                </Link>
              </Button>
            )}
          </div>
        </section>

        {/* Students Helped Metric */}
        <section className="text-center">
          <Card className="w-full max-w-md mx-auto shadow-lg bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2 text-2xl text-purpleAccent-foreground">
                <Users className="text-purpleAccent-foreground" /> Site Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingSiteViews ? (
                <p className="text-center text-muted-foreground">Loading...</p>
              ) : (
                <p className="text-6xl font-extrabold text-center text-purpleAccent">{siteViews.toLocaleString()}</p>
              )}
              <p className="text-center text-muted-foreground mt-2">Join our growing community of learners!</p>
            </CardContent>
          </Card>
        </section>

        {/* Featured Courses Section */}
        <section className="space-y-8">
          <h2 className="text-4xl font-bold text-center text-primary">Our Courses</h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto">
            Get started with our most popular AP courses, designed for deep understanding and exam readiness.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map((course) => (
              <Card key={course.id} className="flex flex-col shadow-sm bg-card border-border">
                <CardHeader className="flex-row items-center space-x-4 pb-2">
                  {course.icon}
                  <CardTitle className="text-foreground">{course.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription className="text-muted-foreground">{course.description}</CardDescription>
                </CardContent>
                <div className="p-6 pt-0">
                  {course.isComingSoon ? (
                    <Button className="w-full" disabled>
                      Coming Soon
                    </Button>
                  ) : (
                    <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                      <Link to={course.link!}>View Course</Link>
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild size="lg" variant="outline" className="text-foreground hover:text-primary border-border">
              <Link to="/courses">View All Courses</Link>
            </Button>
          </div>
        </section>
      </div>
    </React.Fragment>
  );
};

export default HomePage;