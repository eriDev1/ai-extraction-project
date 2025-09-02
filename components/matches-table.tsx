"use client";

import { memo, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { MatchesTableProps } from "@/types";

const MatchesTable = memo<MatchesTableProps>(({ matches }) => {
  const sortedMatches = useMemo(() => {
    return [...matches].sort((a, b) => Math.abs(b.price_delta) - Math.abs(a.price_delta));
  }, [matches]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatPeriod = (start: string, end: string) => {
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const startFormatted = startDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
      const endFormatted = endDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
      return `${startFormatted} - ${endFormatted}`;
    } catch {
      return `${start} - ${end}`;
    }
  };

  const getDeltaBadgeVariant = (delta: number) => {
    if (delta > 0) return "destructive";
    if (delta < 0) return "secondary";
    return "outline";
  };

  const getDeltaColor = (delta: number) => {
    if (delta > 0) return "text-red-600";
    if (delta < 0) return "text-green-600";
    return "text-muted-foreground";
  };

  if (matches.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="text-lg font-medium mb-2">No matches found</div>
        <div className="text-sm">No common items were found between the two contracts.</div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-semibold text-foreground">Hotel</TableHead>
            <TableHead className="font-semibold text-foreground">Room Type</TableHead>
            <TableHead className="font-semibold text-foreground">Period</TableHead>
            <TableHead className="font-semibold text-foreground text-right">Contract A</TableHead>
            <TableHead className="font-semibold text-foreground text-right">Contract B</TableHead>
            <TableHead className="font-semibold text-foreground text-right">Difference</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedMatches.map((match, index) => (
            <TableRow 
              key={`${match.hotel_name}-${match.room_type}-${match.period_start}-${index}`}
              className={cn(
                "hover:bg-muted/30 transition-colors",
                "animate-in fade-in-0 slide-in-from-left-1"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TableCell className="font-medium max-w-[200px]">
                <div className="truncate" title={match.hotel_name}>
                  {match.hotel_name}
                </div>
              </TableCell>
              <TableCell className="max-w-[150px]">
                <div className="truncate" title={match.room_type}>
                  {match.room_type}
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground min-w-[140px]">
                {formatPeriod(match.period_start, match.period_end)}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {formatCurrency(match.price_a)}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {formatCurrency(match.price_b)}
              </TableCell>
              <TableCell className="text-right">
                <Badge
                  variant={getDeltaBadgeVariant(match.price_delta)}
                  className={cn(
                    "font-mono tabular-nums",
                    getDeltaColor(match.price_delta)
                  )}
                >
                  {match.price_delta > 0 ? "+" : ""}
                  {formatCurrency(match.price_delta)}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});

MatchesTable.displayName = "MatchesTable";

export { MatchesTable };
