"use client";

import { memo } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { ErrorStateProps } from "@/types";

const ErrorState = memo<ErrorStateProps>(({ 
  error, 
  onRetry, 
  isRetrying = false 
}) => {
  const isRetryable = error?.retryable;

  return (
    <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="space-y-4">
        <div className="font-medium">{error.message}</div>
        
        {isRetryable && onRetry && (
          <div className="flex justify-center pt-2">
            <Button
              onClick={onRetry}
              disabled={isRetrying}
              variant="outline"
              size="sm"
              className="border-destructive/20 text-destructive hover:bg-destructive/10"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </>
              )}
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
});

ErrorState.displayName = "ErrorState";

export { ErrorState };
