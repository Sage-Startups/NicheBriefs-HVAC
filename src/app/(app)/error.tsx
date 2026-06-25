"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AppError({
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
    <div className="flex flex-col items-center justify-center flex-1 py-20 text-center px-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 mb-4">
        <AlertCircle className="h-6 w-6 text-red-500" />
      </div>
      <h2 className="text-lg font-semibold text-[#0F172A] mb-1">Something went wrong</h2>
      <p className="text-sm text-slate-500 mb-6 max-w-xs">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} variant="outline">Try again</Button>
        <Link href="/dashboard">
          <Button variant="ghost">Go to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
