"use client";

import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import LessonCard from '@/components/LessonCard';
import { AuthContext } from '@/App';
import { fetchUserLessonProgress } from '@/utils/supabaseUtils';
import { courses, findCourseById } from '@/utils/courseContent'; // Import courses and findCourseById

const APPhysicsCourse = () => {
  const { user } = useContext(AuthContext);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const navigate = useNavigate();

  const courseId = 'ap-physics';
  const apPhysicsCourse = findCourseById(courseId);

  if (!apPhysicsCourse) {
    return (
      <div className="text-center py-10">
        <h1 className="text-3xl font-bold text-destructive">Course Not Found</h1>
        <p className="text-muted-foreground mt-2">The AP Physics 1 course data could not be loaded.</p>
        <Button asChild className="mt-4">
          <Link to="/courses">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Course Catalog
          </Link>
        </Button>
      </div>
    );
  }

  const modules = apPhysicsCourse.modules; // Use modules from centralized data

  useEffect(() => {
    const getProgress = async () => {
      if (user) {
        const progress = await fetchUserLessonProgress(user.id, courseId);
        setCompletedLessons(progress);
      } else {
        setCompletedLessons([]);
      }
    };
    getProgress();
  }, [user, courseId]);

  const isLessonCompleted = (lessonId: string) => completedLessons.includes(lessonId);

  const isModuleCompleted = (moduleLessons: typeof modules[0]['lessons']) => {
    if (!moduleLessons || moduleLessons.length === 0) return false;
    return moduleLessons.every(lesson => isLessonCompleted(lesson.id));
  };

  // This function is no longer strictly needed for navigation, as LessonPage handles it.
  // Keeping it for potential future use or if a user wants to manually jump to next module.
  const handleNextModule = (nextModuleId: string) => {
    const nextModule = modules.find(m => m.id === nextModuleId);
    if (nextModule && nextModule.lessons.length > 0) {
      navigate(nextModule.lessons[0].link);
    } else {
      navigate(apPhysicsCourse.link); // Go back to course overview if no lessons in next module
    }
  };

  return (
    <div className="space-y-8">
      <Button variant="outline" asChild className="mb-4">
        <Link to="/courses">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Course Catalog
        </Link>
      </Button>

      <h1 className="text-4xl font-bold text-center text-primary">{apPhysicsCourse.title}</h1>
      <p className="text-center text-muted-foreground max-w-2xl mx-auto">
        {apPhysicsCourse.description}
        Dive into interactive lessons, practice problems, and simulated labs.
      </p>

      <div className="space-y-8">
        {modules.map((module, index) => {
          const currentModuleCompleted = isModuleCompleted(module.lessons);
          const previousModule = modules[index - 1];
          const previousModuleCompleted = previousModule ? isModuleCompleted(previousModule.lessons) : true;

          const isModuleUnlocked = user ? previousModuleCompleted : false;

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