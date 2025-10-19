"use client";

import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Flag, X, Clock, ChevronLeft, ChevronRight, ListChecks, MoreHorizontal, BookOpen, ZoomIn, ZoomOut, MessageSquareQuote, Ear } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { AuthContext } from '@/context/AuthContext';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import Calculator from '@/components/testing/Calculator';
import LineReader from '@/components/testing/LineReader';

const UnitTestingPage = () => {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const module = findModuleById(courseId || '', moduleId || '');
  const unitTest = module?.unitTest;

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [freeResponseAnswers, setFreeResponseAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [eliminatedOptions, setEliminatedOptions] = useState<Record<string, string[]>>({});
  const [testSessionId, setTestSessionId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [testStatus, setTestStatus] = useState<'not-started' | 'in-progress' | 'completed' | 'timed-out'>('not-started');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  const [isCalculatorVisible, setIsCalculatorVisible] = useState(false);
  const [isLineReaderVisible, setIsLineReaderVisible] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const currentSection = unitTest?.sections[currentSectionIndex];
  const currentQuestion = currentSection?.questions[currentQuestionIndex];

  const allQuestions = useMemo(() => {
    if (!unitTest) return [];
    return unitTest.sections.flatMap(section => section.questions);
  }, [unitTest]);

  const totalDurationMinutes = useMemo(() => {
    if (!unitTest) return 0;
    return unitTest.sections.reduce((sum, section) => sum + section.durationMinutes, 0);
  }, [unitTest]);

  const globalQuestionIndex = useMemo(() => {
    if (!unitTest || !currentSection || !currentQuestion) return 0;
    let index = 0;
    for (let i = 0; i < currentSectionIndex; i++) {
      index += unitTest.sections[i].questions.length;
    }
    index += currentQuestionIndex;
    return index;
  }, [unitTest, currentSectionIndex, currentQuestionIndex, currentSection, currentQuestion]);

  const handleFinishTest = async (timedOut: boolean = false) => {
    if (!testSessionId || !user) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(null);

    if (currentQuestion) {
      await submitCurrentAnswer(currentQuestion);
    }

    const allUserAnswers = await fetchUserUnitTestAnswers(testSessionId);
    const score = allUserAnswers.filter(ans => ans.is_correct).length;
    const finalStatus = timedOut ? 'timed-out' : 'completed';

    await updateUnitTestSessionStatus(testSessionId, finalStatus, score);
    setTestStatus(finalStatus);
    queryClient.invalidateQueries({ queryKey: ['unitTestSession', user.id, courseId, moduleId] });
    showSuccess("Test finished! Your results are being processed.");
  };

  useEffect(() => {
    const initializeTest = async () => {
      if (!user || !unitTest || !courseId || !moduleId) return;

      const session = await fetchUnitTestSession(user.id, courseId, moduleId);
      if (session && (session.status === 'in-progress' || session.status === 'timed-out')) {
        const endTime = new Date(session.end_time).getTime();
        const now = Date.now();
        const remainingTime = Math.max(0, (endTime - now) / 1000);

        if (remainingTime > 0 && session.status === 'in-progress') {
          setTestSessionId(session.id);
          setTestStatus('in-progress');
          startTimer(remainingTime);

          const answers = await fetchUserUnitTestAnswers(session.id);
          const newSelected: Record<string, string> = {};
          const newFreeResponse: Record<string, string> = {};
          const newMarked: Record<string, boolean> = {};
          const newEliminated: Record<string, string[]> = {};

          answers.forEach(ans => {
            if (ans.selected_answer) {
              const question = allQuestions.find(q => q.id === ans.question_id);
              if (question?.type === 'multiple-choice') {
                newSelected[ans.question_id] = ans.selected_answer;
              } else {
                newFreeResponse[ans.question_id] = ans.selected_answer;
              }
            }
            newMarked[ans.question_id] = ans.marked_for_review || false;
            newEliminated[ans.question_id] = ans.eliminated_options || [];
          });

          setSelectedAnswers(newSelected);
          setFreeResponseAnswers(newFreeResponse);
          setMarkedForReview(newMarked);
          setEliminatedOptions(newEliminated);
          showSuccess("Resuming your previous test session.");
        } else {
          setTestStatus('not-started');
        }
      }
    };
    initializeTest();
  }, [user, unitTest, courseId, moduleId, allQuestions]);

  useEffect(() => {
    if (timeLeft !== null && timeLeft <= 0 && testStatus === 'in-progress') {
      handleFinishTest(true);
    }
  }, [timeLeft, testStatus]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTimer = (initialTimeInSeconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(initialTimeInSeconds);
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
    const totalQuestions = allQuestions.length;

    const session = await startUnitTestSession(user.id, courseId, moduleId, totalDurationMinutes, totalQuestions);

    if (session) {
      setTestSessionId(session.id);
      setTestStatus('in-progress');
      startTimer(totalDurationMinutes * 60);
      showSuccess("Test started! Good luck.");
    } else {
      showError("Could not start the test session. Please try again.");
    }
  };

  const submitCurrentAnswer = async (question: UnitQuestion) => {
    if (!testSessionId || !user) return;

    const selectedAnswer = question.type === 'multiple-choice' ? selectedAnswers[question.id] : freeResponseAnswers[question.id];
    const isCorrect = selectedAnswer === question.correctAnswer;

    await submitUnitTestAnswer(
      testSessionId,
      user.id,
      question.id,
      selectedAnswer || null,
      isCorrect,
      markedForReview[question.id] || false,
      eliminatedOptions[question.id] || []
    );
  };

  useEffect(() => {
    const prevQuestionIndex = currentQuestionIndex > 0 ? currentQuestionIndex - 1 : 0;
    const prevQuestion = currentSection?.questions[prevQuestionIndex];
    if (prevQuestion && testStatus === 'in-progress') {
      submitCurrentAnswer(prevQuestion);
    }
  }, [currentQuestionIndex, testStatus]);

  const handleNextSection = () => {
    if (!unitTest) return;
    if (currentSectionIndex < unitTest.sections.length - 1) {
      if (currentQuestion) {
        submitCurrentAnswer(currentQuestion);
      }
      setCurrentSectionIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
    }
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.5));

  const handleReadAloud = () => {
    if ('speechSynthesis' in window && currentQuestion) {
      const utterance = new SpeechSynthesisUtterance(currentQuestion.question);
      window.speechSynthesis.speak(utterance);
    } else {
      showError("Text-to-speech is not supported in your browser.");
    }
  };

  const handleOptionEliminate = (option: string) => {
    if (!currentQuestion) return;
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
    if (!currentQuestion) return;
    setMarkedForReview(prev => ({ ...prev, [currentQuestion.id]: !prev[currentQuestion.id] }));
  };

  const getQuestionStatus = (questionId: string) => {
    const isAnswered = selectedAnswers[questionId] || freeResponseAnswers[questionId];
    const isFlagged = markedForReview[questionId];
    if (isFlagged) return 'flagged';
    if (isAnswered) return 'answered';
    return 'skipped';
  };

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "Loading...";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours.toString()}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

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
            <p className="text-lg">This test has a total duration of {totalDurationMinutes} minutes.</p>
            <ul className="list-disc list-inside text-left mx-auto max-w-sm">
              {unitTest.sections.map((section) => (
                <li key={section.id}>
                  <strong>{section.title}:</strong> {section.questions.length} questions.
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground">Once you start, the timer begins for the entire test. You cannot go back to a previous section.</p>
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

  if (!currentSection || !currentQuestion) {
    return (
      <div className="text-center py-10">
        <h1 className="text-3xl font-bold text-destructive">Error Loading Question</h1>
        <p className="text-muted-foreground mt-2">Could not find the current section or question.</p>
        <Button asChild className="mt-4">
          <Link to={`/courses/${courseId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Module Overview
          </Link>
        </Button>
      </div>
    );
  }

  const isLastQuestionInSection = currentQuestionIndex === currentSection.questions.length - 1;
  const isLastSection = currentSectionIndex === unitTest.sections.length - 1;

  return (
    <>
      {isCalculatorVisible && <Calculator onClose={() => setIsCalculatorVisible(false)} />}
      {isLineReaderVisible && <LineReader />}
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
        <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm sm:px-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <h1 className="text-base font-semibold text-gray-800 dark:text-gray-100 sm:text-xl">
              {currentSection.title}
            </h1>
            <span className="hidden text-sm text-muted-foreground sm:inline">
              Module {currentSectionIndex + 1}: {module?.title}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1 text-base font-mono text-primary sm:text-lg">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>{formatTime(timeLeft)}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" disabled>
              <MessageSquareQuote className="h-4 w-4" />
              <span className="sr-only">Annotate</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                  <MoreHorizontal className="h-5 w-5" />
                  <span className="sr-only">More Tools</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsLineReaderVisible(prev => !prev)}>
                  {isLineReaderVisible ? 'Hide' : 'Show'} Line Reader
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleZoomIn}><ZoomIn className="h-4 w-4 mr-2" />Zoom In</DropdownMenuItem>
                <DropdownMenuItem onClick={handleZoomOut}><ZoomOut className="h-4 w-4 mr-2" />Zoom Out</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleReadAloud}><Ear className="h-4 w-4 mr-2" />Read Aloud</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row flex-grow" style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}>
          <div className="flex-1 min-w-0 p-6 bg-white dark:bg-gray-900 lg:overflow-y-auto lg:border-r border-b lg:border-b-0 border-gray-200 dark:border-gray-800">
            <div className="prose dark:prose-invert !max-w-full w-full">
              <p className="text-lg font-medium leading-relaxed text-foreground">{currentQuestion.question}</p>
            </div>
          </div>

          <div className="w-full lg:w-96 flex-shrink-0 flex flex-col p-6 bg-gray-50 dark:bg-gray-950 lg:overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1 text-lg font-semibold flex-wrap">
                <span className="bg-primary text-primary-foreground px-2 py-1 rounded-md">
                  {currentQuestionIndex + 1}
                </span>
                <Button
                  variant={markedForReview[currentQuestion.id] ? "secondary" : "outline"}
                  onClick={handleMarkForReview}
                  className="flex items-center gap-1 text-xs px-2 py-1"
                >
                  <Flag className="h-3 w-3" /> Mark for Review
                </Button>
              </div>
              <Button variant="ghost" size="sm" disabled>
                <BookOpen className="h-4 w-4" />
              </Button>
            </div>

            {currentQuestion.type === 'multiple-choice' ? (
              <RadioGroup
                onValueChange={(value) => setSelectedAnswers(prev => ({ ...prev, [currentQuestion.id]: value }))}
                value={selectedAnswers[currentQuestion.id] || ''}
                className="flex flex-col gap-3 mb-6"
              >
                {currentQuestion.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-md bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors w-full">
                    <RadioGroupItem value={option} id={`${currentQuestion.id}-${index}`} className="flex-shrink-0" />
                    <Label
                      htmlFor={`${currentQuestion.id}-${index}`}
                      className={cn(
                        "text-base cursor-pointer flex-1 break-words",
                        eliminatedOptions[currentQuestion.id]?.includes(option) && "line-through text-muted-foreground"
                      )}
                    >
                      {option}
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOptionEliminate(option)}
                      className="ml-auto text-xs text-muted-foreground hover:text-destructive flex-shrink-0"
                    >
                      <X className="h-3 w-3 mr-1" /> Eliminate
                    </Button>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="grid gap-2 mb-6">
                <Label htmlFor={`frq-${currentQuestion.id}`} className="text-lg font-semibold">Your Answer:</Label>
                <Textarea
                  id={`frq-${currentQuestion.id}`}
                  placeholder="Type your free-response answer here..."
                  value={freeResponseAnswers[currentQuestion.id] || ''}
                  onChange={(e) => setFreeResponseAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                  rows={10}
                  className="min-h-[150px]"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 mt-auto">
              <Button variant="outline" onClick={() => setIsCalculatorVisible(true)}>Calculator</Button>
              <Button variant="outline" disabled>Reference (N/A)</Button>
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-sm sm:px-6">
          <Dialog open={isPaletteOpen} onOpenChange={setIsPaletteOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <ListChecks className="h-4 w-4" />
                <span className="hidden sm:inline">Question {globalQuestionIndex + 1} of {allQuestions.length}</span>
                <span className="inline sm:hidden">{globalQuestionIndex + 1}/{allQuestions.length}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[80vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Question Palette</DialogTitle>
                <DialogDescription>Jump to any question in the current section.</DialogDescription>
              </DialogHeader>
              <ScrollArea className="flex-grow pr-4">
                <div className="grid grid-cols-5 gap-2">
                  {currentSection.questions.map((q, index) => (
                    <Button
                      key={q.id}
                      variant={index === currentQuestionIndex ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setCurrentQuestionIndex(index);
                        setIsPaletteOpen(false);
                      }}
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
              <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 mt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-100 dark:bg-green-900 border border-green-500"></span> Answered</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-100 dark:bg-yellow-900 border border-yellow-500"></span> Flagged</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-500"></span> Skipped</span>
                </div>
                <Button onClick={() => setIsPaletteOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              size="icon" // Make previous button icon-only on small screens
              className="sm:w-auto sm:px-4"
            >
              <ChevronLeft className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            {isLastQuestionInSection ? (
              isLastSection ? (
                <Button
                  onClick={() => handleFinishTest(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Finish Test
                </Button>
              ) : (
                <Button
                  onClick={handleNextSection}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <span className="hidden sm:inline">Next Section</span>
                  <span className="inline sm:hidden">Next</span>
                  <ChevronRight className="ml-1 h-4 w-4 sm:ml-2" />
                </Button>
              )
            ) : (
              <Button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(currentSection.questions.length - 1, prev + 1))}
                size="icon" // Make next button icon-only on small screens
                className="sm:w-auto sm:px-4"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4 sm:ml-2" />
              </Button>
            )}
          </div>
        </footer>
      </div>
    </>
  );
};

export default UnitTestingPage;