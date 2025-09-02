"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ComparisonMatch } from "@/lib/comparison";
import { ContractItem } from "@/lib/extract";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { FileText, Upload, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

const fileSchema = z.object({
  fileA: z
    .custom<FileList>()
    .refine((files) => files && files.length > 0, "File A is required")
    .refine(
      (files) => files && files[0]?.size <= MAX_FILE_SIZE,
      "File size must be less than 10MB"
    )
    .refine(
      (files) => files && ACCEPTED_FILE_TYPES.includes(files[0]?.type),
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
      (files) => files && ACCEPTED_FILE_TYPES.includes(files[0]?.type),
      "Only PDF and Excel files (.pdf, .xlsx, .xls) are supported"
    ),
});

type FileFormData = z.infer<typeof fileSchema>;

interface ComparisonSummary {
  count_matches: number;
  median_delta: number;
  avg_delta: number;
}

interface ComparisonResult {
  contract_a_data: ContractItem[];
  contract_b_data: ContractItem[];
  comparison: {
    matches: ComparisonMatch[];
    only_in_a: ContractItem[];
    only_in_b: ContractItem[];
    summary: ComparisonSummary;
  };
}

interface ApiError {
  error: string;
  retryable?: boolean;
  errorType?: string;
}

interface ExtendedError extends Error {
  retryable?: boolean;
  errorType?: string;
  status?: number;
}

const extractFiles = async (formData: FormData): Promise<ComparisonResult> => {
  const response = await fetch("/api/extract", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({
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

export default function Home() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<FileFormData>({
    resolver: zodResolver(fileSchema),
  });

  const mutation = useMutation({
    mutationFn: extractFiles,
    retry: (failureCount, error: ExtendedError) => {
      if (error?.retryable && failureCount < 3) {
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const fileAFiles = watch("fileA");
  const fileBFiles = watch("fileB");
  const fileA = fileAFiles?.[0];
  const fileB = fileBFiles?.[0];

  const onSubmit = async (data: FileFormData) => {
    const formData = new FormData();
    formData.append("fileA", data.fileA[0]);
    formData.append("fileB", data.fileB[0]);

    mutation.mutate(formData);
  };

  const handleRetry = () => {
    if (fileA && fileB) {
      const formData = new FormData();
      formData.append("fileA", fileA);
      formData.append("fileB", fileB);
      mutation.mutate(formData);
    }
  };

  const isRetryable =
    mutation.error && (mutation.error as ExtendedError)?.retryable;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Contract Comparison
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload two contract files to extract and compare pricing data with AI-powered analysis
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="mb-8 border-0 shadow-lg bg-card/50 backdrop-blur">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl">Upload Documents</CardTitle>
              <CardDescription className="text-base">
                Select two files (PDF or Excel) to begin the comparison
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">A</span>
                      </div>
                      <Label htmlFor="file-a" className="text-lg font-medium">
                        First Contract
                      </Label>
                    </div>
                    <div className="relative">
                      <Input
                        id="file-a"
                        type="file"
                        accept=".pdf,.xlsx,.xls"
                        {...register("fileA")}
                        className="h-12 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                      />
                      <Upload className="absolute right-3 top-3 w-6 h-6 text-muted-foreground pointer-events-none" />
                    </div>
                    {fileA && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                        <FileText className="w-4 h-4" />
                        <span className="truncate">{fileA.name}</span>
                      </div>
                    )}
                    {errors.fileA && (
                      <p className="text-sm text-destructive flex items-center space-x-1">
                        <span className="w-1 h-1 rounded-full bg-destructive"></span>
                        <span>{errors.fileA.message}</span>
                      </p>
                    )}
                  </div>

                  {/* File B */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-secondary-foreground">B</span>
                      </div>
                      <Label htmlFor="file-b" className="text-lg font-medium">
                        Second Contract
                      </Label>
                    </div>
                    <div className="relative">
                      <Input
                        id="file-b"
                        type="file"
                        accept=".pdf,.xlsx,.xls"
                        {...register("fileB")}
                        className="h-12 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                      />
                      <Upload className="absolute right-3 top-3 w-6 h-6 text-muted-foreground pointer-events-none" />
                    </div>
                    {fileB && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                        <FileText className="w-4 h-4" />
                        <span className="truncate">{fileB.name}</span>
                      </div>
                    )}
                    {errors.fileB && (
                      <p className="text-sm text-destructive flex items-center space-x-1">
                        <span className="w-1 h-1 rounded-full bg-destructive"></span>
                        <span>{errors.fileB.message}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    size="lg"
                    className="px-8 py-3 text-base font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {mutation.isPending ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>Start Analysis</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </Button>
                </div>
              </form>

              {mutation.error && (
                <Alert variant="destructive" className="mt-6">
                  <AlertDescription className="space-y-3">
                    <div>{mutation.error.message}</div>
                    {isRetryable && (
                      <div className="flex justify-center">
                        <Button
                          onClick={handleRetry}
                          disabled={mutation.isPending}
                          variant="outline"
                          size="sm"
                        >
                          {mutation.isPending ? "Retrying..." : "Retry"}
                        </Button>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          {mutation.isSuccess && mutation.data && (
            <div className="space-y-8">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="text-center border-0 shadow-lg bg-card/50 backdrop-blur">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-primary">
                      {mutation.data.comparison.matches.length}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Matches Found
                    </div>
                  </CardContent>
                </Card>
                <Card className="text-center border-0 shadow-lg bg-card/50 backdrop-blur">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-orange-500">
                      {mutation.data.comparison.only_in_a.length}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Only in Contract A
                    </div>
                  </CardContent>
                </Card>
                <Card className="text-center border-0 shadow-lg bg-card/50 backdrop-blur">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-blue-500">
                      {mutation.data.comparison.only_in_b.length}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Only in Contract B
                    </div>
                  </CardContent>
                </Card>
              </div>

              {mutation.data.comparison.matches.length > 0 && (
                <Card className="border-0 shadow-lg bg-card/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-xl">Price Comparison Matches</CardTitle>
                    <CardDescription>
                      Items found in both contracts with price differences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="font-semibold">Hotel Name</TableHead>
                            <TableHead className="font-semibold">Room Type</TableHead>
                            <TableHead className="font-semibold">Period</TableHead>
                            <TableHead className="font-semibold text-right">Contract A</TableHead>
                            <TableHead className="font-semibold text-right">Contract B</TableHead>
                            <TableHead className="font-semibold text-right">Difference</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mutation.data.comparison.matches.map(
                            (match: ComparisonMatch, index: number) => (
                              <TableRow key={index} className="hover:bg-muted/30">
                                <TableCell className="font-medium">
                                  {match.hotel_name}
                                </TableCell>
                                <TableCell>{match.room_type}</TableCell>
                                <TableCell className="text-sm">
                                  {match.period_start} to {match.period_end}
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                  €{match.price_a}
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                  €{match.price_b}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Badge
                                    variant={
                                      match.price_delta > 0
                                        ? "destructive"
                                        : match.price_delta < 0
                                        ? "secondary"
                                        : "outline"
                                    }
                                    className="font-mono"
                                  >
                                    {match.price_delta > 0 ? "+" : ""}
                                    €{match.price_delta}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {mutation.data.comparison.only_in_a.length > 0 && (
                <Card className="border-0 shadow-lg bg-card/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-xl text-orange-600">Only in Contract A</CardTitle>
                    <CardDescription>
                      {mutation.data.comparison.only_in_a.length} items found exclusively in Contract A
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-orange-50/50">
                            <TableHead className="font-semibold">Hotel Name</TableHead>
                            <TableHead className="font-semibold">Room Type</TableHead>
                            <TableHead className="font-semibold">Period</TableHead>
                            <TableHead className="font-semibold text-right">Price</TableHead>
                            <TableHead className="font-semibold">Currency</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mutation.data.comparison.only_in_a.map(
                            (item: ContractItem, index: number) => (
                              <TableRow key={index} className="hover:bg-orange-50/30">
                                <TableCell className="font-medium">
                                  {item.hotel_name}
                                </TableCell>
                                <TableCell>{item.room_type}</TableCell>
                                <TableCell className="text-sm">
                                  {item.period_start} to {item.period_end}
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                  €{item.price}
                                </TableCell>
                                <TableCell>{item.currency}</TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {mutation.data.comparison.only_in_b.length > 0 && (
                <Card className="border-0 shadow-lg bg-card/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-600">Only in Contract B</CardTitle>
                    <CardDescription>
                      {mutation.data.comparison.only_in_b.length} items found exclusively in Contract B
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-blue-50/50">
                            <TableHead className="font-semibold">Hotel Name</TableHead>
                            <TableHead className="font-semibold">Room Type</TableHead>
                            <TableHead className="font-semibold">Period</TableHead>
                            <TableHead className="font-semibold text-right">Price</TableHead>
                            <TableHead className="font-semibold">Currency</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mutation.data.comparison.only_in_b.map(
                            (item: ContractItem, index: number) => (
                              <TableRow key={index} className="hover:bg-blue-50/30">
                                <TableCell className="font-medium">
                                  {item.hotel_name}
                                </TableCell>
                                <TableCell>{item.room_type}</TableCell>
                                <TableCell className="text-sm">
                                  {item.period_start} to {item.period_end}
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                  €{item.price}
                                </TableCell>
                                <TableCell>{item.currency}</TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
