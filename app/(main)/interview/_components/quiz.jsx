// app/(main)/interview/_components/quiz.jsx
"use client";

import { useEffect, useState } from "react";
import { BarLoader } from "react-spinners";
import { toast } from "sonner";
import { generateQuiz, saveQuizResult } from "@/actions/interview";
import useFetch from "@/hooks/use-fetch";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import QuizResult from "./quiz-result";

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);

  const {
    loading: generatingQuiz,
    fn: generateQuizFn,
    data: quizData,
    error: generateError,
    setData: setQuizData,
  } = useFetch(generateQuiz);

  const {
    loading: savingResult,
    fn: saveQuizResultFn,
    data: resultData,
    setData: setResultData,
  } = useFetch(saveQuizResult);

  const quizQuestions = Array.isArray(quizData) ? quizData : [];
  const currentQuizQuestion = quizQuestions[currentQuestion];

  useEffect(() => {
    if (!quizQuestions.length) return;

    setCurrentQuestion(0);
    setAnswers(new Array(quizQuestions.length).fill(null));
    setShowExplanation(false);
  }, [quizData]);

  const handleAnswer = (answer) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentQuestion] = answer;
      return next;
    });
  };

  const calculateScore = () => {
    if (!quizQuestions.length) return 0;

    const correctCount = quizQuestions.reduce((count, question, index) => {
      return count + (answers[index] === question.correctAnswer ? 1 : 0);
    }, 0);

    return (correctCount / quizQuestions.length) * 100;
  };

  const handleNext = async () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setShowExplanation(false);
      return;
    }

    const score = calculateScore();

    try {
      await saveQuizResultFn(quizQuestions, answers, score);
      toast.success("Quiz completed!");
    } catch (error) {
      toast.error(error?.message || "Failed to save quiz results");
    }
  };

  const startNewQuiz = async () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowExplanation(false);
    setResultData(null);
    setQuizData(null);

    try {
      await generateQuizFn();
    } catch (error) {
      toast.error(error?.message || "Failed to generate quiz");
    }
  };

  if (generatingQuiz) {
    return (
      <Card className="mx-2">
        <CardContent className="py-6">
          <BarLoader className="mt-4" width="100%" color="gray" />
          <p className="mt-4 text-sm text-muted-foreground">
            Generating your quiz questions...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (generateError && !quizQuestions.length) {
    return (
      <Card className="mx-2">
        <CardHeader>
          <CardTitle>Could not generate quiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {generateError.message || "Something went wrong while creating your quiz."}
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full cursor-pointer" onClick={startNewQuiz}>
            Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (resultData) {
    return (
      <div className="mx-2">
        <QuizResult result={resultData} onStartNew={startNewQuiz} />
      </div>
    );
  }

  if (!quizQuestions.length) {
    return (
      <Card className="mx-2">
        <CardHeader>
          <CardTitle>Ready to test your knowledge?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            This quiz contains 10 questions specific to your industry and skills.
            Take your time and choose the best answer for each question.
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full cursor-pointer" onClick={startNewQuiz} disabled={generatingQuiz}>
            Start Quiz
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (!currentQuizQuestion) {
    return (
      <Card className="mx-2">
        <CardHeader>
          <CardTitle>Quiz unavailable</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            We could not load the current question set. Please try starting a new quiz.
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full cursor-pointer" onClick={startNewQuiz}>
            Start New Quiz
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const selectedAnswer = answers[currentQuestion];

  return (
    <Card className="mx-2">
      <CardHeader>
        <CardTitle>
          Question {currentQuestion + 1} of {quizQuestions.length}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-lg font-medium">{currentQuizQuestion.question}</p>

        <RadioGroup
          onValueChange={handleAnswer}
          value={selectedAnswer ?? ""}
          className="space-y-2"
        >
          {currentQuizQuestion.options.map((option, index) => (
            <div key={`${currentQuestion}-${index}`} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`option-${currentQuestion}-${index}`} />
              <Label htmlFor={`option-${currentQuestion}-${index}`}>{option}</Label>
            </div>
          ))}
        </RadioGroup>

        {showExplanation && (
          <div className="mt-4 rounded-lg bg-muted p-4">
            <p className="font-medium">Explanation:</p>
            <p className="text-muted-foreground">{currentQuizQuestion.explanation}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2">
        {!showExplanation && (
          <Button
            onClick={() => setShowExplanation(true)}
            variant="outline"
            disabled={!selectedAnswer}
            className="cursor-pointer"
          >
            Show Explanation
          </Button>
        )}

        <Button
          onClick={handleNext}
          className="ml-auto cursor-pointer"
          disabled={!selectedAnswer || savingResult}
        >
          {savingResult ? (
            <>
              <BarLoader className="mr-2" width="48" color="white" />
              Saving...
            </>
          ) : currentQuestion < quizQuestions.length - 1 ? (
            "Next Question"
          ) : (
            "Finish Quiz"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Quiz;
