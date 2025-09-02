"use client";

import { memo } from "react";
import { TrendingUp, FileText, GitCompare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SummaryStatsProps } from "@/types";

const SummaryStats = memo<SummaryStatsProps>(({ 
  matches, 
  onlyInA, 
  onlyInB, 
  isLoading = false 
}) => {
  const stats = [
    {
      label: "Matches Found",
      value: matches,
      icon: GitCompare,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Only in Contract A",
      value: onlyInA,
      icon: FileText,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      label: "Only in Contract B",
      value: onlyInB,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-0 shadow-lg bg-card/50 backdrop-blur">
            <CardContent className="pt-6">
              <div className="animate-pulse space-y-3">
                <div className="h-8 bg-muted rounded w-16 mx-auto" />
                <div className="h-4 bg-muted rounded w-24 mx-auto" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={stat.label}
            className={cn(
              "border-0 shadow-lg bg-card/50 backdrop-blur transition-all duration-300 hover:shadow-xl hover:scale-105",
              "animate-in fade-in-0 slide-in-from-bottom-4",
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="pt-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <div className={cn("p-2 rounded-full", stat.bgColor)}>
                  <Icon className={cn("w-5 h-5", stat.color)} />
                </div>
              </div>
              <div className={cn("text-3xl font-bold mb-1", stat.color)}>
                {stat.value.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {stat.label}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});

SummaryStats.displayName = "SummaryStats";

export { SummaryStats };
