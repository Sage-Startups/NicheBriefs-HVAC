import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wind } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] text-center px-4">
      <Wind className="h-8 w-8 text-[#2563EB] mb-4" />
      <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Page not found</h1>
      <p className="text-slate-500 mb-6">This page doesn't exist or has been moved.</p>
      <Link href="/dashboard">
        <Button>Go to Dashboard</Button>
      </Link>
    </div>
  );
}
