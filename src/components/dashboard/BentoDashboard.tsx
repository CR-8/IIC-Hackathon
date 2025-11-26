"use client";

import { AnalysisResult } from "@/lib/types";
import { BentoGrid, BentoCard } from "./BentoGrid";
import { BentoStatsCard } from "./BentoStatsCard";
import { BentoChartCard } from "./BentoChartCard";
import { BentoListCard } from "./BentoListCard";
import { CircularProgress } from "./CircularProgress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  AlertCircle,
  Palette,
  Type,
  Layers,
  Sparkles,
  Activity,
  Users,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface BentoDashboardProps {
  data: AnalysisResult;
}

export function BentoDashboard({ data }: BentoDashboardProps) {
  // Calculate scores
  const wcagScore =
    data.wcag.score === "AAA" ? 100 : data.wcag.score === "AA" ? 85 : 50;
  const contrastScore = Math.round(
    (data.contrast.lightMode.filter((c) => c.passes.AA).length /
      Math.max(data.contrast.lightMode.length, 1)) *
      100
  );
  const overallScore = data.overallScore.score;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 75) return "text-yellow-500";
    return "text-red-500";
  };

  const getTrend = (score: number): "up" | "down" | "neutral" => {
    if (score >= 80) return "up";
    if (score >= 60) return "neutral";
    return "down";
  };

  // Prepare issues list
  const issuesList = [
    ...data.wcag.errors.slice(0, 3).map((err, idx) => ({
      id: `wcag-${idx}`,
      title: err,
      status: "Critical",
      statusVariant: "destructive" as const,
      icon: <AlertCircle className="w-4 h-4" />,
    })),
    ...data.wcag.warnings.slice(0, 2).map((warn, idx) => ({
      id: `warn-${idx}`,
      title: warn,
      status: "Warning",
      statusVariant: "secondary" as const,
      icon: <AlertCircle className="w-4 h-4" />,
    })),
  ];

  // Prepare recommendations
  const recommendations = [
    ...(data.gemini?.recommendations || []).slice(0, 4).map((rec, idx) => ({
      id: `rec-${idx}`,
      title: rec,
      icon: <Sparkles className="w-4 h-4" />,
    })),
    ...data.hierarchy.suggestions.slice(0, 2).map((sug, idx) => ({
      id: `hier-${idx}`,
      title: sug,
      icon: <Layers className="w-4 h-4" />,
    })),
  ];

  // Color palette
  const topColors = data.schemes.suggestions[0]?.tokens
    ? Object.entries(data.schemes.suggestions[0].tokens).slice(0, 6)
    : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Plan, prioritize, and accomplish your tasks with ease.
          </p>
        </div>
      </div>

      {/* Main Bento Grid */}
      <BentoGrid>
        {/* Overall Score - Large Card */}
        <BentoCard className="col-span-1 md:col-span-1 lg:col-span-1 row-span-2 bg-linear-to-br from-primary to-primary/80 text-primary-foreground border-0">
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium mb-4">
                <Activity className="w-3 h-3" />
                Overall Score
              </div>
              <div className="text-6xl font-bold mb-2">{overallScore}</div>
              <p className="text-primary-foreground/80 text-sm">
                {data.overallScore.label}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-primary-foreground/80">
                <span>Progress this month</span>
                <span className="font-medium text-primary-foreground">
                  +{Math.round(overallScore / 10)}%
                </span>
              </div>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${overallScore}%` }}
                />
              </div>
            </div>
          </div>
        </BentoCard>

        {/* WCAG Score */}
        <BentoCard className="col-span-1">
          <BentoStatsCard
            title="WCAG Compliance"
            value={data.wcag.score}
            icon={<CheckCircle className="w-5 h-5" />}
            change={{ value: wcagScore - 75, label: "from last check" }}
            trend={getTrend(wcagScore)}
            description={`${data.wcag.errors.length} errors found`}
          />
        </BentoCard>

        {/* Contrast Score */}
        <BentoCard className="col-span-1">
          <BentoStatsCard
            title="Contrast Score"
            value={`${contrastScore}%`}
            icon={<Palette className="w-5 h-5" />}
            change={{ value: contrastScore - 80, label: "vs standard" }}
            trend={getTrend(contrastScore)}
            description={`${
              data.contrast.lightMode.filter((c) => c.passes.AA).length
            } passing`}
          />
        </BentoCard>

        {/* Typography Score */}
        <BentoCard className="col-span-1">
          <BentoStatsCard
            title="Typography"
            value={data.typography.readabilityScore}
            icon={<Type className="w-5 h-5" />}
            trend={getTrend(data.typography.readabilityScore)}
            description="Readability score"
          />
        </BentoCard>

        {/* Visual Hierarchy */}
        <BentoCard className="col-span-1">
          <BentoStatsCard
            title="Visual Hierarchy"
            value={data.hierarchy.priorityScore}
            icon={<Layers className="w-5 h-5" />}
            trend={getTrend(data.hierarchy.priorityScore)}
            description={`${
              Object.values(data.hierarchy.issues).flat().length
            } issues`}
          />
        </BentoCard>

        {/* Score Breakdown Chart */}
        <BentoCard className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2">
          <BentoChartCard
            title="Accessibility Breakdown"
            description="Component scores across categories"
          >
            <div className="w-full grid grid-cols-3 gap-4">
              {Object.entries(data.overallScore.breakdown).map(
                ([key, value]) => (
                  <div key={key} className="flex flex-col items-center">
                    <CircularProgress
                      value={value}
                      size={80}
                      strokeWidth={6}
                      className={getScoreColor(value)}
                    />
                    <p className="text-xs font-medium mt-2 capitalize">{key}</p>
                    <p className="text-xs text-muted-foreground">{value}%</p>
                  </div>
                )
              )}
            </div>
          </BentoChartCard>
        </BentoCard>

        {/* Target Audience */}
        <BentoCard className="col-span-1">
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Target Audience</h3>
              </div>
              <p className="text-2xl font-bold mb-1">
                {data.audience.detected[0]?.category || "General"}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {data.audience.suggestions.slice(0, 1).join(" • ")}
              </p>
            </div>
            {data.audience.detected[0]?.confidence && (
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Confidence</span>
                  <span className="font-medium">
                    {Math.round(data.audience.detected[0].confidence * 100)}%
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{
                      width: `${Math.round(
                        data.audience.detected[0].confidence * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </BentoCard>
        {/* Color Palette */}
        <BentoCard className="col-span-1 md:col-span-1 lg:col-span-1">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Color Palette</h3>
              <Badge variant="outline" className="rounded-full">
                {topColors.length} colors
              </Badge>
            </div>
            <div className="flex-1 grid grid-cols-3 gap-2">
              {topColors.map(([, color], idx) => (
                <div key={idx} className="group relative">
                  <div
                    className="aspect-square rounded-lg border border-border transition-transform group-hover:scale-105"
                    style={{ backgroundColor: color }}
                  />
                  <p className="text-[10px] text-center mt-1 text-muted-foreground truncate">
                    {color}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </BentoCard>

        {/* AI Recommendations */}
        <BentoCard className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2">
          <BentoListCard
            title="AI Recommendations"
            items={recommendations}
            headerAction={
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Sparkles className="w-3 h-3" />
                <span>Powered by Gemini</span>
              </div>
            }
          />
        </BentoCard>
        {/* Issues List */}
        <BentoCard className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2">
          <BentoListCard
            title="Critical Issues"
            items={issuesList}
            headerAction={
              <Badge variant="destructive" className="rounded-full">
                {data.wcag.errors.length}
              </Badge>
            }
            emptyMessage="No critical issues found! 🎉"
          />
        </BentoCard>
      </BentoGrid>
    </div>
  );
}
