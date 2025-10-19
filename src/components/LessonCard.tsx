"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, CheckCircle2 } from 'lucide-react'; // Import CheckCircle2
import { cn } from '@/lib/utils'; // Import cn utility

interface LessonCardProps {
  lessonId: string;
  title: string;
  description: string;
  link: string;
  isCompleted?: boolean; // New prop
}

const LessonCard: React.FC<LessonCardProps> = ({ lessonId, title, description, link, isCompleted = false }) => {
  return (
    <Card className={cn("flex flex-col shadow-sm", isCompleted && "border-green-500 ring-2 ring-green-500")}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <PlayCircle className="h-5 w-5 text-primary" />
          )}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription>{description}</CardDescription>
      </CardContent>
      <div className="p-6 pt-0">
        <Button asChild className="w-full" variant={isCompleted ? "secondary" : "default"}>
          <Link to={link}>
            {isCompleted ? "Review Lesson" : "Start Lesson"}
          </Link>
        </Button>
      </div>
    </Card>
  );
};

export default LessonCard;