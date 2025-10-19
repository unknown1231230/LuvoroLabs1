"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';

interface LessonCardProps {
  lessonId: string;
  title: string;
  description: string;
  link: string;
}

const LessonCard: React.FC<LessonCardProps> = ({ lessonId, title, description, link }) => {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlayCircle className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription>{description}</CardDescription>
      </CardContent>
      <div className="p-6 pt-0">
        <Button asChild className="w-full">
          <Link to={link}>Start Lesson</Link>
        </Button>
      </div>
    </Card>
  );
};

export default LessonCard;