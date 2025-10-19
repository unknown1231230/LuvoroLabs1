"use client";

import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { markLessonAsCompleted, updateUserStreak, fetchUserQuizAttempts, fetchUserLessonProgress } from '@/utils/supabaseUtils';
import { AuthContext } from '@/context/AuthContext'; // Updated import
import { findLessonById, findNextLessonPath } from '@/utils/courseContent.tsx';
import { useQueryClient } from '@tanstack/react-query';
import Kinematics1DSimulation from '@/components/simulations/Kinematics1DSimulation';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const LessonPage = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, { answer: string; isCorrect: boolean }>>({});
  const [allQuestionsAttempted, setAllQuestionsAttempted] = useState(false);
  const [isLessonMarkedComplete, setIsLessonMarkedComplete] = useState(false);
  const [isCompletingLesson, setIsCompletingLesson] = useState(false);
  const [lessonScore, setLessonScore] = useState<{ correct: number; total: number } | null>(null);

  const courseId = 'ap-physics';
  const lesson = findLessonById(courseId, lessonId || '');

  useEffect(() => {
    const fetchData = async () => {
      if (user && lessonId && lesson) {
        const progress = await fetchUserLessonProgress(user.id, courseId);
        const lessonIsDone = progress.includes(lessonId);
        setIsLessonMarkedComplete(lessonIsDone);

        const attempts = await fetchUserQuizAttempts(user.id, courseId, lessonId);
        
        const initialSelected: Record<string, string> = {};
        const initialSubmitted: Record<string, { answer: string; isCorrect: boolean }> = {};
        
        lesson.questions?.forEach(q => {
          const firstAttempt = attempts
            .filter(a => a.question_id === q.id)
            .sort((a, b) => new Date(a.attempted_at || 0).getTime() - new Date(b.attempted_at || 0).getTime())[0];
          
          if (firstAttempt) {
            initialSelected[q.id] = firstAttempt.selected_answer!;
            initialSubmitted[q.id] = { answer: firstAttempt.selected_answer!, isCorrect: firstAttempt.is_correct };
          }
        });
        
        setSelectedAnswers(initialSelected);
        setSubmittedAnswers(initialSubmitted);

        if (lessonIsDone) {
          const correctCount = Object.values(initialSubmitted).filter(s => s.isCorrect).length;
          const totalCount = lesson.questions?.length || 0;
          setLessonScore({ correct: correctCount, total: totalCount });
        }
      }
    };
    fetchData();
  }, [user, lessonId, courseId, lesson]);

  useEffect(() => {
    if (lesson?.questions) {
      const attemptedQuestionIds = Object.keys(submittedAnswers);
      const allAttempted = lesson.questions.every(q => attemptedQuestionIds.includes(q.id));
      setAllQuestionsAttempted(allAttempted);
    }
  }, [submittedAnswers, lesson?.questions]);

  useEffect(() => {
    const completeLesson = async () => {
      if (!user || isCompletingLesson) return;

      setIsCompletingLesson(true);
      const success = await markLessonAsCompleted(user.id, courseId, lessonId!);
      if (success) {
        const correctCount = Object.values(submittedAnswers).filter(s => s.isCorrect).length;
        const totalCount = lesson?.questions?.length || 0;
        setLessonScore({ correct: correctCount, total: totalCount });

        await updateUserStreak(user.id);
        queryClient.invalidateQueries({ queryKey: ['userStreak', user.id] });
        queryClient.invalidateQueries({ queryKey: ['userCompletedLessonsCount', user.id] });
        queryClient.invalidateQueries({ queryKey: ['userCompletedLessonIds', user.id] });
        setIsLessonMarkedComplete(true);
        showSuccess("Lesson completed and streak updated!");
      }
      setIsCompletingLesson(false);
    };

    if (allQuestionsAttempted && !isLessonMarkedComplete) {
      completeLesson();
    }
  }, [allQuestionsAttempted, isLessonMarkedComplete, isCompletingLesson, user, courseId, lessonId, lesson?.questions, queryClient, submittedAnswers]);

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
  };

  const handleSubmitAnswer = async (questionId: string, correctAnswer: string) => {
    if (!user) {
      showError("You must be logged in to submit answers.");
      return;
    }
    const selectedAnswer = selectedAnswers[questionId];
    if (selectedAnswer) {
      const isCorrect = selectedAnswer === correctAnswer;
      
      const newAttemptForSupabase = {
        user_id: user.id,
        course_id: courseId,
        lesson_id: lessonId!,
        question_id: questionId,
        is_correct: isCorrect,
        selected_answer: selectedAnswer,
      };

      const { error } = await supabase.from('user_quiz_attempts').insert(newAttemptForSupabase);

      if (error) {
        console.error("Error recording quiz attempt:", error.message);
        showError("Failed to record quiz attempt.");
        return;
      }

      setSubmittedAnswers((prev) => ({ ...prev, [questionId]: { answer: selectedAnswer, isCorrect } }));
      
      if (isCorrect) {
        showSuccess("Correct answer!");
      } else {
        showError("Incorrect answer.");
      }

      queryClient.invalidateQueries({ queryKey: ['userQuizAttempts', user.id, courseId, lessonId] });
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
      <div className="prose dark:prose-invert max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: lesson.content || '' }} />

      {lessonId === 'kinematics-1d' && <Kinematics1DSimulation />}

      <h3 className="text-xl font-semibold mt-4 mb-2">Further Learning:</h3>
      {lesson.videoUrl && lesson.videoUrl !== "ADD_YOUR_VIDEO_EMBED_URL_HERE" ? (
        <div className="aspect-video w-full max-w-2xl mx-auto shadow-md rounded-lg overflow-hidden">
          <iframe
            width="100%"
            height="100%"
            src={lesson.videoUrl}
            title={`Educational Video on ${lesson.title}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      ) : (
        <div className="aspect-video w-full max-w-2xl mx-auto bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-muted-foreground p-4 rounded-md shadow-md">
          <p className="text-center">
            <strong>Video Placeholder:</strong> Please add an embed URL for this lesson.
            <br/>
            You can edit <code>src/utils/courseContent.tsx</code> and update the <code>videoUrl</code> property for this lesson.
          </p>
        </div>
      )}

      {lesson.questions && lesson.questions.length > 0 && (
        <>
          <h2 className="text-3xl font-bold text-primary mt-10">Practice Questions</h2>
          <div className="space-y-6">
            {lesson.questions.map((q) => {
              const submission = submittedAnswers[q.id];
              const isQuestionDisabled = isLessonMarkedComplete || !!submission;
              const selectedValue = submission ? submission.answer : selectedAnswers[q.id];

              return (
                <Card key={q.id} className="shadow-sm">
                  <CardHeader>
                    <CardTitle>{q.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      onValueChange={(value) => handleAnswerChange(q.id, value)}
                      value={selectedValue}
                      className="grid gap-4"
                      disabled={isQuestionDisabled}
                    >
                      {q.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`${q.id}-${index}`} disabled={isQuestionDisabled} />
                          <Label htmlFor={`${q.id}-${index}`} className={cn(
                            isQuestionDisabled && option === q.correctAnswer && "font-bold text-green-600",
                            isQuestionDisabled && option === selectedValue && option !== q.correctAnswer && "line-through text-red-500"
                          )}>
                            {option}
                            {isQuestionDisabled && option === q.correctAnswer && <CheckCircle className="ml-2 h-4 w-4 inline text-green-500" />}
                            {isQuestionDisabled && option === selectedValue && option !== q.correctAnswer && <XCircle className="ml-2 h-4 w-4 inline text-red-500" />}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    {!isQuestionDisabled && (
                      <Button
                        onClick={() => handleSubmitAnswer(q.id, q.correctAnswer)}
                        className="mt-4"
                        disabled={!selectedAnswers[q.id]}
                      >
                        Submit Answer
                      </Button>
                    )}
                    {submission && (
                      <div className="mt-4 p-3 rounded-md flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          {submission.isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                          )}
                          <p className={submission.isCorrect ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                            {submission.isCorrect ? "Correct!" : "Incorrect."}
                          </p>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          Your answer: <span className={cn("font-bold", !submission.isCorrect && "line-through text-red-500")}>{submission.answer}</span>
                        </p>
                        <p className="text-muted-foreground text-sm">
                          Correct answer: <span className="font-bold text-green-600">{q.correctAnswer}</span>
                        </p>
                        <p className="text-muted-foreground text-sm mt-1">
                          Explanation: {q.explanation}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {isLessonMarkedComplete && (
        <div className="text-center mt-8 text-green-600 font-semibold flex flex-col items-center justify-center gap-2">
          <CheckCircle className="h-5 w-5" />
          <span>Lesson Completed!</span>
          {lessonScore && (
            <span className="text-lg mt-2">Your Score: {lessonScore.correct} / {lessonScore.total}</span>
          )}
          <div className="mt-4">
            {findNextLessonPath(lessonId!, courseId) ? (
              <Button asChild>
                <Link to={findNextLessonPath(lessonId!, courseId)!}>
                  Continue to Next Lesson
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link to={`/courses/${courseId}`}>
                  Back to Course Overview
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonPage;