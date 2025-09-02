"use client";

import { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { FileUpload } from "@/components/file-upload";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { ComparisonResults } from "@/components/comparison-results";
import { useContractComparison } from "@/hooks/use-contract-comparison";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import type { FileFormData, ExtendedError } from "@/types";
import { fileSchema } from "@/types";

export default function Home() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FileFormData>({
    resolver: zodResolver(fileSchema),
  });

  const mutation = useContractComparison();

  const fileAFiles = watch("fileA");
  const fileBFiles = watch("fileB");
  const fileA = fileAFiles?.[0];
  const fileB = fileBFiles?.[0];

  const onSubmit = useCallback(async (data: FileFormData) => {
    const formData = new FormData();
    formData.append("fileA", data.fileA[0]);
    formData.append("fileB", data.fileB[0]);

    mutation.mutate(formData);
  }, [mutation]);

  const handleRetry = useCallback(() => {
    if (fileA && fileB) {
      const formData = new FormData();
      formData.append("fileA", fileA);
      formData.append("fileB", fileB);
      mutation.mutate(formData);
    }
  }, [fileA, fileB, mutation]);

  const isRetryable = useMemo(() => 
    mutation.error && (mutation.error as ExtendedError)?.retryable,
    [mutation.error]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <PageHeader />

        <div className="max-w-5xl mx-auto">
          <Card className="mb-8 border-0 shadow-xl bg-card/60 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-semibold">Upload Documents</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Select two files (PDF or Excel) to begin the intelligent comparison
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <FileUpload
                    fileId="fileA"
                    label="First Contract"
                    register={register}
                    error={errors.fileA?.message}
                    file={fileA}
                    variant="primary"
                  />
                  <FileUpload
                    fileId="fileB"
                    label="Second Contract"
                    register={register}
                    error={errors.fileB?.message}
                    file={fileB}
                    variant="secondary"
                  />
                </div>

                <div className="flex justify-center pt-4">
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    size="lg"
                    className="px-10 py-3 text-base font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    {mutation.isPending ? (
                      <LoadingState message="Processing..." />
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
                <div className="mt-6">
                  <ErrorState
                    error={mutation.error as ExtendedError}
                    onRetry={isRetryable ? handleRetry : undefined}
                    isRetrying={mutation.isPending}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {(mutation.isSuccess || mutation.isPending) && (
            <ComparisonResults 
              data={mutation.data!} 
              isLoading={mutation.isPending}
            />
          )}
        </div>
      </div>
    </div>
  );
}
