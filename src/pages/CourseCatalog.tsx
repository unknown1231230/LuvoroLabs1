"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FlaskConical, Brain, Atom } from 'lucide-react';

const CourseCatalog = () => {
  const courses = [
    {
      id: 'ap-physics',
      title: 'AP Physics 1',
      description: 'Explore the fundamental principles of physics, including Newtonian mechanics, work, energy, power, and simple harmonic motion.',
      icon: <Atom className="h-6 w-6 text-blue-500" />,
      link: '/courses/ap-physics',
      isComingSoon: false,
    },
    {
      id: 'ap-chemistry',
      title: 'AP Chemistry',
      description: 'Dive into the world of atoms, molecules, and chemical reactions. Covers topics like stoichiometry, thermodynamics, and kinetics.',
      icon: <FlaskConical className="h-6 w-6 text-green-500" />,
      link: null, // No active link for now
      isComingSoon: true,
    },
    {
      id: 'ap-biology',
      title: 'AP Biology',
      description: 'Study the science of life, from molecular biology to ecology. Understand biological processes and their impact on living organisms.',
      icon: <Brain className="h-6 w-6 text-purple-500" />,
      link: null, // No active link for now
      isComingSoon: true,
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-center text-primary">Course Catalog</h1>
      <p className="text-center text-muted-foreground max-w-2xl mx-auto">
        Discover a variety of AP courses designed to help you excel in your studies and prepare for college-level exams.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="flex flex-col shadow-sm">
            <CardHeader className="flex-row items-center space-x-4 pb-2">
              {course.icon}
              <CardTitle>{course.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>{course.description}</CardDescription>
            </CardContent>
            <div className="p-6 pt-0">
              {course.isComingSoon ? (
                <Button className="w-full" disabled>
                  Coming Soon
                </Button>
              ) : (
                <Button asChild className="w-full">
                  <Link to={course.link!}>View Course</Link>
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CourseCatalog;