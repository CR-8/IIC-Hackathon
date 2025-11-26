"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressItem {
  label: string;
  value: number;
  color?: string;
  description?: string;
}

interface BentoProgressCardProps {
  title: string;
  items: ProgressItem[];
  className?: string;
}

export function BentoProgressCard({
  title,
  items,
  className,
}: BentoProgressCardProps) {
  return (
    <div className={cn("flex flex-col h-full", className)}>
      <h3 className="text-sm font-semibold mb-4">{title}</h3>

      <div className="space-y-4 flex-1">
        {items.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-semibold">{item.value}%</span>
            </div>
            <Progress value={item.value} className="h-2" />
            {item.description && (
              <p className="text-xs text-muted-foreground">
                {item.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
