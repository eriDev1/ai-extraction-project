"use client";

import { memo } from "react";
import { FileText, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { FileUploadProps } from "@/types";

const FileUpload = memo<FileUploadProps>(({
  fileId,
  label,
  register,
  error,
  file,
  variant = "primary"
}) => {
  const variantStyles = {
    primary: {
      badge: "bg-primary/10 text-primary",
      letter: "A",
    },
    secondary: {
      badge: "bg-secondary/10 text-secondary-foreground",
      letter: "B",
    },
  };

  const currentVariant = variantStyles[variant];

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
          currentVariant.badge
        )}>
          <span className="text-sm font-semibold">
            {currentVariant.letter}
          </span>
        </div>
        <Label htmlFor={fileId} className="text-lg font-medium">
          {label}
        </Label>
      </div>
      
      <div className="relative group">
        <div className={cn(
          "relative border-2 border-dashed rounded-xl p-6 transition-all duration-300",
          "hover:border-primary/50 hover:bg-primary/5",
          "focus-within:border-primary focus-within:bg-primary/5",
          error && "border-destructive/50 bg-destructive/5",
          !error && "border-muted-foreground/25"
        )}>
          <Input
            id={fileId}
            type="file"
            accept=".pdf,.xlsx,.xls"
            {...register(fileId)}
            className={cn(
              "absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10",
              "file:cursor-pointer"
            )}
          />
          <div className="text-center space-y-3">
            <div className={cn(
              "mx-auto w-12 h-12 rounded-full flex items-center justify-center transition-colors",
              error ? "bg-destructive/10" : "bg-primary/10 group-hover:bg-primary/20"
            )}>
              <Upload className={cn(
                "w-6 h-6 transition-colors",
                error ? "text-destructive" : "text-primary"
              )} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, XLSX, XLS files up to 10MB
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {file && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 transition-colors hover:bg-muted/70">
          <FileText className="w-4 h-4 flex-shrink-0" />
          <span className="truncate font-medium">{file.name}</span>
          <span className="text-xs opacity-70 flex-shrink-0">
            ({(file.size / (1024 * 1024)).toFixed(1)} MB)
          </span>
        </div>
      )}
      
      {error && (
        <div className="flex items-center space-x-2 text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1 duration-200">
          <div className="w-1 h-1 rounded-full bg-destructive flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
});

FileUpload.displayName = "FileUpload";

export { FileUpload };
