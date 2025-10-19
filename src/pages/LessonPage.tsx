"use client";

import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { markLessonAsCompleted, updateUserStreak, fetchUserQuizAttempts, fetchUserLessonProgress } from '@/utils/supabaseUtils';
import { AuthContext } from '@/App';
import { findLessonById, findNextLessonPath } from '@/utils/courseContent.tsx';
import { useQueryClient } from '@tanstack/react-query';
import Kinematics1DSimulation from '@/components/simulations/Kinematics1DSimulation'; // Import the new simulation component
import { supabase } from '@/lib/supabase'; // Import supabase client
import { cn } from '@/lib/utils'; // Import cn utility for conditional classes

const LessonPage = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, boolean>>({});
  const [allQuestionsCorrect, setAllQuestionsCorrect] = useState(false);
  const [isLessonMarkedComplete, setIsLessonMarkedComplete] = useState(false);
  const [isCompletingLesson, setIsCompletingLesson] = useState(false);
  const [userQuizAttempts, setUserQuizAttempts] = useState<Array<{ question_id: string; is_correct: boolean; selected_answer: string | null }>>([]);


  const courseId = 'ap-physics';
  const lesson = findLessonById(courseId, lessonId || '');

  useEffect(() => {
    const fetchData = async () => {
      if (user && lessonId) {
        // Check if lesson is completed
        const progress = await fetchUserLessonProgress(user.id, courseId);
        const lessonIsDone = progress.includes(lessonId);
        setIsLessonMarkedComplete(lessonIsDone);

        // Fetch quiz attempts
        const attempts = await fetchUserQuizAttempts(user.id, courseId, lessonId);
        setUserQuizAttempts(attempts);

        // Pre-fill selected answers if already correct
        const initialSelected: Record<string, string> = {};
        const initialSubmitted: Record<string, boolean> = {};
        lesson?.questions?.forEach(q => {
          const correctAttempt = attempts.find(a => a.question_id === q.id && a.is_correct);
          if (correctAttempt && correctAttempt.selected_answer) {
            initialSelected[q.id] = correctAttempt.selected_answer;
            initialSubmitted[q.id] = true; // Mark as submitted and correct
          }
        });
        setSelectedAnswers(initialSelected);
        setSubmittedAnswers(initialSubmitted);

        // Check if all questions are already correct
        const allCorrectInitially = lesson?.questions?.every(q =>
          attempts.some(a => a.question_id === q.id && a.is_correct)
        );
        setAllQuestionsCorrect(!!allCorrectInitially);
      }
    };
    fetchData();
  }, [user, lessonId, courseId, queryClient, lesson?.questions]); // Added lesson?.questions to dependencies

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

  const handleSubmitAnswer = async (questionId: string, correctAnswer: string) => {
    if (!user) {
      showError("You must be logged in to submit answers.");
      return;
    }
    const selectedAnswer = selectedAnswers[questionId];
    if (selectedAnswer) {
      const isCorrect = selectedAnswer === correctAnswer;
      setSubmittedAnswers((prev) => ({ ...prev, [questionId]: true }));

      // Record quiz attempt
      const { error } = await supabase.from('user_quiz_attempts').insert({
        user_id: user.id,
        course_id: courseId,
        lesson_id: lessonId!,
        question_id: questionId,
        is_correct: isCorrect,
        selected_answer: selectedAnswer, // Store the selected answer
      });

      if (error) {
        console.error("Error recording quiz attempt:", error.message);
        showError("Failed to record quiz attempt.");
      } else {
        queryClient.invalidateQueries({ queryKey: ['weeklyQuizzes', user.id] });
        queryClient.invalidateQueries({ queryKey: ['userQuizAttempts', user.id, courseId, lessonId] }); // Invalidate new query
        if (isCorrect) {
          showSuccess("Correct answer!");
          // Update local state for userQuizAttempts to reflect the new correct answer
          setUserQuizAttempts(prev => [...prev, { question_id: questionId, is_correct: true, selected_answer: selectedAnswer }]);
          // Re-evaluate if all questions are now correct
          const allCorrectNow = lesson.questions?.every(q =>
            userQuizAttempts.some(a => a.question_id === q.id && a.is_correct) || (q.id === questionId && isCorrect)
          );
          setAllQuestionsCorrect(!!allCorrectNow);
        } else {
          showError("Incorrect answer. Try again!");
        }
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
      queryClient.invalidateQueries({ queryKey: ['userStreak', user.id] });
      queryClient.invalidateQueries({ queryKey: ['userCompletedLessonsCount', user.id] });
      queryClient.invalidateQueries({ queryKey: ['userCompletedLessonIds', user.id] });
      queryClient.invalidateQueries({ queryKey: ['weeklyLessons', user.id] }); // Invalidate weekly lessons data
      setIsLessonMarkedComplete(true); // Mark lesson as complete in UI
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

      {/* Conditionally render the simulation component */}
      {lessonId === 'kinematics-1d' && <Kinematics1DSimulation />}

      {/* Conditionally render the video embed or placeholder */}
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
              const hasCorrectAttempt = userQuizAttempts.some(a => a.question_id === q.id && a.is_correct);
              const isQuestionDisabled = isLessonMarkedComplete || hasCorrectAttempt;
              const userSelectedAnswerForDisplay = hasCorrectAttempt ? userQuizAttempts.find(a => a.question_id === q.id && a.is_correct)?.selected_answer : selectedAnswers[q.id];

              return (
                <Card key={q.id} className="shadow-sm">
                  <CardHeader>
                    <CardTitle>{q.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {q.type === 'multiple-choice' && (
                      <RadioGroup
                        onValueChange={(value) => handleAnswerChange(q.id, value)}
                        value={userSelectedAnswerForDisplay || selectedAnswers[q.id]} // Prioritize stored correct answer
                        className="grid gap-4"
                        disabled={isQuestionDisabled} // Disable if lesson completed or already correct
                      >
                        {q.options.map((option, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={`${q.id}-${index}`} disabled={isQuestionDisabled} />
                            <Label htmlFor={`${q.id}-${index}`} className={cn(
                              isQuestionDisabled && option === q.correctAnswer && "font-bold text-green-600",
                              isQuestionDisabled && option === userSelectedAnswerForDisplay && option !== q.correctAnswer && "line-through text-red-500" // Strikethrough incorrect selected if disabled
                            )}>
                              {option}
                              {isQuestionDisabled && option === q.correctAnswer && <CheckCircle className="ml-2 h-4 w-4 inline text-green-500" />}
                              {isQuestionDisabled && option === userSelectedAnswerForDisplay && option !== q.correctAnswer && <XCircle className="ml-2 h-4 w-4 inline text-red-500" />}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                    {!isQuestionDisabled && ( // Only show submit button if not disabled
                      <Button
                        onClick={() => handleSubmitAnswer(q.id, q.correctAnswer)}
                        className="mt-4"
                        disabled={!selectedAnswers[q.id] || submittedAnswers[q.id]}
                      >
                        {submittedAnswers[q.id] ? "Answer Submitted" : "Submit Answer"}
                      </Button>
                    )}
                    {(submittedAnswers[q.id] || isQuestionDisabled) && ( // Show feedback if submitted or disabled
                      <div className="mt-4 p-3 rounded-md flex items-start gap-2">
                        {userSelectedAnswerForDisplay === q.correctAnswer ? (
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                        )}
                        <p className={userSelectedAnswerForDisplay === q.correctAnswer ? "text-green-600" : "text-red-600"}>
                          {userSelectedAnswerForDisplay === q.correctAnswer ? "Correct!" : "Incorrect."}
                          <span className="block text-muted-foreground text-sm mt-1">{q.explanation}</span>
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