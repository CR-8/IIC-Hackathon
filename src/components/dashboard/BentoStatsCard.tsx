"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface BentoStatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    label: string;
  };
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  description?: string;
  className?: string;
}

export function BentoStatsCard({
  title,
  value,
  change,
  icon,
  trend = "neutral",
  description,
  className,
}: BentoStatsCardProps) {
  const getTrendIcon = () => {
    if (trend === "up") return <TrendingUp className="w-3 h-3" />;
    if (trend === "down") return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  const getTrendColor = () => {
    if (trend === "up") return "text-green-500";
    if (trend === "down") return "text-red-500";
    return "text-muted-foreground";
  };

  return (
    <div className={cn("flex flex-col h-full justify-between", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
        </div>
        {icon && (
          <div className="p-3 rounded-xl bg-primary/5 text-primary">{icon}</div>
        )}
      </div>

      {(change || description) && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          {change && (
            <div
              className={cn(
                "flex items-center gap-1 font-medium",
                getTrendColor()
              )}
            >
              {getTrendIcon()}
              <span>
                {change.value > 0 ? "+" : ""}
                {change.value}%
              </span>
            </div>
          )}
          {description && (
            <span className="text-muted-foreground">{description}</span>
          )}
          {change?.label && (
            <span className="text-muted-foreground">{change.label}</span>
          )}
        </div>
      )}
    </div>
  );
}
