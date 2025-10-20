"use client";

import React, { useState, useEffect, useContext, useRef, useMemo, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Flag, X, Clock, ChevronLeft, ChevronRight, ListChecks, MoreHorizontal, BookOpen, ZoomIn, ZoomOut, MessageSquareQuote, Ear, Loader2 } from 'lucide-react';
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
  gradeFreeResponseAnswer,
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
  const [isGradingAI, setIsGradingAI] = useState(false);

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

  const submitCurrentAnswer = useCallback(async (questionToSubmit: UnitQuestion) => {
    if (!testSessionId || !user) return;

    let isCorrect = false;
    let aiFeedback: string | null = null;
    const selectedAnswer = questionToSubmit.type === 'multiple-choice'
      ? selectedAnswers[questionToSubmit.id]
      : freeResponseAnswers[questionToSubmit.id];

    if (questionToSubmit.type === 'multiple-choice') {
      isCorrect = selectedAnswer === questionToSubmit.correctAnswer;
    } else if (questionToSubmit.type === 'free-response' && selectedAnswer) {
      setIsGradingAI(true);
      const aiResult = await gradeFreeResponseAnswer(
        selectedAnswer,
        questionToSubmit.question,
        questionToSubmit.correctAnswer || '',
        questionToSubmit.explanation || ''
      );
      setIsGradingAI(false);

      if (aiResult) {
        isCorrect = aiResult.isCorrect;
        aiFeedback = aiResult.feedback;
      } else {
        isCorrect = false;
        aiFeedback = "Could not get AI feedback. Please review manually.";
      }
    }

    await submitUnitTestAnswer(
      testSessionId,
      user.id,
      questionToSubmit.id,
      selectedAnswer || null,
      isCorrect,
      markedForReview[questionToSubmit.id] || false,
      eliminatedOptions[questionToSubmit.id] || [],
      aiFeedback // Pass AI feedback
    );
  }, [testSessionId, user, selectedAnswers, freeResponseAnswers, markedForReview, eliminatedOptions]);

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
  }, [timeLeft, testStatus, handleFinishTest]);

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

  const handleNextQuestion = async () => {
    if (!currentQuestion || !currentSection) return;
    await submitCurrentAnswer(currentQuestion);
    setCurrentQuestionIndex(prev => Math.min(currentSection.questions.length - 1, prev + 1));
  };

  const handlePreviousQuestion = async () => {
    if (!currentQuestion) return;
    await submitCurrentAnswer(currentQuestion);
    setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextSection = async () => {
    if (!unitTest || !currentQuestion) return;
    await submitCurrentAnswer(currentQuestion);
    if (currentSectionIndex < unitTest.sections.length - 1) {
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
        // Corrected line: Use spread operator for the array value
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
        <Button asChild className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"> {/* Primary button style */}
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
        <Button asChild className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"> {/* Primary button style */}
          <Link to={`/courses/${courseId}`}>
            <span className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Module Overview
            </span>
          </Link>
        </Button>
      </div>
    );
  }

  const isTestFinished = testStatus === 'completed' || testStatus === 'timed-out';

  if (testStatus === 'not-started') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <Card className="w-full max-w-lg shadow-lg text-center bg-card border-border"> {/* Card background and border */}
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary">{unitTest.title}</CardTitle>
            <CardDescription className="mt-2 text-muted-foreground">{unitTest.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg text-foreground">This test has a total duration of {totalDurationMinutes} minutes.</p>
            <ul className="list-disc list-inside text-left mx-auto max-w-sm text-muted-foreground">
              {unitTest.sections.map((section) => (
                <li key={section.id}>
                  <strong>{section.title}:</strong> {section.questions.length} questions.
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground">Once you start, the timer begins for the entire test. You cannot go back to a previous section.</p>
            <Button onClick={handleStartTest} size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90"> {/* Primary button style */}
              Start Test
            </Button>
            <Button variant="outline" asChild className="w-full text-foreground hover:text-primary border-border"> {/* Outline button style */}
              <Link to={`/courses/${courseId}`}>
                <span className="flex items-center">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Module Overview
                </span>
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
        <Card className="w-full max-w-lg shadow-lg text-center bg-card border-border"> {/* Card background and border */}
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary">Test {testStatus === 'timed-out' ? 'Timed Out' : 'Completed'}</CardTitle>
            <CardDescription className="mt-2 text-muted-foreground">
              Your responses have been recorded.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg text-foreground">You can view your results now.</p>
            <Button asChild size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90"> {/* Primary button style */}
              <Link to={`/courses/${courseId}/unit-test/${moduleId}/results/${testSessionId}`}>
                View Results
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full text-foreground hover:text-primary border-border"> {/* Outline button style */}
              <Link to={`/courses/${courseId}`}>
                <span className="flex items-center">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Module Overview
                </span>
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
        <Button asChild className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"> {/* Primary button style */}
          <Link to={`/courses/${courseId}`}>
            <span className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Module Overview
            </span>
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
      <div className="flex flex-col min-h-screen bg-background"> {/* Background color */}
        <header className="flex items-center justify-between px-4 py-3 bg-card border-b border-border shadow-sm sm:px-6"> {/* Card background and border */}
          <div className="flex items-center gap-2 sm:gap-4">
            <h1 className="text-base font-semibold text-foreground sm:text-xl"> {/* Text color foreground */}
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
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 text-foreground hover:text-primary" disabled> {/* Adjusted text color */}
              <MessageSquareQuote className="h-4 w-4" />
              <span className="sr-only">Annotate</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 text-foreground hover:text-primary"> {/* Adjusted text color */}
                  <MoreHorizontal className="h-5 w-5" />
                  <span className="sr-only">More Tools</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border text-foreground"> {/* Dropdown styling */}
                <DropdownMenuItem onClick={() => setIsLineReaderVisible(prev => !prev)} className="hover:bg-muted">
                  {isLineReaderVisible ? 'Hide' : 'Show'} Line Reader
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem onClick={handleZoomIn} className="hover:bg-muted"><ZoomIn className="h-4 w-4 mr-2" />Zoom In</DropdownMenuItem>
                <DropdownMenuItem onClick={handleZoomOut} className="hover:bg-muted"><ZoomOut className="h-4 w-4 mr-2" />Zoom Out</DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem onClick={handleReadAloud} className="hover:bg-muted"><Ear className="h-4 w-4 mr-2" />Read Aloud</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row flex-grow" style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}>
          <div className="flex-1 min-w-0 p-6 bg-card lg:overflow-y-auto lg:border-r border-b lg:border-b-0 border-border"> {/* Card background and border */}
            <div className="prose dark:prose-invert !max-w-full w-full">
              <p className="text-lg font-medium leading-relaxed text-foreground">{currentQuestion.question}</p>
            </div>
          </div>

          <div className="w-full lg:w-96 flex-shrink-0 flex flex-col p-6 bg-background lg:overflow-y-auto"> {/* Background color */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1 text-lg font-semibold flex-wrap">
                <span className="bg-primary text-primary-foreground px-2 py-1 rounded-md">
                  {currentQuestionIndex + 1}
                </span>
                <Button
                  variant={markedForReview[currentQuestion.id] ? "secondary" : "outline"}
                  onClick={handleMarkForReview}
                  className={cn("flex items-center gap-1 text-xs px-2 py-1", markedForReview[currentQuestion.id] ? "bg-secondary text-secondary-foreground" : "text-foreground hover:text-primary border-border")} // Adjusted button style
                >
                  <Flag className="h-3 w-3" /> Mark for Review
                </Button>
              </div>
              <Button variant="ghost" size="sm" disabled className="text-muted-foreground"> {/* Adjusted text color */}
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
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-md bg-card border-border hover:bg-muted transition-colors w-full"> {/* Card background and border */}
                    <RadioGroupItem value={option} id={`${currentQuestion.id}-${index}`} className="flex-shrink-0" />
                    <Label
                      htmlFor={`${currentQuestion.id}-${index}`}
                      className={cn(
                        "text-foreground cursor-pointer flex-1 break-words", // Text color foreground
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
                <Label htmlFor={`frq-${currentQuestion.id}`} className="text-lg font-semibold text-foreground">Your Answer:</Label> {/* Text color foreground */}
                <Textarea
                  id={`frq-${currentQuestion.id}`}
                  placeholder="Type your free-response answer here..."
                  value={freeResponseAnswers[currentQuestion.id] || ''}
                  onChange={(e) => setFreeResponseAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                  rows={10}
                  className="min-h-[150px] bg-input border-border text-foreground" // Input styling
                  disabled={isGradingAI}
                />
                {isGradingAI && (
                  <div className="flex items-center justify-center gap-2 text-primary mt-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Grading with AI...</span>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 mt-auto">
              <Button variant="outline" onClick={() => setIsCalculatorVisible(true)} className="text-foreground hover:text-primary border-border">Calculator</Button> {/* Outline button style */}
              <Button variant="outline" disabled className="text-muted-foreground border-border">Reference (N/A)</Button> {/* Outline button style */}
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-between px-4 py-3 bg-card border-t border-border shadow-sm sm:px-6"> {/* Card background and border */}
          <Dialog open={isPaletteOpen} onOpenChange={setIsPaletteOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 text-foreground hover:text-primary border-border"> {/* Outline button style */}
                <ListChecks className="h-4 w-4" />
                <span className="hidden sm:inline">Question {globalQuestionIndex + 1} of {allQuestions.length}</span>
                <span className="inline sm:hidden">{globalQuestionIndex + 1}/{allQuestions.length}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[80vh] flex flex-col bg-card border-border text-foreground"> {/* Dialog styling */}
              <DialogHeader>
                <DialogTitle className="text-foreground">Question Palette</DialogTitle>
                <DialogDescription className="text-muted-foreground">Jump to any question in the current section.</DialogDescription>
              </DialogHeader>
              <ScrollArea className="flex-grow pr-4">
                <div className="grid grid-cols-5 gap-2">
                  {currentSection.questions.map((q, index) => (
                    <Button
                      key={q.id}
                      variant={index === currentQuestionIndex ? "default" : "outline"}
                      size="sm"
                      onClick={async () => {
                        if (currentQuestion) {
                          await submitCurrentAnswer(currentQuestion); // Submit current question before navigating
                        }
                        setCurrentQuestionIndex(index);
                        setIsPaletteOpen(false);
                      }}
                      className={cn(
                        "relative",
                        index === currentQuestionIndex && "bg-primary text-primary-foreground hover:bg-primary/90", // Current question
                        getQuestionStatus(q.id) === 'answered' && "bg-green-500/20 text-green-300 hover:bg-green-500/30 border-green-500", // Answered
                        getQuestionStatus(q.id) === 'flagged' && "bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 border-yellow-500", // Flagged
                        getQuestionStatus(q.id) === 'skipped' && "bg-card text-foreground hover:bg-muted border-border", // Skipped
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
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500"></span> Answered</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500"></span> Flagged</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-card border border-border"></span> Skipped</span>
                </div>
                <Button onClick={() => setIsPaletteOpen(false)} className="bg-primary text-primary-foreground hover:bg-primary/90">Close</Button> {/* Primary button style */}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="flex items-center gap-2">
            <Button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0 && currentSectionIndex === 0}
              variant="outline"
              size="icon"
              className="sm:w-auto sm:px-4 text-foreground hover:text-primary border-border" // Outline button style
            >
              <span className="flex items-center">
                <ChevronLeft className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Previous</span>
              </span>
            </Button>
            {isLastQuestionInSection ? (
              isLastSection ? (
                <Button
                  onClick={() => handleFinishTest(false)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90" // Primary button style
                >
                  Finish Test
                </Button>
              ) : (
                <Button
                  onClick={handleNextSection}
                  className="bg-primary text-primary-foreground hover:bg-primary/90" // Primary button style
                >
                  <span className="flex items-center">
                    <span className="hidden sm:inline">Next Section</span>
                    <span className="inline sm:hidden">Next</span>
                    <ChevronRight className="ml-1 h-4 w-4 sm:ml-2" />
                  </span>
                </Button>
              )
            ) : (
              <Button
                onClick={handleNextQuestion}
                size="icon"
                className="sm:w-auto sm:px-4 bg-primary text-primary-foreground hover:bg-primary/90" // Primary button style
              >
                <span className="flex items-center">
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4 sm:ml-2" />
                </span>
              </Button>
            )}
          </div>
        </footer>
      </div>
    </>
  );
};

export default UnitTestingPage;