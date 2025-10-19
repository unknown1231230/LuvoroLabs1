"use client";

import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BookOpen, Lightbulb, FlaskConical, Rocket, CheckCircle2 } from 'lucide-react';
import LessonCard from '@/components/LessonCard';
import { AuthContext } from '@/App'; // Import AuthContext
import { fetchUserLessonProgress } from '@/utils/supabaseUtils'; // Import utility

const APPhysicsCourse = () => {
  const { user } = useContext(AuthContext);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const navigate = useNavigate();

  const courseId = 'ap-physics'; // Define courseId for this page

  const modules = [
    {
      id: 'kinematics',
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
      id: 'dynamics',
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
      id: 'work-energy-power',
      title: "Module 3: Work, Energy, and Power",
      description: "Understand concepts of work, kinetic energy, potential energy, conservation of energy, and power.",
      icon: <Lightbulb className="h-5 w-5" />,
      lessons: [], // Placeholder for future lessons
    },
    {
      id: 'rotational-motion',
      title: "Module 4: Rotational Motion",
      description: "Learn about rotational kinematics, torque, angular momentum, and rotational kinetic energy.",
      icon: <BookOpen className="h-5 w-5" />,
      lessons: [], // Placeholder for future lessons
    },
  ];

  useEffect(() => {
    const getProgress = async () => {
      if (user) {
        const progress = await fetchUserLessonProgress(user.id, courseId);
        setCompletedLessons(progress);
      } else {
        setCompletedLessons([]); // Clear progress if not logged in
      }
    };
    getProgress();
  }, [user, courseId]);

  const isLessonCompleted = (lessonId: string) => completedLessons.includes(lessonId);

  const isModuleCompleted = (moduleLessons: typeof modules[0]['lessons']) => {
    if (!moduleLessons || moduleLessons.length === 0) return false; // A module with no lessons isn't "completed"
    return moduleLessons.every(lesson => isLessonCompleted(lesson.id));
  };

  const handleNextModule = (nextModuleId: string) => {
    // In a real app, you might navigate to the first lesson of the next module
    // For now, we'll just show a success message or navigate to the course overview
    showSuccess(`Proceeding to ${nextModuleId}!`);
    // Example: navigate to the first lesson of the next module if it exists
    const nextModule = modules.find(m => m.id === nextModuleId);
    if (nextModule && nextModule.lessons.length > 0) {
      navigate(nextModule.lessons[0].link);
    }
  };

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
        {modules.map((module, index) => {
          const currentModuleCompleted = isModuleCompleted(module.lessons);
          const previousModule = modules[index - 1];
          const previousModuleCompleted = previousModule ? isModuleCompleted(previousModule.lessons) : true; // First module is always "unlocked" by default

          // Module is unlocked if the previous module is completed
          const isModuleUnlocked = user ? previousModuleCompleted : false; // Only unlocked if logged in and previous module complete

          return (
            <Card key={module.id} className={!isModuleUnlocked && user ? "opacity-50" : ""}>
              <CardHeader className="flex-row items-center space-x-3">
                {module.icon}
                <CardTitle>{module.title}</CardTitle>
                {currentModuleCompleted && <CheckCircle2 className="h-5 w-5 text-green-500 ml-2" />}
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{module.description}</p>
                {user ? (
                  isModuleUnlocked ? (
                    module.lessons && module.lessons.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {module.lessons.map((lesson) => (
                          <LessonCard
                            key={lesson.id}
                            lessonId={lesson.id}
                            title={lesson.title}
                            description={lesson.description}
                            link={lesson.link}
                            isCompleted={isLessonCompleted(lesson.id)}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground mt-4">Lessons for this module are coming soon!</p>
                    )
                  ) : (
                    <p className="text-muted-foreground mt-4">Complete the previous module to unlock this one.</p>
                  )
                ) : (
                  <p className="text-muted-foreground mt-4">Login to start this module.</p>
                )}

                {user && currentModuleCompleted && index < modules.length - 1 && (
                  <div className="mt-6 text-center">
                    <Button onClick={() => handleNextModule(modules[index + 1].id)}>
                      Go to {modules[index + 1].title}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center mt-8 text-muted-foreground">
        More modules and detailed content coming soon!
      </div>
    </div>
  );
};

export default APPhysicsCourse;