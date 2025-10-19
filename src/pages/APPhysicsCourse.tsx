"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BookOpen, Lightbulb, FlaskConical, Rocket } from 'lucide-react';

const APPhysicsCourse = () => {
  const modules = [
    {
      title: "Module 1: Kinematics",
      description: "Study motion in one and two dimensions, including displacement, velocity, acceleration, and projectile motion.",
      topics: ["1D Motion", "2D Motion & Projectiles", "Relative Velocity"],
      icon: <Rocket className="h-5 w-5" />,
    },
    {
      title: "Module 2: Dynamics",
      description: "Explore Newton's Laws of Motion, forces, friction, and applications of dynamics.",
      topics: ["Newton's Laws", "Friction", "Free-Body Diagrams"],
      icon: <FlaskConical className="h-5 w-5" />,
    },
    {
      title: "Module 3: Work, Energy, and Power",
      description: "Understand concepts of work, kinetic energy, potential energy, conservation of energy, and power.",
      topics: ["Work-Energy Theorem", "Conservation of Energy", "Power"],
      icon: <Lightbulb className="h-5 w-5" />,
    },
    {
      title: "Module 4: Rotational Motion",
      description: "Learn about rotational kinematics, torque, angular momentum, and rotational kinetic energy.",
      topics: ["Angular Kinematics", "Torque", "Angular Momentum"],
      icon: <BookOpen className="h-5 w-5" />,
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((module, index) => (
          <Card key={index}>
            <CardHeader className="flex-row items-center space-x-3">
              {module.icon}
              <CardTitle>{module.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{module.description}</p>
              <h3 className="font-semibold mb-2">Key Topics:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {module.topics.map((topic, topicIndex) => (
                  <li key={topicIndex}>{topic}</li>
                ))}
              </ul>
              <Button variant="secondary" className="mt-4 w-full">Start Module</Button>
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