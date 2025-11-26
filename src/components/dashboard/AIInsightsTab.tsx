"use client";

import { GeminiAnalysis } from "@/lib/types";
import { AnalysisCard } from "@/components/custom/AnalysisCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CircularProgress } from "./CircularProgress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Users,
  Layout,
  Palette,
  Type,
  Eye,
  TrendingUp,
  Target,
  Layers,
} from "lucide-react";

interface AIInsightsTabProps {
  data: GeminiAnalysis;
}

export function AIInsightsTab({ data }: AIInsightsTabProps) {
  const getQualityColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-blue-500";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  const getQualityLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Needs Improvement";
    return "Poor";
  };

  return (
    <div className="space-y-6">
      {/* Hero Section - Overall Quality */}
      <Card className="p-8 bg-linear-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Score Circle */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <CircularProgress
                value={data.overallQuality}
                size={200}
                strokeWidth={12}
                color={getQualityColor(data.overallQuality)}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary mb-2" />
                <p className="text-xs text-muted-foreground">AI Quality</p>
              </div>
            </div>
          </div>

          {/* UI Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">AI Analysis Report</h2>
              <Badge
                variant={data.overallQuality >= 60 ? "default" : "destructive"}
                className="text-sm px-3 py-1"
              >
                {getQualityLabel(data.overallQuality)} Design
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-background/80 backdrop-blur-sm rounded-xl border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Layout className="w-5 h-5 text-primary" />
                  <p className="text-sm font-semibold text-muted-foreground">
                    UI Type
                  </p>
                </div>
                <p className="text-lg font-bold">{data.uiType}</p>
              </div>

              <div className="p-4 bg-background/80 backdrop-blur-sm rounded-xl border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="w-5 h-5 text-primary" />
                  <p className="text-sm font-semibold text-muted-foreground">
                    Design System
                  </p>
                </div>
                <p className="text-lg font-bold">{data.designSystem}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-green-500/10 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {data.strengths.length}
                </p>
                <p className="text-xs text-muted-foreground">Strengths</p>
              </div>
              <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">
                  {data.weaknesses.length}
                </p>
                <p className="text-xs text-muted-foreground">Weaknesses</p>
              </div>
              <div className="text-center p-3 bg-red-500/10 rounded-lg">
                <p className="text-2xl font-bold text-red-600">
                  {data.accessibilityIssues.length}
                </p>
                <p className="text-xs text-muted-foreground">A11y Issues</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Key Recommendations - Priority Section */}
      <Card className="p-6 bg-linear-to-br from-amber-500/5 to-transparent border-2 border-amber-500/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-500/10 rounded-xl">
            <Lightbulb className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Priority Recommendations</h3>
            <p className="text-sm text-muted-foreground">
              {data.recommendations.length} actionable improvements identified
              by AI
            </p>
          </div>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {data.recommendations.map((rec, idx) => (
              <div
                key={`rec-${idx}`}
                className="group flex gap-4 p-4 rounded-xl bg-background border border-border hover:border-amber-500/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="shrink-0">
                  <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center text-lg font-bold shadow-lg">
                    {idx + 1}
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm leading-relaxed font-medium">{rec}</p>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Target className="w-3 h-3 text-amber-600" />
                    <span className="text-xs text-muted-foreground">
                      {idx < 3
                        ? "High Priority"
                        : idx < 5
                        ? "Medium Priority"
                        : "Low Priority"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Strengths and Weaknesses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card className="p-6 bg-linear-to-br from-green-500/5 to-transparent border-2 border-green-500/20">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <h3 className="text-lg font-bold">Design Strengths</h3>
          </div>
          <ScrollArea className="h-[300px] pr-4">
            <ul className="space-y-3">
              {data.strengths.map((strength, idx) => (
                <li
                  key={`strength-${idx}`}
                  className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/10 hover:border-green-500/30 transition-colors"
                >
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm leading-relaxed">{strength}</span>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </Card>

        {/* Weaknesses */}
        <Card className="p-6 bg-linear-to-br from-yellow-500/5 to-transparent border-2 border-yellow-500/20">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-yellow-500" />
            <h3 className="text-lg font-bold">Areas for Improvement</h3>
          </div>
          <ScrollArea className="h-[300px] pr-4">
            <ul className="space-y-3">
              {data.weaknesses.map((weakness, idx) => (
                <li
                  key={`weakness-${idx}`}
                  className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10 hover:border-yellow-500/30 transition-colors"
                >
                  <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                  <span className="text-sm leading-relaxed">{weakness}</span>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </Card>
      </div>

      {/* Accessibility Issues - Critical Section */}
      <Card className="p-6 bg-linear-to-br from-red-500/5 to-transparent border-2 border-red-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-red-500/10 rounded-xl">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Critical Accessibility Issues</h3>
            <p className="text-sm text-muted-foreground">
              {data.accessibilityIssues.length} WCAG compliance issues detected
            </p>
          </div>
        </div>
        <ScrollArea className="h-[350px] pr-4">
          <div className="space-y-3">
            {data.accessibilityIssues.map((issue, idx) => (
              <div
                key={`a11y-${idx}`}
                className="flex gap-3 p-4 rounded-lg bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 transition-colors"
              >
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm leading-relaxed font-medium">{issue}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Detailed Analysis Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Color Scheme Analysis */}
        <AnalysisCard
          title="Color Scheme Analysis"
          icon={<Palette className="w-5 h-5 text-primary" />}
          className="bg-linear-to-br from-purple-500/5 to-transparent"
        >
          <p className="text-sm leading-relaxed text-foreground/90">
            {data.colorSchemeAnalysis}
          </p>
        </AnalysisCard>

        {/* Layout Analysis */}
        <AnalysisCard
          title="Layout & Structure"
          icon={<Layout className="w-5 h-5 text-primary" />}
          className="bg-linear-to-br from-blue-500/5 to-transparent"
        >
          <p className="text-sm leading-relaxed text-foreground/90">
            {data.layoutAnalysis}
          </p>
        </AnalysisCard>

        {/* Typography Analysis */}
        <AnalysisCard
          title="Typography Analysis"
          icon={<Type className="w-5 h-5 text-primary" />}
          className="bg-linear-to-br from-indigo-500/5 to-transparent"
        >
          <p className="text-sm leading-relaxed text-foreground/90">
            {data.typographyAnalysis}
          </p>
        </AnalysisCard>

        {/* User Experience */}
        <AnalysisCard
          title="User Experience Assessment"
          icon={<Eye className="w-5 h-5 text-primary" />}
          className="bg-linear-to-br from-teal-500/5 to-transparent"
        >
          <p className="text-sm leading-relaxed text-foreground/90">
            {data.userExperience}
          </p>
        </AnalysisCard>
      </div>

      {/* Target Audience */}
      <Card className="p-6 bg-linear-to-br from-primary/5 to-transparent border border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-bold">Target Audience Match</h3>
        </div>
        <p className="text-sm leading-relaxed text-foreground/90">
          {data.targetAudienceMatch}
        </p>
      </Card>

      {/* Summary Stats */}
      <Card className="p-6 bg-linear-to-br from-primary/5 to-transparent">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Analysis Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-background rounded-lg border border-border text-center">
            <p className="text-3xl font-bold text-primary">
              {data.overallQuality}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Overall Quality
            </p>
          </div>
          <div className="p-4 bg-background rounded-lg border border-border text-center">
            <p className="text-3xl font-bold text-green-600">
              {data.strengths.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Strengths</p>
          </div>
          <div className="p-4 bg-background rounded-lg border border-border text-center">
            <p className="text-3xl font-bold text-yellow-600">
              {data.weaknesses.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">To Improve</p>
          </div>
          <div className="p-4 bg-background rounded-lg border border-border text-center">
            <p className="text-3xl font-bold text-red-600">
              {data.accessibilityIssues.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Critical Issues
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
