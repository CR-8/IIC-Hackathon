"use client";

import { AnalysisResult } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { CircularProgress } from "./CircularProgress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Palette,
  Type,
  Layers,
  Ruler,
  Activity,
  AlertCircle,
  TrendingUp,
  Lightbulb,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ScoresDashboardProps {
  data: AnalysisResult;
}

export function ScoresDashboard({ data }: ScoresDashboardProps) {
  // Calculate scores
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

  // Aggregate all suggestions
  const allSuggestions = [
    ...data.hierarchy.suggestions,
    ...data.wcag.errors.map((err) => `WCAG: ${err}`),
    ...data.wcag.warnings.map((warn) => `Warning: ${warn}`),
    ...data.sizing.problemAreas.map((area) => `Sizing: ${area}`),
    ...data.contrast.recommendations
      .slice(0, 3)
      .map((rec) => `Improve contrast for color ${rec.color}`),
    ...(data.gemini?.recommendations || []).slice(0, 5),
  ]
    .filter(Boolean)
    .slice(0, 12);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 75) return "text-blue-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 75) return "Good";
    if (score >= 60) return "Fair";
    return "Poor";
  };

  const scoreCards = [
    {
      title: "WCAG Accessibility Score",
      score: wcagScore,
      icon: <CheckCircle className="w-6 h-6" />,
      description: `${data.wcag.errors.length} errors, ${data.wcag.warnings.length} warnings`,
      badge: data.wcag.score,
    },
    {
      title: "Color Contrast Score",
      score: contrastScore,
      icon: <Palette className="w-6 h-6" />,
      description: `${
        data.contrast.lightMode.filter((c) => c.passes.AA).length
      }/${data.contrast.lightMode.length} passing combinations`,
      badge: contrastScore >= 75 ? "Pass" : "Fail",
    },
    {
      title: "Font Readability Score",
      score: fontReadabilityScore,
      icon: <Type className="w-6 h-6" />,
      description: data.typography.pairings[0]?.primary || "Analysis completed",
      badge: getScoreLabel(fontReadabilityScore),
    },
    {
      title: "Visual Hierarchy Rating",
      score: visualHierarchyScore,
      icon: <Layers className="w-6 h-6" />,
      description: `${
        data.hierarchy.issues.dominantElements.length +
        data.hierarchy.issues.missingHeadings.length
      } issues found`,
      badge: getScoreLabel(visualHierarchyScore),
    },
    {
      title: "Alignment & Spacing Score",
      score: alignmentSpacingScore,
      icon: <Ruler className="w-6 h-6" />,
      description: data.sizing.feasibility,
      badge: data.sizing.feasibility === "Possible" ? "Good" : "Review",
    },
    {
      title: "Overall UI Health Rating",
      score: overallScore,
      icon: <Activity className="w-6 h-6" />,
      description: data.overallScore.label,
      badge: data.overallScore.label,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Main Scores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scoreCards.map((card, index) => (
          <Card
            key={index}
            className="p-6 hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`${getScoreColor(card.score)}`}>
                    {card.icon}
                  </div>
                  <h3 className="font-semibold text-sm">{card.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {card.description}
                </p>
              </div>
              <Badge
                variant={card.score >= 75 ? "default" : "destructive"}
                className="shrink-0"
              >
                {card.badge}
              </Badge>
            </div>

            <div className="flex items-center justify-center">
              <CircularProgress
                value={card.score}
                size={120}
                strokeWidth={8}
                color={getScoreColor(card.score)}
              />
            </div>
          </Card>
        ))}
      </div>

      {/* Suggestions Section */}
      <Card className="p-6 bg-linear-to-br from-primary/5 to-transparent border-2 border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Lightbulb className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Suggestions for Improvement</h3>
            <p className="text-sm text-muted-foreground">
              Actionable recommendations to enhance your UI
            </p>
          </div>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {allSuggestions.length > 0 ? (
              allSuggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 p-4 rounded-lg bg-background border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="shrink-0 mt-1">
                    {suggestion.toLowerCase().includes("error") ||
                    suggestion.toLowerCase().includes("wcag") ? (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    ) : suggestion.toLowerCase().includes("warning") ? (
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed">{suggestion}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500 opacity-50" />
                <p className="text-lg font-medium">Great Job!</p>
                <p className="text-sm">
                  No major improvements needed at this time.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Detailed Breakdown */}
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">Score Breakdown</h3>
        <div className="space-y-4">
          {Object.entries(data.overallScore.breakdown).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
                <span className={`text-sm font-bold ${getScoreColor(value)}`}>
                  {value}%
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ease-out rounded-full ${
                    value >= 90
                      ? "bg-green-500"
                      : value >= 75
                      ? "bg-blue-500"
                      : value >= 60
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
