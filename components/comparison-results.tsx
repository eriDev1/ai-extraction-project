"use client";

import { memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SummaryStats } from "./summary-stats";
import { MatchesTable } from "./matches-table";
import { UniqueItemsTable } from "./items-table";
import { cn } from "@/lib/utils";
import type { ComparisonResultsProps } from "@/types";

const ComparisonResults = memo<ComparisonResultsProps>(({ data, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="space-y-8">
        <SummaryStats 
          matches={0} 
          onlyInA={0} 
          onlyInB={0} 
          isLoading={true} 
        />
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="border-0 shadow-lg bg-card/50 backdrop-blur">
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-muted rounded w-48" />
                  <div className="h-4 bg-muted rounded w-64" />
                  <div className="h-32 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const { comparison } = data;

  return (
    <div className={cn(
      "space-y-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
    )}>
      <SummaryStats 
        matches={comparison.matches.length}
        onlyInA={comparison.only_in_a.length}
        onlyInB={comparison.only_in_b.length}
      />

      {comparison.matches.length > 0 && (
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl flex items-center gap-2">
              Price Comparison Matches
            </CardTitle>
            <CardDescription className="text-base">
              Items found in both contracts with price differences, sorted by largest difference
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MatchesTable matches={comparison.matches} />
          </CardContent>
        </Card>
      )}

      {comparison.only_in_a.length > 0 && (
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur">
          <CardContent className="pt-6">
            <UniqueItemsTable
              items={comparison.only_in_a}
              title="Only in Contract A"
              description={`${comparison.only_in_a.length} items found exclusively in Contract A`}
              variant="contractA"
            />
          </CardContent>
        </Card>
      )}

      {comparison.only_in_b.length > 0 && (
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur">
          <CardContent className="pt-6">
            <UniqueItemsTable
              items={comparison.only_in_b}
              title="Only in Contract B"
              description={`${comparison.only_in_b.length} items found exclusively in Contract B`}
              variant="contractB"
            />
          </CardContent>
        </Card>
      )}

      {comparison.matches.length === 0 && 
       comparison.only_in_a.length === 0 && 
       comparison.only_in_b.length === 0 && (
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="text-lg font-medium text-muted-foreground mb-2">
                No data found
              </div>
              <div className="text-sm text-muted-foreground">
                No pricing information could be extracted from the uploaded files.
                Please ensure your files contain structured pricing data.
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

ComparisonResults.displayName = "ComparisonResults";

export { ComparisonResults };
