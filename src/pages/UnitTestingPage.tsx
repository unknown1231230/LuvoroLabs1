"use client";

import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Flag, X, CheckCircle, Clock, ChevronLeft, ChevronRight, ListChecks, MoreHorizontal, BookOpen } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { AuthContext } from '@/context/AuthContext'; // Updated import
import { findModuleById, UnitQuestion, UnitTestSection } from '@/utils/courseContent';
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
import { Textarea } from '@/components/ui/textarea'; // For free-response questions
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const UnitTestingPage = () => {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const module = findModuleById(courseId || '', moduleId || '');
  const unitTest = module?.unitTest;

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({}); // Stores MC answers
  const [freeResponseAnswers, setFreeResponseAnswers] = useState<Record<string, string>>({}); // Stores FR answers
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [eliminatedOptions, setEliminatedOptions] = useState<Record<string, string[]>>({});
  const [testSessionId, setTestSessionId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null); // Time in seconds for current section
  const [testStatus, setTestStatus] = useState<'not-started' | 'in-progress' | 'completed' | 'timed-out'>('not-started');
  const [submittedSections, setSubmittedSections] = useState<Record<string, boolean>>({}); // Tracks which sections are submitted
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  const currentSection = unitTest?.sections[currentSectionIndex];
  const currentQuestion = currentSection?.questions[currentQuestionIndex];

  // Memoize all questions for easier global navigation and status tracking
  const allQuestions = useMemo(() => {
    if (!unitTest) return [];
    return unitTest.sections.flatMap(section => section.questions);
  }, [unitTest]);

  // Memoize the global question index for the footer display
  const globalQuestionIndex = useMemo(() => {
    if (!unitTest || !currentSection || !currentQuestion) return 0;
    let index = 0;
    for (let i = 0; i < currentSectionIndex; i++) {
      index += unitTest.sections[i].questions.length;
    }
    index += currentQuestionIndex;
    return index;
  }, [unitTest, currentSectionIndex, currentQuestionIndex, currentSection, currentQuestion]);


  useEffect(() => {
    const initializeTest = async () => {
      if (!user || !unitTest || !courseId || !moduleId) {
        navigate(`/courses/${courseId}`); // Redirect if no user or test data
        return;
      }

      const existingSession = await fetchUnitTestSession(user.id, courseId, moduleId);

      if (existingSession) {
        setTestSessionId(existingSession.id);
        setTestStatus(existingSession.status as typeof testStatus);

        // Determine current section based on existing session data or default to first
        const sessionCurrentSectionIndex = unitTest.sections.findIndex(s => s.id === existingSession.current_section_id);
        setCurrentSectionIndex(sessionCurrentSectionIndex !== -1 ? sessionCurrentSectionIndex : 0);

        // Calculate time left for the *current* section
        const sectionEndTime = existingSession.section_end_time;
        const initialTimeLeft = sectionEndTime
          ? Math.max(0, (new Date(sectionEndTime).getTime() - Date.now()) / 1000)
          : unitTest.sections[currentSectionIndex].durationMinutes * 60;
        setTimeLeft(initialTimeLeft);

        // Fetch existing answers for this session
        const answers = await fetchUserUnitTestAnswers(existingSession.id);
        const initialSelected: Record<string, string> = {};
        const initialFreeResponse: Record<string, string> = {};
        const initialMarked: Record<string, boolean> = {};
        const initialEliminated: Record<string, string[]> = {};
        const initialSubmittedSections: Record<string, boolean> = {};

        answers.forEach(ans => {
          if (unitTest.sections.flatMap(s => s.questions).find(q => q.id === ans.question_id)?.type === 'multiple-choice') {
            initialSelected[ans.question_id] = ans.selected_answer || '';
          } else {
            initialFreeResponse[ans.question_id] = ans.selected_answer || '';
          }
          initialMarked[ans.question_id] = ans.marked_for_review || false;
          initialEliminated[ans.question_id] = ans.eliminated_options || [];
        });
        setSelectedAnswers(initialSelected);
        setFreeResponseAnswers(initialFreeResponse);
        setMarkedForReview(initialMarked);
        setEliminatedOptions(initialEliminated);

        // Reconstruct submitted sections based on session status or other indicators
        // For simplicity, if the overall test is completed/timed-out, all sections are considered submitted.
        if (existingSession.status === 'completed' || existingSession.status === 'timed-out') {
          unitTest.sections.forEach(s => initialSubmittedSections[s.id] = true);
        } else if (existingSession.submitted_sections) { // Assuming a new column for submitted sections
          existingSession.submitted_sections.forEach((sId: string) => initialSubmittedSections[sId] = true);
        }
        setSubmittedSections(initialSubmittedSections);

        if (existingSession.status === 'in-progress' && initialTimeLeft > 0) {
          startTimer(initialTimeLeft);
        }
      } else {
        setTestStatus('not-started');
        setCurrentSectionIndex(0);
        setCurrentQuestionIndex(0);
        setTimeLeft(unitTest.sections[0].durationMinutes * 60);
      }
    };

    initializeTest();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [user, unitTest, courseId, moduleId, navigate]);

  // Timer effect
  useEffect(() => {
    if (timeLeft !== null && timeLeft <= 0 && testStatus === 'in-progress' && currentSection) {
      handleSectionSubmission(true); // Submit current section due to time out
    }
  }, [timeLeft, testStatus, currentSection]);

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
    if (!user || !unitTest || !courseId || !moduleId || !currentSection) return;

    setTestStatus('in-progress');
    const session = await startUnitTestSession(
      user.id,
      courseId,
      moduleId,
      unitTest.sections.reduce((acc, s) => acc + s.durationMinutes, 0), // Total duration
      allQuestions.length
    );
    if (session) {
      setTestSessionId(session.id);
      startTimer(currentSection.durationMinutes * 60);
      showSuccess("Unit test started!");
    } else {
      showError("Failed to start test session.");
      setTestStatus('not-started');
    }
  };

  const handleSectionSubmission = async (timedOut: boolean = false) => {
    if (!user || !unitTest || !testSessionId || !currentSection) return;

    if (timerRef.current) clearInterval(timerRef.current);

    // Record all answers for the current section
    for (const question of currentSection.questions) {
      const selected = question.type === 'multiple-choice' ? selectedAnswers[question.id] : freeResponseAnswers[question.id];
      const isCorrect = question.type === 'multiple-choice' ? (selected === question.correctAnswer) : false; // FRQ not graded here

      await submitUnitTestAnswer(
        testSessionId,
        user.id,
        question.id,
        selected || null,
        isCorrect,
        markedForReview[question.id] || false,
        eliminatedOptions[question.id] || []
      );
    }

    setSubmittedSections(prev => ({ ...prev, [currentSection.id]: true }));

    // Check if this is the last section
    if (currentSectionIndex === unitTest.sections.length - 1) {
      // This is the final submission for the entire test
      let totalCorrect = 0;
      // Recalculate total score from all submitted answers (only MCQs for now)
      const allSubmittedAnswers = await fetchUserUnitTestAnswers(testSessionId);
      for (const ans of allSubmittedAnswers) {
        const question = allQuestions.find(q => q.id === ans.question_id);
        if (question?.type === 'multiple-choice' && ans.is_correct) {
          totalCorrect++;
        }
      }

      await updateUnitTestSessionStatus(testSessionId, timedOut ? 'timed-out' : 'completed', totalCorrect);
      queryClient.invalidateQueries({ queryKey: ['userUnitTestSessions', user.id] });
      queryClient.invalidateQueries({ queryKey: ['userUnitTestAnswers', testSessionId] });
      showSuccess(timedOut ? "Time's up! Test submitted." : "Test submitted successfully!");
      navigate(`/courses/${courseId}/unit-test/${moduleId}/results/${testSessionId}`);
    } else {
      // Move to the next section
      showSuccess(`Section "${currentSection.title}" submitted! Moving to next section.`);
      setCurrentSectionIndex(prev => prev + 1);
      setCurrentQuestionIndex(0); // Reset question index for the new section
      const nextSection = unitTest.sections[currentSectionIndex + 1];
      startTimer(nextSection.durationMinutes * 60);
    }
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

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "Loading...";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleOptionEliminate = (option: string) => {
    if (testStatus !== 'in-progress' || submittedSections[currentSection?.id || '']) return;
    setEliminatedOptions(prev => {
      const currentEliminated = prev[currentQuestion?.id || ''] || [];
      if (currentEliminated.includes(option)) {
        return { ...prev, [currentQuestion?.id || '']: currentEliminated.filter(o => o !== option) };
      } else {
        return { ...prev, [currentQuestion?.id || '']: [...currentEliminated, option] };
      }
    });
  };

  const handleMarkForReview = () => {
    if (testStatus !== 'in-progress' || submittedSections[currentSection?.id || '']) return;
    setMarkedForReview(prev => ({
      ...prev,
      [currentQuestion?.id || '']: !prev[currentQuestion?.id || ''],
    }));
  };

  const getQuestionStatus = (questionId: string) => {
    const question = allQuestions.find(q => q.id === questionId);
    if (!question) return 'skipped';

    const isAnswered = question.type === 'multiple-choice'
      ? !!selectedAnswers[questionId]
      : !!freeResponseAnswers[questionId];

    if (isAnswered) return 'answered';
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
            <p className="text-lg">This test has {unitTest.sections.length} sections:</p>
            <ul className="list-disc list-inside text-left mx-auto max-w-sm">
              {unitTest.sections.map((section, idx) => (
                <li key={section.id}>
                  <strong>{section.title}:</strong> {section.questions.length} questions, {section.durationMinutes} minutes.
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground">Once you start, the timer begins for each section. You cannot go back to a previous section after submitting or timing out.</p>
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

  const isCurrentSectionSubmitted = submittedSections[currentSection.id];

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            {currentSection.title}
          </h1>
          <span className="text-sm text-muted-foreground">
            Module {currentSectionIndex + 1}: {module?.title}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-lg font-mono text-primary">
            <Clock className="h-5 w-5" />
            <span>{formatTime(timeLeft)}</span>
          </div>
          <Button variant="ghost" size="sm" disabled>Annotate</Button> {/* Placeholder */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-5 w-5" /> More
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled>Line Reader</DropdownMenuItem>
              <DropdownMenuItem disabled>Zoom</DropdownMenuItem>
              <DropdownMenuItem disabled>Accessibility</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-grow overflow-hidden">
        {/* Left Panel: Question Content */}
        <div className="flex-grow p-6 overflow-y-auto bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg font-medium leading-relaxed">{currentQuestion.question}</p>
            {/* Placeholder for image/data table if needed */}
          </div>
        </div>

        {/* Right Panel: Answer Choices & Tools */}
        <div className="w-full lg:w-[400px] flex-shrink-0 flex flex-col p-6 bg-gray-50 dark:bg-gray-950 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <span className="bg-primary text-primary-foreground px-2 py-1 rounded-md">
                {currentQuestionIndex + 1}
              </span>
              <Button
                variant={markedForReview[currentQuestion.id] ? "secondary" : "outline"}
                onClick={handleMarkForReview}
                disabled={isCurrentSectionSubmitted}
                className="flex items-center gap-1 text-sm"
              >
                <Flag className="h-4 w-4" /> Mark for Review
              </Button>
            </div>
            <Button variant="ghost" size="sm" disabled>
              <BookOpen className="h-4 w-4" /> {/* Placeholder for reference sheet icon */}
            </Button>
          </div>

          {currentQuestion.type === 'multiple-choice' ? (
            <RadioGroup
              onValueChange={(value) => setSelectedAnswers(prev => ({ ...prev, [currentQuestion.id]: value }))}
              value={selectedAnswers[currentQuestion.id] || ''}
              className="grid gap-3 mb-6"
              disabled={isCurrentSectionSubmitted}
            >
              {currentQuestion.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 border rounded-md bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <RadioGroupItem value={option} id={`${currentQuestion.id}-${index}`} disabled={isCurrentSectionSubmitted} />
                  <Label
                    htmlFor={`${currentQuestion.id}-${index}`}
                    className={cn(
                      "text-base cursor-pointer flex-grow",
                      eliminatedOptions[currentQuestion.id]?.includes(option) && "line-through text-muted-foreground"
                    )}
                  >
                    {option}
                  </Label>
                  {!isCurrentSectionSubmitted && (
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
                disabled={isCurrentSectionSubmitted}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 mt-auto">
            <Button variant="outline" disabled>Calculator (N/A)</Button> {/* Placeholder */}
            <Button variant="outline" disabled>Reference (N/A)</Button> {/* Placeholder */}
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <footer className="flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-sm">
        <Dialog open={isPaletteOpen} onOpenChange={setIsPaletteOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <ListChecks className="h-4 w-4" />
              Question {globalQuestionIndex + 1} of {allQuestions.length}
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
                    disabled={isCurrentSectionSubmitted}
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
            disabled={currentQuestionIndex === 0 || isCurrentSectionSubmitted}
            variant="outline"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          {currentQuestionIndex === currentSection.questions.length - 1 ? (
            <Button
              onClick={() => handleSectionSubmission(false)}
              disabled={isCurrentSectionSubmitted}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {currentSectionIndex === unitTest.sections.length - 1 ? "Submit Test" : "Submit Section"}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestionIndex(prev => Math.min(currentSection.questions.length - 1, prev + 1))}
              disabled={isCurrentSectionSubmitted}
            >
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default UnitTestingPage;