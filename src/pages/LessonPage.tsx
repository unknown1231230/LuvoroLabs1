"use client";

import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { markLessonAsCompleted, updateUserStreak } from '@/utils/supabaseUtils';
import { AuthContext } from '@/App';
import { findLessonById, findNextLessonPath } from '@/utils/courseContent.tsx';
import { useQueryClient } from '@tanstack/react-query'; // Import useQueryClient

const LessonPage = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // Initialize useQueryClient
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, boolean>>({});
  const [allQuestionsCorrect, setAllQuestionsCorrect] = useState(false);
  const [isLessonMarkedComplete, setIsLessonMarkedComplete] = useState(false);
  const [isCompletingLesson, setIsCompletingLesson] = useState(false);

  // Assuming courseId is 'ap-physics' for now, as per the routing structure
  const courseId = 'ap-physics';
  const lesson = findLessonById(courseId, lessonId || '');

  useEffect(() => {
    if (lesson && user) {
      const allCorrect = lesson.questions?.every(q => submittedAnswers[q.id] && selectedAnswers[q.id] === q.correctAnswer);
      setAllQuestionsCorrect(!!allCorrect);
    }
  }, [selectedAnswers, submittedAnswers, lesson, user]);

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
    setSubmittedAnswers((prev) => ({ ...prev, [questionId]: false }));
  };

  const handleSubmitAnswer = (questionId: string, correctAnswer: string) => {
    if (selectedAnswers[questionId]) {
      setSubmittedAnswers((prev) => ({ ...prev, [questionId]: true }));
      if (selectedAnswers[questionId] === correctAnswer) {
        showSuccess("Correct answer!");
      } else {
        showError("Incorrect answer. Try again!");
      }
    } else {
      showError("Please select an answer before submitting.");
    }
  };

  const handleCompleteLesson = async () => {
    if (!user) {
      showError("You must be logged in to complete lessons.");
      return;
    }
    if (!allQuestionsCorrect) {
      showError("Please answer all questions correctly before completing the lesson.");
      return;
    }

    setIsCompletingLesson(true);
    const success = await markLessonAsCompleted(user.id, courseId, lessonId!);
    if (success) {
      await updateUserStreak(user.id);
      queryClient.invalidateQueries({ queryKey: ['userStreak', user.id] }); // Invalidate streak query
      setIsLessonMarkedComplete(true);
      showSuccess("Lesson completed and streak updated!");

      const nextLessonPath = findNextLessonPath(lessonId!, courseId);
      if (nextLessonPath) {
        setTimeout(() => navigate(nextLessonPath), 1500);
      } else {
        setTimeout(() => navigate(`/courses/${courseId}`), 1500);
      }
    }
    setIsCompletingLesson(false);
  };

  return (
    <div className="space-y-8">
      <Button variant="outline" asChild className="mb-4">
        <Link to="/courses/ap-physics">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to AP Physics 1
        </Link>
      </Button>

      <h1 className="text-4xl font-bold text-center text-primary">{lesson.title}</h1>
      <div className="prose dark:prose-invert max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: lesson.content || '' }} />

      {lesson.questions && lesson.questions.length > 0 && (
        <>
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
                    disabled={!selectedAnswers[q.id] || submittedAnswers[q.id]}
                  >
                    {submittedAnswers[q.id] ? "Answer Submitted" : "Submit Answer"}
                  </Button>
                  {submittedAnswers[q.id] && (
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
        </>
      )}


      {user && allQuestionsCorrect && !isLessonMarkedComplete && (
        <div className="text-center mt-8">
          <Button onClick={handleCompleteLesson} disabled={isCompletingLesson}>
            {isCompletingLesson ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Completing...
              </>
            ) : (
              "Complete Lesson"
            )}
          </Button>
        </div>
      )}
      {isLessonMarkedComplete && (
        <div className="text-center mt-8 text-green-600 font-semibold flex items-center justify-center gap-2">
          <CheckCircle className="h-5 w-5" /> Lesson Completed!
        </div>
      )}
    </div>
  );
};

export default LessonPage;