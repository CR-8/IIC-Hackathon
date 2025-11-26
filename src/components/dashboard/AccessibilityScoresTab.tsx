"use client";

import { AnalysisResult } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { CircularProgress } from "./CircularProgress";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "./ProgressBar";
import {
  CheckCircle,
  Palette,
  Type,
  Layers,
  Ruler,
  Activity,
  Award,
  TrendingUp,
  Info,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AccessibilityScoresTabProps {
  data: AnalysisResult;
}

export function AccessibilityScoresTab({ data }: AccessibilityScoresTabProps) {
  // Calculate all scores
  const wcagScore =
    data.wcag.score === "AAA" ? 100 : data.wcag.score === "AA" ? 85 : 50;
  const contrastScore = Math.round(
    (data.contrast.lightMode.filter((c) => c.passes.AA).length /
      Math.max(data.contrast.lightMode.length, 1)) *
      100
  );
  const fontReadabilityScore = data.typography.readabilityScore;
  const visualHierarchyScore = data.hierarchy.priorityScore;
  const alignmentSpacingScore =
    data.sizing.feasibility === "Possible" ? 90 : 65;
  const overallScore = data.overallScore.score;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 75) return "text-blue-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 75) return "bg-blue-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const scores = [
    {
      title: "WCAG Accessibility Score",
      score: wcagScore,
      icon: <CheckCircle className="w-8 h-8" />,
      description: "Web Content Accessibility Guidelines compliance",
      details: `${data.wcag.errors.length} errors • ${data.wcag.warnings.length} warnings`,
      badge: data.wcag.score,
      tooltip: "Measures compliance with WCAG 2.1 standards (AA/AAA levels)",
    },
    {
      title: "Color Contrast Score",
      score: contrastScore,
      icon: <Palette className="w-8 h-8" />,
      description: "Text and background contrast ratios",
      details: `${data.contrast.lightMode.filter((c) => c.passes.AA).length}/${
        data.contrast.lightMode.length
      } passing`,
      badge: contrastScore >= 75 ? "Pass" : "Review",
      tooltip:
        "Evaluates color contrast ratios for readability (minimum 4.5:1 for AA)",
    },
    {
      title: "Font Readability Score",
      score: fontReadabilityScore,
      icon: <Type className="w-8 h-8" />,
      description: "Typography and text legibility",
      details: data.typography.pairings[0]?.primary || "Various fonts detected",
      badge: fontReadabilityScore >= 85 ? "Excellent" : "Good",
      tooltip: "Assesses font size, weight, spacing, and overall readability",
    },
    {
      title: "Visual Hierarchy Rating",
      score: visualHierarchyScore,
      icon: <Layers className="w-8 h-8" />,
      description: "Information architecture and flow",
      details: `${
        data.hierarchy.issues.dominantElements.length +
        data.hierarchy.issues.missingHeadings.length
      } issues`,
      badge: visualHierarchyScore >= 80 ? "Strong" : "Needs Work",
      tooltip:
        "Evaluates the clarity and organization of information hierarchy",
    },
    {
      title: "Alignment & Spacing Score",
      score: alignmentSpacingScore,
      icon: <Ruler className="w-8 h-8" />,
      description: "Layout consistency and spacing",
      details: data.sizing.feasibility,
      badge: data.sizing.feasibility === "Possible" ? "Good" : "Review",
      tooltip: "Measures element alignment, padding, and spacing consistency",
    },
    {
      title: "Overall UI Health Rating",
      score: overallScore,
      icon: <Activity className="w-8 h-8" />,
      description: "Comprehensive UI quality assessment",
      details: data.overallScore.label,
      badge: data.overallScore.label,
      tooltip: "Aggregate score across all UI quality dimensions",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Score Card */}
      <Card className="p-8 bg-linear-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <CircularProgress
              value={overallScore}
              size={200}
              strokeWidth={12}
              color={getScoreColor(overallScore)}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Award
                className={`w-20 h-20 ${getScoreColor(
                  overallScore
                )} opacity-20`}
              />
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-4xl font-bold mb-2">
              Overall UI Health Rating
            </h2>
            <p className="text-xl text-muted-foreground mb-4">
              Your UI scores{" "}
              <span className={`font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}%
              </span>{" "}
              - {data.overallScore.label}
            </p>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <Badge variant="outline" className="text-sm">
                WCAG: {data.wcag.score}
              </Badge>
              <Badge variant="outline" className="text-sm">
                Contrast: {contrastScore}%
              </Badge>
              <Badge variant="outline" className="text-sm">
                Readability: {fontReadabilityScore}%
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Individual Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scores.map((score, index) => (
          <Card
            key={index}
            className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30 group"
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`p-3 rounded-xl ${getScoreColor(
                        score.score
                      )} bg-current/10 group-hover:scale-110 transition-transform`}
                    >
                      {score.icon}
                    </div>
                    <Info className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{score.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <h3 className="font-bold text-lg mb-2">{score.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {score.description}
            </p>

            <div className="flex items-center justify-between mb-4">
              <span
                className={`text-3xl font-bold ${getScoreColor(score.score)}`}
              >
                {score.score}%
              </span>
              <Badge
                variant={score.score >= 75 ? "default" : "secondary"}
                className="text-xs"
              >
                {score.badge}
              </Badge>
            </div>

            <ProgressBar value={score.score} label="" className="mb-3" />

            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {score.details}
            </p>
          </Card>
        ))}
      </div>

      {/* Score Breakdown Details */}
      <Card className="p-6">
        <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
          <Activity className="w-6 h-6" />
          Detailed Score Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(data.overallScore.breakdown).map(([key, value]) => (
            <div key={key} className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
                <span className={`text-lg font-bold ${getScoreColor(value)}`}>
                  {value}%
                </span>
              </div>
              <div className="relative w-full bg-secondary rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ease-out ${getScoreBgColor(
                    value
                  )}`}
                  style={{ width: `${value}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {value >= 90
                  ? "Excellent - No issues detected"
                  : value >= 75
                  ? "Good - Minor improvements possible"
                  : value >= 60
                  ? "Fair - Some improvements needed"
                  : "Needs attention - Multiple issues found"}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
