"use client";

import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Atom, FlaskConical, Brain } from 'lucide-react';
import { AuthContext } from '@/context/AuthContext'; // Corrected import path
import { useQuery } from '@tanstack/react-query';
import { fetchSiteMetric } from '@/utils/supabaseUtils';
import { courses as allCourses } from '@/utils/courseContent'; // Import all courses

const HomePage = () => {
  const { session, loading: authLoading } = useContext(AuthContext);

  const { data: studentsHelped = 0, isLoading: isLoadingStudentsHelped } = useQuery({
    queryKey: ['studentsHelped'],
    queryFn: () => fetchSiteMetric('students_helped'),
  });

  // Take the first 3 courses to display as featured
  const featuredCourses = allCourses.slice(0, 3);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-xl">
        <img src="/logo.png" alt="Luvoro Labs Logo" className="h-24 w-24 mx-auto mb-6" />
        <h1 className="text-5xl font-extrabold mb-4">Welcome to Luvoro Labs</h1>
        <p className="text-xl max-w-3xl mx-auto mb-8">
          Unlock your potential with interactive AP courses, engaging simulations, and personalized learning paths.
          Prepare for success, one lesson at a time.
        </p>
        <div className="flex justify-center space-x-4">
          {session ? (
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <Link to="/auth">Login / Sign Up</Link>
            </Button>
          )}
          {/* Removed the "Explore Courses" button from here */}
        </div>
      </section>

      {/* Students Helped Metric */}
      <section className="text-center">
        <Card className="w-full max-w-md mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Users className="text-purple-500" /> Students Helped
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStudentsHelped ? (
              <p className="text-center text-muted-foreground">Loading...</p>
            ) : (
              <p className="text-6xl font-extrabold text-center text-purple-600">{studentsHelped.toLocaleString()}</p>
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
            <Card key={course.id} className="flex flex-col shadow-sm">
              <CardHeader className="flex-row items-center space-x-4 pb-2">
                {course.icon}
                <CardTitle>{course.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription>{course.description}</CardDescription>
              </CardContent>
              <div className="p-6 pt-0">
                <Button asChild className="w-full">
                  <Link to={course.link}>View Course</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button asChild size="lg" variant="outline">
            <Link to="/courses">View All Courses</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;