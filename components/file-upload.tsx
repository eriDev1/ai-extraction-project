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
        <Input
          id={fileId}
          type="file"
          accept=".pdf,.xlsx,.xls"
          {...register(fileId)}
          className={cn(
            "h-12 transition-all duration-200",
            "file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0",
            "file:text-sm file:font-semibold file:transition-colors",
            "file:bg-primary file:text-primary-foreground hover:file:bg-primary/90",
            "focus:ring-2 focus:ring-primary/20 focus:border-primary",
            "group-hover:border-primary/50",
            error && "border-destructive focus:ring-destructive/20 focus:border-destructive"
          )}
        />
        <Upload className="absolute right-3 top-3 w-6 h-6 text-muted-foreground pointer-events-none transition-colors group-hover:text-primary/70" />
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
