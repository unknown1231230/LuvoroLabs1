"use client";

import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

// Mock lesson data - in a real app, this would come from a database or API
const lessonData = {
  'kinematics-1d': {
    title: 'Introduction to 1D Kinematics',
    content: `
      <p>Kinematics is the branch of classical mechanics that describes the motion of points, bodies (objects), and systems of bodies without considering the forces that cause them to move. In one-dimensional (1D) kinematics, we focus on motion along a straight line.</p>
      <h3 class="text-xl font-semibold mt-4 mb-2">Key Concepts:</h3>
      <ul class="list-disc list-inside space-y-1">
        <li><strong>Position:</strong> The location of an object relative to a reference point.</li>
        <li><strong>Displacement:</strong> The change in position of an object. It is a vector quantity.</li>
        <li><strong>Distance:</strong> The total path length covered by an object. It is a scalar quantity.</li>
        <li><strong>Velocity:</strong> The rate at which an object changes its position. It is a vector quantity (speed with direction).</li>
        <li><strong>Speed:</strong> The magnitude of velocity. It is a scalar quantity.</li>
        <li><strong>Acceleration:</strong> The rate at which an object changes its velocity. It is a vector quantity.</li>
      </ul>
      <h3 class="text-xl font-semibold mt-4 mb-2">Equations of Motion (Constant Acceleration):</h3>
      <ul class="list-disc list-inside space-y-1">
        <li>v = v₀ + at</li>
        <li>Δx = v₀t + ½at²</li>
        <li>v² = v₀² + 2aΔx</li>
        <li>Δx = (v₀ + v)/2 * t</li>
      </ul>
      <p class="mt-4">Where: v = final velocity, v₀ = initial velocity, a = acceleration, t = time, Δx = displacement.</p>
    `,
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'Which of the following is a scalar quantity?',
        options: ['Displacement', 'Velocity', 'Speed', 'Acceleration'],
        correctAnswer: 'Speed',
        explanation: 'Speed is the magnitude of velocity and does not include direction, making it a scalar quantity. Displacement, velocity, and acceleration are vector quantities as they have both magnitude and direction.',
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        question: 'An object moves from position x=5m to x=15m. What is its displacement?',
        options: ['10m', '-10m', '20m', '5m'],
        correctAnswer: '10m',
        explanation: 'Displacement is the final position minus the initial position. So, 15m - 5m = 10m.',
      },
    ],
  },
  // Add more lesson data here for other lessons
  'kinematics-2d': {
    title: '2D Motion & Projectiles',
    content: `
      <p>Two-dimensional kinematics extends the concepts of 1D motion to motion in a plane. This is particularly useful for analyzing projectile motion, where an object moves under the influence of gravity alone.</p>
      <h3 class="text-xl font-semibold mt-4 mb-2">Projectile Motion:</h3>
      <p>Projectile motion is the motion of an object thrown or projected into the air, subject only to the acceleration of gravity. The key is to treat horizontal and vertical motions independently.</p>
      <ul class="list-disc list-inside space-y-1">
        <li><strong>Horizontal Motion:</strong> Constant velocity (assuming no air resistance). a_x = 0.</li>
        <li><strong>Vertical Motion:</strong> Constant acceleration due to gravity (a_y = -9.8 m/s²).</li>
      </ul>
      <p class="mt-4">The time an object spends in the air is determined by its vertical motion, and this time is the same for both horizontal and vertical components.</p>
    `,
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'In projectile motion, neglecting air resistance, what is true about the horizontal velocity?',
        options: ['It constantly increases', 'It constantly decreases', 'It remains constant', 'It changes direction'],
        correctAnswer: 'It remains constant',
        explanation: 'Without air resistance, there are no horizontal forces acting on the projectile, so its horizontal velocity remains constant.',
      },
    ],
  },
};

const LessonPage = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState<Record<string, boolean>>({});

  const lesson = lessonData[lessonId as keyof typeof lessonData];

  if (!lesson) {
    return (
      <div className="text-center py-10">
        <h1 className="text-3xl font-bold text-destructive">Lesson Not Found</h1>
        <p className="text-muted-foreground mt-2">The lesson you are looking for does not exist.</p>
        <Button asChild className="mt-4">
          <Link to="/courses/ap-physics">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to AP Physics 1
          </Link>
        </Button>
      </div>
    );
  }

  const handleAnswerChange = (questionId: string, value: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: value }));
    setShowResults((prev) => ({ ...prev, [questionId]: false })); // Hide result if answer changes
  };

  const handleSubmitAnswer = (questionId: string, correctAnswer: string) => {
    if (selectedAnswers[questionId]) {
      setShowResults((prev) => ({ ...prev, [questionId]: true }));
      if (selectedAnswers[questionId] === correctAnswer) {
        showSuccess("Correct answer!");
      } else {
        showError("Incorrect answer. Try again!");
      }
    } else {
      showError("Please select an answer before submitting.");
    }
  };

  return (
    <div className="space-y-8">
      <Button variant="outline" asChild className="mb-4">
        <Link to="/courses/ap-physics">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to AP Physics 1
        </Link>
      </Button>

      <h1 className="text-4xl font-bold text-center text-primary">{lesson.title}</h1>
      <div className="prose dark:prose-invert max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: lesson.content }} />

      <h2 className="text-3xl font-bold text-primary mt-10">Practice Questions</h2>
      <div className="space-y-6">
        {lesson.questions.map((q) => (
          <Card key={q.id}>
            <CardHeader>
              <CardTitle>{q.question}</CardTitle>
            </CardHeader>
            <CardContent>
              {q.type === 'multiple-choice' && (
                <RadioGroup
                  onValueChange={(value) => handleAnswerChange(q.id, value)}
                  value={selectedAnswers[q.id]}
                  className="grid gap-4"
                >
                  {q.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`${q.id}-${index}`} />
                      <Label htmlFor={`${q.id}-${index}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
              <Button
                onClick={() => handleSubmitAnswer(q.id, q.correctAnswer)}
                className="mt-4"
                disabled={!selectedAnswers[q.id]}
              >
                Submit Answer
              </Button>
              {showResults[q.id] && (
                <div className="mt-4 p-3 rounded-md flex items-start gap-2">
                  {selectedAnswers[q.id] === q.correctAnswer ? (
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  )}
                  <p className={selectedAnswers[q.id] === q.correctAnswer ? "text-green-600" : "text-red-600"}>
                    {selectedAnswers[q.id] === q.correctAnswer ? "Correct!" : "Incorrect."}
                    <span className="block text-muted-foreground text-sm mt-1">{q.explanation}</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LessonPage;