"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BookOpen, Lightbulb, FlaskConical, Rocket } from 'lucide-react';
import LessonCard from '@/components/LessonCard'; // Import the new LessonCard component

const APPhysicsCourse = () => {
  const modules = [
    {
      title: "Module 1: Kinematics",
      description: "Study motion in one and two dimensions, including displacement, velocity, acceleration, and projectile motion.",
      icon: <Rocket className="h-5 w-5" />,
      lessons: [
        {
          id: 'kinematics-1d',
          title: 'Lesson 1.1: Introduction to 1D Kinematics',
          description: 'Understand position, displacement, velocity, speed, and acceleration in one dimension.',
          link: '/courses/ap-physics/lessons/kinematics-1d',
        },
        {
          id: 'kinematics-2d',
          title: 'Lesson 1.2: 2D Motion & Projectiles',
          description: 'Analyze motion in two dimensions, focusing on projectile motion.',
          link: '/courses/ap-physics/lessons/kinematics-2d',
        },
        {
          id: 'relative-velocity',
          title: 'Lesson 1.3: Relative Velocity',
          description: 'Explore how velocities are perceived from different frames of reference.',
          link: '/courses/ap-physics/lessons/relative-velocity', // Placeholder
        },
      ],
    },
    {
      title: "Module 2: Dynamics",
      description: "Explore Newton's Laws of Motion, forces, friction, and applications of dynamics.",
      icon: <FlaskConical className="h-5 w-5" />,
      lessons: [
        {
          id: 'newtons-laws',
          title: 'Lesson 2.1: Newton\'s Laws of Motion',
          description: 'Learn about inertia, F=ma, and action-reaction pairs.',
          link: '/courses/ap-physics/lessons/newtons-laws', // Placeholder
        },
        {
          id: 'friction',
          title: 'Lesson 2.2: Friction and Forces',
          description: 'Understand static and kinetic friction, and apply force concepts.',
          link: '/courses/ap-physics/lessons/friction', // Placeholder
        },
      ],
    },
    {
      title: "Module 3: Work, Energy, and Power",
      description: "Understand concepts of work, kinetic energy, potential energy, conservation of energy, and power.",
      topics: ["Work-Energy Theorem", "Conservation of Energy", "Power"],
      icon: <Lightbulb className="h-5 w-5" />,
      lessons: [], // Placeholder for future lessons
    },
    {
      title: "Module 4: Rotational Motion",
      description: "Learn about rotational kinematics, torque, angular momentum, and rotational kinetic energy.",
      topics: ["Angular Kinematics", "Torque", "Angular Momentum"],
      icon: <BookOpen className="h-5 w-5" />,
      lessons: [], // Placeholder for future lessons
    },
  ];

  return (
    <div className="space-y-8">
      <Button variant="outline" asChild className="mb-4">
        <Link to="/courses">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Course Catalog
        </Link>
      </Button>

      <h1 className="text-4xl font-bold text-center text-primary">AP Physics 1</h1>
      <p className="text-center text-muted-foreground max-w-2xl mx-auto">
        This course covers the foundational principles of physics, preparing you for the AP Physics 1 exam.
        Dive into interactive lessons, practice problems, and simulated labs.
      </p>

      <div className="space-y-8">
        {modules.map((module, index) => (
          <Card key={index}>
            <CardHeader className="flex-row items-center space-x-3">
              {module.icon}
              <CardTitle>{module.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{module.description}</p>
              {module.lessons && module.lessons.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {module.lessons.map((lesson) => (
                    <LessonCard
                      key={lesson.id}
                      lessonId={lesson.id}
                      title={lesson.title}
                      description={lesson.description}
                      link={lesson.link}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground mt-4">Lessons for this module are coming soon!</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-8 text-muted-foreground">
        More modules and detailed content coming soon!
      </div>
    </div>
  );
};

export default APPhysicsCourse;