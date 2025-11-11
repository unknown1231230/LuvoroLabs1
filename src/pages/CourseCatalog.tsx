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
    <div className="space-y-16">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gradient mb-4 float-animation">Course Catalog</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover a variety of AP courses designed to help you excel in your studies and prepare for college-level exams.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => (
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
                    View Course
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CourseCatalog;