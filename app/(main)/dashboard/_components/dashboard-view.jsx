"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BriefcaseIcon,
  LineChart,
  TrendingUp,
  TrendingDown,
  Brain,
} from "lucide-react";
import { format, formatDistanceToNow, isValid } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const getDemandLevelColor = (level) => {
  switch (String(level ?? "").toLowerCase()) {
    case "high":
      return "bg-green-500";
    case "medium":
      return "bg-yellow-500";
    case "low":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

const getMarketOutlookInfo = (outlook) => {
  switch (String(outlook ?? "").toLowerCase()) {
    case "positive":
      return { icon: TrendingUp, color: "text-green-500" };
    case "neutral":
      return { icon: LineChart, color: "text-yellow-500" };
    case "negative":
      return { icon: TrendingDown, color: "text-red-500" };
    default:
      return { icon: LineChart, color: "text-gray-500" };
  }
};

const formatDateSafely = (value, formatter) => {
  const date = new Date(value);
  return isValid(date) ? formatter(date) : "N/A";
};

const DashboardView = ({ insights }) => {
  const safeInsights = insights ?? {};

  const salaryRanges = Array.isArray(safeInsights.salaryRanges)
    ? safeInsights.salaryRanges
    : [];

  const topSkills = Array.isArray(safeInsights.topSkills)
    ? safeInsights.topSkills
    : [];

  const keyTrends = Array.isArray(safeInsights.keyTrends)
    ? safeInsights.keyTrends
    : [];

  const recommendedSkills = Array.isArray(safeInsights.recommendedSkills)
    ? safeInsights.recommendedSkills
    : [];

  const salaryData = salaryRanges
    .map((range) => ({
      name: String(range?.role ?? "").trim(),
      min: Number(range?.min ?? 0) / 1000,
      max: Number(range?.max ?? 0) / 1000,
      median: Number(range?.median ?? 0) / 1000,
    }))
    .filter((item) => item.name);

  const outlookInfo = getMarketOutlookInfo(safeInsights.marketOutlook);
  const OutlookIcon = outlookInfo.icon;
  const outlookColor = outlookInfo.color;

  const growthRate = Number(safeInsights.growthRate);
  const normalizedGrowthRate = Number.isFinite(growthRate) ? growthRate : 0;

  const lastUpdatedDate = formatDateSafely(safeInsights.lastUpdated, (date) =>
    format(date, "dd/MM/yyyy")
  );

  const nextUpdateDistance = formatDateSafely(
    safeInsights.nextUpdate,
    (date) => formatDistanceToNow(date, { addSuffix: true })
  );

  if (!salaryData.length && !topSkills.length && !keyTrends.length && !recommendedSkills.length) {
    return (
      <div className="rounded-lg border p-6 text-sm text-muted-foreground">
        No industry insight data is available yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Badge variant="outline">Last updated: {lastUpdatedDate}</Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Outlook</CardTitle>
            <OutlookIcon className={`h-4 w-4 ${outlookColor}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeInsights.marketOutlook ?? "N/A"}</div>
            <p className="text-xs text-muted-foreground">
              Next update {nextUpdateDistance}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Industry Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{normalizedGrowthRate.toFixed(1)}%</div>
            <Progress value={Math.min(Math.max(normalizedGrowthRate, 0), 100)} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demand Level</CardTitle>
            <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeInsights.demandLevel ?? "N/A"}</div>
            <div
              className={`mt-2 h-2 w-full rounded-full ${getDemandLevelColor(
                safeInsights.demandLevel
              )}`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Skills</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {topSkills.length ? (
                topSkills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No skills available</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Salary Ranges by Role</CardTitle>
          <CardDescription>
            Displaying minimum, median, and maximum salaries (in thousands)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            {salaryData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salaryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload?.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-md">
                            <p className="font-medium">{label}</p>
                            {payload.map((item) => (
                              <p key={item.dataKey ?? item.name} className="text-sm">
                                {item.name}: ${item.value}K
                              </p>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="min" fill="#94a3b8" name="Min Salary (K)" />
                  <Bar dataKey="median" fill="#64748b" name="Median Salary (K)" />
                  <Bar dataKey="max" fill="#475569" name="Max Salary (K)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                No salary data available yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Key Industry Trends</CardTitle>
            <CardDescription>Current trends shaping the industry</CardDescription>
          </CardHeader>
          <CardContent>
            {keyTrends.length ? (
              <ul className="space-y-4">
                {keyTrends.map((trend, index) => (
                  <li key={`${trend}-${index}`} className="flex items-start space-x-2">
                    <div className="mt-2 h-2 w-2 rounded-full bg-primary" />
                    <span>{trend}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No trends available.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommended Skills</CardTitle>
            <CardDescription>Skills to consider developing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {recommendedSkills.length ? (
                recommendedSkills.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No skill recommendations available.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardView;
