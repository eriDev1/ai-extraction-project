"use client";

import { useMutation } from "@tanstack/react-query";
import type { ComparisonApiResult, ExtendedError } from "@/types";

const compareContracts = async (formData: FormData): Promise<ComparisonApiResult> => {
  const response = await fetch("/api/compare", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      error: `HTTP error! status: ${response.status}`,
    }));

    const error = new Error(errorData.error) as ExtendedError;
    error.retryable = errorData.retryable;
    error.errorType = errorData.errorType;
    error.status = response.status;
    throw error;
  }

  return response.json();
};

export const useContractComparison = () => {
  return useMutation({
    mutationFn: compareContracts,
    retry: (failureCount, error: ExtendedError) => {
      if (error?.retryable && failureCount < 3) {
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => {
      return Math.min(1000 * 2 ** attemptIndex, 30000);
    },
  });
};
