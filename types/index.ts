import { z } from "zod";

// File validation constants
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
] as const;

// Form validation schema
export const fileSchema = z.object({
  fileA: z
    .custom<FileList>()
    .refine((files) => files && files.length > 0, "File A is required")
    .refine(
      (files) => files && files[0]?.size <= MAX_FILE_SIZE,
      "File size must be less than 10MB"
    )
    .refine(
      (files) => files && ACCEPTED_FILE_TYPES.includes(files[0]?.type as any),
      "Only PDF and Excel files (.pdf, .xlsx, .xls) are supported"
    ),
  fileB: z
    .custom<FileList>()
    .refine((files) => files && files.length > 0, "File B is required")
    .refine(
      (files) => files && files[0]?.size <= MAX_FILE_SIZE,
      "File size must be less than 10MB"
    )
    .refine(
      (files) => files && ACCEPTED_FILE_TYPES.includes(files[0]?.type as any),
      "Only PDF and Excel files (.pdf, .xlsx, .xls) are supported"
    ),
});

export type FileFormData = z.infer<typeof fileSchema>;

// Import types from lib files
import type { ContractItem } from "@/lib/extract";
import type { ComparisonMatch, ComparisonSummary, ComparisonResult } from "@/lib/comparison";

// Re-export for convenience
export type { ContractItem, ComparisonMatch, ComparisonSummary, ComparisonResult };

// API types
export interface ComparisonApiResult {
  contract_a_data: ContractItem[];
  contract_b_data: ContractItem[];
  comparison: ComparisonResult;
}

export interface ApiError {
  error: string;
  retryable?: boolean;
  errorType?: string;
}

export interface ExtendedError extends Error {
  retryable?: boolean;
  errorType?: string;
  status?: number;
}

// Component prop types
export interface FileUploadProps {
  fileId: "fileA" | "fileB";
  label: string;
  register: any;
  error?: string;
  file?: File;
  variant?: "primary" | "secondary";
}

export interface SummaryStatsProps {
  matches: number;
  onlyInA: number;
  onlyInB: number;
  isLoading?: boolean;
}

export interface ComparisonResultsProps {
  data: ComparisonApiResult;
  isLoading?: boolean;
}

export interface MatchesTableProps {
  matches: ComparisonMatch[];
}

export interface UniqueItemsTableProps {
  items: ContractItem[];
  title: string;
  description: string;
  variant: "contractA" | "contractB";
}

export interface LoadingStateProps {
  message?: string;
}

export interface ErrorStateProps {
  error: ExtendedError;
  onRetry?: () => void;
  isRetrying?: boolean;
}
