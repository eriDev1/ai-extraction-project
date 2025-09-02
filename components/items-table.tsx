"use client";

import { memo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { UniqueItemsTableProps } from "@/types";

const UniqueItemsTable = memo<UniqueItemsTableProps>(({ 
  items, 
  title, 
  description, 
  variant 
}) => {
  const variantStyles = {
    contractA: {
      headerBg: "bg-orange-50/50",
      rowHover: "hover:bg-orange-50/30",
      titleColor: "text-orange-600",
    },
    contractB: {
      headerBg: "bg-blue-50/50",
      rowHover: "hover:bg-blue-50/30",
      titleColor: "text-blue-600",
    },
  };

  const currentVariant = variantStyles[variant];

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

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className={cn("text-xl font-semibold", currentVariant.titleColor)}>
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {description}
        </p>
      </div>
      
      <div className="rounded-lg border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className={cn(currentVariant.headerBg, "hover:bg-current")}>
              <TableHead className="font-semibold text-foreground">Hotel</TableHead>
              <TableHead className="font-semibold text-foreground">Room Type</TableHead>
              <TableHead className="font-semibold text-foreground">Period</TableHead>
              <TableHead className="font-semibold text-foreground text-right">Price</TableHead>
              <TableHead className="font-semibold text-foreground">Currency</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow 
                key={`${item.hotel_name}-${item.room_type}-${item.period_start}-${index}`}
                className={cn(
                  currentVariant.rowHover,
                  "transition-colors animate-in fade-in-0 slide-in-from-left-1"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TableCell className="font-medium max-w-[200px]">
                  <div className="truncate" title={item.hotel_name}>
                    {item.hotel_name}
                  </div>
                </TableCell>
                <TableCell className="max-w-[150px]">
                  <div className="truncate" title={item.room_type}>
                    {item.room_type}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground min-w-[140px]">
                  {formatPeriod(item.period_start, item.period_end)}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {formatCurrency(item.price)}
                </TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {item.currency}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
});

UniqueItemsTable.displayName = "UniqueItemsTable";

export { UniqueItemsTable };
