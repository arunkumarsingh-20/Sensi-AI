"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import QuizResult from "./quiz-result";

const safeScore = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

export default function QuizList({ assessments = [] }) {
  const router = useRouter();
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const sortedAssessments = useMemo(() => {
    if (!Array.isArray(assessments)) return [];
    return [...assessments].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [assessments]);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="gradient-title text-3xl md:text-4xl">
                Recent Quizzes
              </CardTitle>
              <CardDescription>Review your past quiz performance</CardDescription>
            </div>

            <Button
              className="cursor-pointer"
              onClick={() => router.push("/interview/mock")}
            >
              Start New Quiz
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {sortedAssessments.length ? (
              sortedAssessments.map((assessment, index) => (
                <Card
                  key={assessment.id}
                  className="cursor-pointer transition-colors hover:bg-muted/50"
                  onClick={() => setSelectedQuiz(assessment)}
                >
                  <CardHeader>
                    <CardTitle className="gradient-title text-2xl">
                      Quiz {index + 1}
                    </CardTitle>
                    <CardDescription className="flex w-full justify-between gap-4">
                      <div>Score: {safeScore(assessment.quizScore).toFixed(1)}%</div>
                      <div>
                        {format(new Date(assessment.createdAt), "MMMM dd, yyyy HH:mm")}
                      </div>
                    </CardDescription>
                  </CardHeader>

                  {assessment.improvementTip ? (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {assessment.improvementTip}
                      </p>
                    </CardContent>
                  ) : null}
                </Card>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No quiz history yet. Start your first quiz to see results here.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedQuiz)} onOpenChange={(open) => !open && setSelectedQuiz(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Quiz Details</DialogTitle>
          </DialogHeader>

          {selectedQuiz ? (
            <QuizResult
              result={selectedQuiz}
              hideStartNew
              onStartNew={() => router.push("/interview/mock")}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
