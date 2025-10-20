"use client";

import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, CheckCircle2, XCircle, Flag } from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';
import { findModuleById } from '@/utils/courseContent';
import { fetchUnitTestSession, fetchUserUnitTestAnswers } from '@/utils/supabaseUtils';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

const UnitTestResultsPage = () => {
  const { courseId, moduleId, sessionId } = useParams<{ courseId: string; moduleId: string; sessionId: string }>();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [sessionData, setSessionData] = useState<any>(null);
  const [userAnswers, setUserAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const module = findModuleById(courseId || '', moduleId || '');
  const unitTest = module?.unitTest;

  useEffect(() => {
    const loadResults = async () => {
      if (!user) {
        navigate('/auth'); // Redirect if not logged in
        return;
      }
      if (!courseId || !moduleId || !sessionId) {
        navigate('/courses'); // Redirect if URL parameters are missing
        return;
      }
      if (!unitTest) {
        setError("Unit test definition not found for this module.");
        setLoading(false);
        navigate(`/courses/${courseId}`); // Redirect to module overview
        return;
      }

      try {
        const session = await fetchUnitTestSession(user.id, courseId, moduleId, sessionId);
        if (!session) {
          setError("Test session not found or you don't have permission to view it.");
          setLoading(false);
          return;
        }
        setSessionData(session);

        const answers = await fetchUserUnitTestAnswers(sessionId);
        setUserAnswers(answers);
      } catch (err: any) {
        console.error("Error loading unit test results:", err.message);
        setError("Failed to load test results.");
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [user, sessionId, courseId, moduleId, unitTest, navigate]);

  if (loading) {
    return (
      <div className="text-center py-10">
        <h1 className="text-3xl font-bold text-primary">Loading Results...</h1>
        <p className="text-muted-foreground mt-2">Please wait while we fetch your test performance.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <h1 className="text-3xl font-bold text-destructive">Error</h1>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button asChild className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"> {/* Primary button style */}
          <Link to={`/courses/${courseId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Module Overview
          </Link>
        </Button>
      </div>
    );
  }

  if (!unitTest || !sessionData) {
    return (
      <div className="text-center py-10">
        <h1 className="text-3xl font-bold text-destructive">Results Not Available</h1>
        <p className="text-muted-foreground mt-2">Could not find the test or session data.</p>
        <Button asChild className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"> {/* Primary button style */}
          <Link to={`/courses/${courseId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Module Overview
          </Link>
        </Button>
      </div>
    );
  }

  const scorePercentage = sessionData.total_questions > 0
    ? Math.round((sessionData.score / sessionData.total_questions) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <Button variant="outline" asChild className="mb-4 text-foreground hover:text-primary border-border"> {/* Outline button style */}
        <Link to={`/courses/${courseId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Module Overview
        </Link>
      </Button>

      <Card className="w-full max-w-3xl mx-auto shadow-lg text-center bg-card border-border"> {/* Card background and border */}
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-primary">{unitTest.title} Results</CardTitle>
          <CardDescription className="mt-2 text-muted-foreground">
            Review your performance on this unit test.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <p className="text-6xl font-extrabold text-green-500">{scorePercentage}%</p>
            <Progress value={scorePercentage} className="w-full max-w-xs [&>div]:bg-green-500" /> {/* Progress bar color */}
            <p className="text-xl font-semibold text-foreground">
              You scored {sessionData.score} out of {sessionData.total_questions} questions correctly.
            </p>
            <p className="text-muted-foreground">
              Status: <span className="font-semibold capitalize">{sessionData.status.replace('-', ' ')}</span>
            </p>
            {sessionData.end_time && (
              <p className="text-muted-foreground">
                Completed on: {new Date(sessionData.end_time).toLocaleDateString()} at {new Date(sessionData.end_time).toLocaleTimeString()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <h2 className="text-3xl font-bold text-primary mt-10 text-center">Detailed Review</h2>
      <div className="space-y-6">
        {unitTest.sections.map((section, sectionIndex) => (
          <div key={section.id} className="space-y-4">
            <h3 className="text-2xl font-bold text-foreground mt-8 mb-4">{section.title}</h3> {/* Text color foreground */}
            <Separator className="bg-border" /> {/* Separator color */}
            {section.questions.map((question, index) => {
              const userAnswer = userAnswers.find(ans => ans.question_id === question.id);
              const isCorrect = userAnswer?.is_correct;
              const selectedOption = userAnswer?.selected_answer;
              const markedForReview = userAnswer?.marked_for_review;
              const eliminatedOptions = userAnswer?.eliminated_options || [];

              return (
                <Card key={question.id} className={cn("shadow-sm bg-card border-border", isCorrect ? "border-green-500" : "border-red-500")}> {/* Card background and border */}
                  <CardHeader className="flex-row items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2 text-foreground"> {/* Text color foreground */}
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      Question {index + 1}
                      {markedForReview && <Flag className="ml-2 h-4 w-4 text-yellow-500" />}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-lg font-medium text-foreground">{question.question}</p> {/* Text color foreground */}
                    {question.type === 'multiple-choice' && question.options && (
                      <div className="grid gap-2">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center space-x-2">
                            <span
                              className={cn(
                                "text-foreground", // Default text color
                                option === question.correctAnswer && "font-bold text-green-500",
                                option === selectedOption && option !== question.correctAnswer && "line-through text-red-500",
                                eliminatedOptions.includes(option) && "line-through text-muted-foreground"
                              )}
                            >
                              {option}
                            </span>
                            {option === question.correctAnswer && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                            {option === selectedOption && option !== question.correctAnswer && <XCircle className="h-4 w-4 text-red-500" />}
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedOption && (
                      <p className="text-muted-foreground text-sm">
                        Your answer: <span className={cn("font-bold", !isCorrect && "line-through text-red-500")}>{selectedOption}</span>
                      </p>
                    )}
                    {question.type === 'free-response' && (
                      <div className="mt-2">
                        <p className="text-muted-foreground text-sm">
                          Your Free Response: <span className="font-bold">{selectedOption || "No answer provided."}</span>
                        </p>
                        {question.correctAnswer && (
                          <p className="text-muted-foreground text-sm mt-1">
                            Expected Answer: <span className="font-bold text-green-500">{question.correctAnswer}</span>
                          </p>
                        )}
                        {/* Display AI feedback if available */}
                        {userAnswer?.ai_feedback && (
                          <p className="text-muted-foreground text-sm mt-1">
                            AI Feedback: <span className="font-bold">{userAnswer.ai_feedback}</span>
                          </p>
                        )}
                      </div>
                    )}
                    {question.explanation && (
                      <p className="text-muted-foreground text-sm mt-1">
                        Explanation: {question.explanation}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnitTestResultsPage;