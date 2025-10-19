"use client";

import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Flag, X, CheckCircle, Clock, ChevronLeft, ChevronRight, ListChecks } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { AuthContext } from '@/App';
import { findModuleById, UnitQuestion } from '@/utils/courseContent';
import { useQueryClient } from '@tanstack/react-query';
import {
  startUnitTestSession,
  submitUnitTestAnswer,
  updateUnitTestSessionStatus,
  fetchUnitTestSession,
  fetchUserUnitTestAnswers,
} from '@/utils/supabaseUtils';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

const UnitTestingPage = () => {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const module = findModuleById(courseId || '', moduleId || '');
  const unitTest = module?.unitTest;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [eliminatedOptions, setEliminatedOptions] = useState<Record<string, string[]>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, { selected: string; isCorrect: boolean; markedForReview: boolean; eliminatedOptions: string[] }>>({});
  const [testSessionId, setTestSessionId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null); // Time in seconds
  const [testStatus, setTestStatus] = useState<'not-started' | 'in-progress' | 'completed' | 'timed-out'>('not-started');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const initializeTest = async () => {
      if (!user || !unitTest || !courseId || !moduleId) {
        navigate(`/courses/${courseId}`); // Redirect if no user or test data
        return;
      }

      // Try to fetch an existing session
      const existingSession = await fetchUnitTestSession(user.id, courseId, moduleId);

      if (existingSession) {
        setTestSessionId(existingSession.id);
        setTestStatus(existingSession.status as typeof testStatus);
        const initialTimeLeft = existingSession.end_time
          ? Math.max(0, (new Date(existingSession.end_time).getTime() - Date.now()) / 1000)
          : unitTest.durationMinutes * 60;
        setTimeLeft(initialTimeLeft);

        // Fetch existing answers for this session
        const answers = await fetchUserUnitTestAnswers(existingSession.id);
        const initialSelected: Record<string, string> = {};
        const initialMarked: Record<string, boolean> = {};
        const initialEliminated: Record<string, string[]> = {};
        const initialSubmitted: Record<string, { selected: string; isCorrect: boolean; markedForReview: boolean; eliminatedOptions: string[] }> = {};

        answers.forEach(ans => {
          initialSelected[ans.question_id] = ans.selected_answer || '';
          initialMarked[ans.question_id] = ans.marked_for_review || false;
          initialEliminated[ans.question_id] = ans.eliminated_options || [];
          if (ans.selected_answer) { // If an answer was selected, consider it submitted for display purposes
            const question = unitTest.questions.find(q => q.id === ans.question_id);
            initialSubmitted[ans.question_id] = {
              selected: ans.selected_answer,
              isCorrect: ans.is_correct || false,
              markedForReview: ans.marked_for_review || false,
              eliminatedOptions: ans.eliminated_options || [],
            };
          }
        });
        setSelectedAnswers(initialSelected);
        setMarkedForReview(initialMarked);
        setEliminatedOptions(initialEliminated);
        setSubmittedAnswers(initialSubmitted);

        if (existingSession.status === 'in-progress' && initialTimeLeft > 0) {
          startTimer(initialTimeLeft);
        }
      } else {
        setTestStatus('not-started');
        setTimeLeft(unitTest.durationMinutes * 60);
      }
    };

    initializeTest();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [user, unitTest, courseId, moduleId, navigate]);

  useEffect(() => {
    if (timeLeft !== null && timeLeft <= 0 && testStatus === 'in-progress') {
      handleTestSubmission(true); // Submit due to time out
    }
  }, [timeLeft, testStatus]);

  const startTimer = (initialTime: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(initialTime);
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime === null || prevTime <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const handleStartTest = async () => {
    if (!user || !unitTest || !courseId || !moduleId) return;

    setTestStatus('in-progress');
    const session = await startUnitTestSession(user.id, courseId, moduleId, unitTest.durationMinutes, unitTest.questions.length);
    if (session) {
      setTestSessionId(session.id);
      startTimer(unitTest.durationMinutes * 60);
      showSuccess("Unit test started!");
    } else {
      showError("Failed to start test session.");
      setTestStatus('not-started');
    }
  };

  const handleTestSubmission = async (timedOut: boolean = false) => {
    if (!user || !unitTest || !testSessionId) return;

    if (timerRef.current) clearInterval(timerRef.current);
    setTestStatus(timedOut ? 'timed-out' : 'completed');

    let correctCount = 0;
    const allQuestions = unitTest.questions;

    for (const question of allQuestions) {
      const selected = selectedAnswers[question.id];
      const isCorrect = selected === question.correctAnswer;

      // Ensure all answers are recorded in the DB, even if not explicitly submitted
      await submitUnitTestAnswer(
        testSessionId,
        user.id,
        question.id,
        selected || null, // Store null if no answer selected
        isCorrect,
        markedForReview[question.id] || false,
        eliminatedOptions[question.id] || []
      );

      if (isCorrect) {
        correctCount++;
      }
    }

    // Update the session status and score
    await updateUnitTestSessionStatus(testSessionId, timedOut ? 'timed-out' : 'completed', correctCount);

    queryClient.invalidateQueries({ queryKey: ['userUnitTestSessions', user.id] });
    queryClient.invalidateQueries({ queryKey: ['userUnitTestAnswers', testSessionId] });

    showSuccess(timedOut ? "Time's up! Test submitted." : "Test submitted successfully!");
    navigate(`/courses/${courseId}/unit-test/${moduleId}/results/${testSessionId}`); // Redirect to results page
  };

  const currentQuestion = unitTest?.questions[currentQuestionIndex];

  if (!user) {
    return (
      <div className="text-center py-10">
        <h1 className="text-3xl font-bold text-destructive">Authentication Required</h1>
        <p className="text-muted-foreground mt-2">Please log in to take this unit test.</p>
        <Button asChild className="mt-4">
          <Link to="/auth">Login / Sign Up</Link>
        </Button>
      </div>
    );
  }

  if (!unitTest) {
    return (
      <div className="text-center py-10">
        <h1 className="text-3xl font-bold text-destructive">Unit Test Not Found</h1>
        <p className="text-muted-foreground mt-2">The unit test for this module could not be loaded.</p>
        <Button asChild className="mt-4">
          <Link to={`/courses/${courseId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Module Overview
          </Link>
        </Button>
      </div>
    );
  }

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "Loading...";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleOptionEliminate = (option: string) => {
    if (testStatus !== 'in-progress') return;
    setEliminatedOptions(prev => {
      const currentEliminated = prev[currentQuestion.id] || [];
      if (currentEliminated.includes(option)) {
        return { ...prev, [currentQuestion.id]: currentEliminated.filter(o => o !== option) };
      } else {
        return { ...prev, [currentQuestion.id]: [...currentEliminated, option] };
      }
    });
  };

  const handleMarkForReview = () => {
    if (testStatus !== 'in-progress') return;
    setMarkedForReview(prev => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id],
    }));
  };

  const getQuestionStatus = (questionId: string) => {
    if (submittedAnswers[questionId]) return 'answered';
    if (selectedAnswers[questionId]) return 'answered'; // Consider answered if selected but not yet submitted (for in-progress)
    if (markedForReview[questionId]) return 'flagged';
    return 'skipped';
  };

  const isTestFinished = testStatus === 'completed' || testStatus === 'timed-out';

  if (testStatus === 'not-started') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <Card className="w-full max-w-lg shadow-lg text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary">{unitTest.title}</CardTitle>
            <CardDescription className="mt-2 text-muted-foreground">{unitTest.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg">This test has {unitTest.questions.length} questions and a time limit of {unitTest.durationMinutes} minutes.</p>
            <p className="text-sm text-muted-foreground">Once you start, the timer begins and you cannot go back to previous modules after submission or time-out.</p>
            <Button onClick={handleStartTest} size="lg" className="w-full">
              Start Test
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link to={`/courses/${courseId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Module Overview
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isTestFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <Card className="w-full max-w-lg shadow-lg text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary">Test {testStatus === 'timed-out' ? 'Timed Out' : 'Completed'}</CardTitle>
            <CardDescription className="mt-2 text-muted-foreground">
              Your responses have been recorded.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg">You can view your results now.</p>
            <Button asChild size="lg" className="w-full">
              <Link to={`/courses/${courseId}/unit-test/${moduleId}/results/${testSessionId}`}>
                View Results
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link to={`/courses/${courseId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Module Overview
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-4 p-4">
      {/* Main Question Area */}
      <Card className="flex-grow flex flex-col shadow-lg">
        <CardHeader className="flex-row items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <span className="font-semibold text-lg">Time Left: {formatTime(timeLeft)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">Question {currentQuestionIndex + 1} of {unitTest.questions.length}</span>
          </div>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto p-6">
          {currentQuestion ? (
            <div className="space-y-6">
              <p className="text-xl font-medium leading-relaxed">{currentQuestion.question}</p>
              <RadioGroup
                onValueChange={(value) => setSelectedAnswers(prev => ({ ...prev, [currentQuestion.id]: value }))}
                value={selectedAnswers[currentQuestion.id] || ''}
                className="grid gap-3"
              >
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <RadioGroupItem value={option} id={`${currentQuestion.id}-${index}`} />
                    <Label
                      htmlFor={`${currentQuestion.id}-${index}`}
                      className={cn(
                        "text-base cursor-pointer",
                        eliminatedOptions[currentQuestion.id]?.includes(option) && "line-through text-muted-foreground"
                      )}
                    >
                      {option}
                    </Label>
                    {testStatus === 'in-progress' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOptionEliminate(option)}
                        className="ml-auto text-xs text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3 mr-1" /> Eliminate
                      </Button>
                    )}
                  </div>
                ))}
              </RadioGroup>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No question loaded.</p>
          )}
        </CardContent>
        <div className="flex justify-between p-4 border-t">
          <Button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            variant="outline"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button
            onClick={() => setCurrentQuestionIndex(prev => Math.min(unitTest.questions.length - 1, prev + 1))}
            disabled={currentQuestionIndex === unitTest.questions.length - 1}
          >
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Tools Strip and Question Palette */}
      <div className="flex flex-col w-full lg:w-80 space-y-4">
        <Card className="shadow-lg">
          <CardHeader className="border-b p-4">
            <CardTitle className="text-lg">Tools</CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-2 gap-2">
            <Button
              variant={markedForReview[currentQuestion?.id || ''] ? "secondary" : "outline"}
              onClick={handleMarkForReview}
              disabled={!currentQuestion || testStatus !== 'in-progress'}
            >
              <Flag className="mr-2 h-4 w-4" /> Mark for Review
            </Button>
            {/* Placeholder for other tools like calculator, reference sheet */}
            <Button variant="outline" disabled>
              Calculator (N/A)
            </Button>
            <Button variant="outline" disabled>
              Reference (N/A)
            </Button>
            <Button variant="outline" disabled>
              Highlight (N/A)
            </Button>
          </CardContent>
        </Card>

        <Card className="flex-grow shadow-lg">
          <CardHeader className="border-b p-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <ListChecks className="h-5 w-5" /> Question Palette
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex-grow">
            <ScrollArea className="h-full max-h-[300px] lg:max-h-[calc(100vh-500px)]">
              <div className="grid grid-cols-4 gap-2">
                {unitTest.questions.map((q, index) => (
                  <Button
                    key={q.id}
                    variant={index === currentQuestionIndex ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={cn(
                      "relative",
                      getQuestionStatus(q.id) === 'answered' && "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200",
                      getQuestionStatus(q.id) === 'flagged' && "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200",
                      getQuestionStatus(q.id) === 'skipped' && "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200",
                    )}
                  >
                    {index + 1}
                    {markedForReview[q.id] && (
                      <Flag className="absolute top-0 right-0 h-3 w-3 text-yellow-500" />
                    )}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          <div className="p-4 border-t">
            <Button
              onClick={() => handleTestSubmission(false)}
              className="w-full"
              disabled={testStatus !== 'in-progress'}
            >
              Submit Test
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UnitTestingPage;