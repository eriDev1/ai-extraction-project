"use client";

import { memo } from "react";
import { FileText, Sparkles } from "lucide-react";

const PageHeader = memo(() => {
  return (
    <div className="text-center mb-16 space-y-6">
      
      <div className="space-y-4">
        <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
          Compare contracts!
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Upload two contract files to extract and compare pricing data with{" "}
          <span className="font-semibold text-primary">AI-powered analysis</span>
        </p>
      </div>
      
   
    </div>
  );
});

PageHeader.displayName = "PageHeader";

export { PageHeader };
