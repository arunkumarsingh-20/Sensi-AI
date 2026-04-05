import { Brain, Target, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

export default function StatsCards({ assessments = [] }) {
  const safeAssessments = Array.isArray(assessments) ? assessments : [];

  const averageScore = safeAssessments.length
    ? (
        safeAssessments.reduce((sum, assessment) => sum + toNumber(assessment.quizScore), 0) /
        safeAssessments.length
      ).toFixed(1)
    : "0.0";

  const totalQuestions = safeAssessments.reduce((sum, assessment) => {
    const questionsCount = Array.isArray(assessment.questions)
      ? assessment.questions.length
      : 0;
    return sum + questionsCount;
  }, 0);

  const latestAssessment = safeAssessments[0];
  const latestScore = latestAssessment ? toNumber(latestAssessment.quizScore).toFixed(1) : "0.0";

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageScore}%</div>
          <p className="text-xs text-muted-foreground">Across all assessments</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Questions Practiced</CardTitle>
          <Brain className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalQuestions}</div>
          <p className="text-xs text-muted-foreground">Total questions</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Latest Score</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{latestScore}%</div>
          <p className="text-xs text-muted-foreground">Most recent quiz</p>
        </CardContent>
      </Card>
    </div>
  );
}
