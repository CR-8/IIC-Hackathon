"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid auto-rows-[minmax(100px,auto)] grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",
        className
      )}
    >
      {children}
    </div>
  );
}

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  span?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  rowSpan?: number;
}

export function BentoCard({
  children,
  className,
  span = { mobile: 1, tablet: 1, desktop: 1 },
  rowSpan = 1,
}: BentoCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-6 shadow-sm hover:shadow-md transition-all duration-300",
        span.mobile && `col-span-${span.mobile}`,
        span.tablet && `md:col-span-${span.tablet}`,
        span.desktop && `lg:col-span-${span.desktop}`,
        rowSpan && `row-span-${rowSpan}`,
        className
      )}
    >
      {children}
    </div>
  );
}
