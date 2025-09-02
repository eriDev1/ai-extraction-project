"use client";

import { memo } from "react";
import type { LoadingStateProps } from "@/types";

const LoadingState = memo<LoadingStateProps>(({ 
  message = "Processing your files..." 
}) => {
  return (
    <div className="flex items-center justify-center space-x-3 py-8">
      <div className="relative">
        <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
        <div className="absolute inset-0 w-8 h-8 border-3 border-transparent border-t-primary/60 rounded-full animate-spin animation-delay-150" />
      </div>
      <span className="text-muted-foreground font-medium">{message}</span>
    </div>
  );
});

LoadingState.displayName = "LoadingState";

export { LoadingState };
