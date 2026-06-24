"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error.message);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-20 text-center px-4 bg-[#F8FAFC]">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 mb-4">
        <AlertCircle className="h-6 w-6 text-red-500" />
      </div>
      <h2 className="text-lg font-semibold text-[#0F172A] mb-1">Something went wrong</h2>
      <p className="text-sm text-slate-500 mb-6 max-w-xs">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <Button onClick={reset} variant="outline">
        Try again
      </Button>
    </div>
  );
}
