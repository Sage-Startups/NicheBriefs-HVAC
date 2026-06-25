"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Wind, Loader2 } from "lucide-react";
import Link from "next/link";

export default function DemoPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    async function autoSignIn() {
      const result = await signIn("credentials", {
        email: "demo@nichebriefs.com",
        password: "demo",
        redirect: false,
      });
      if (result?.error) {
        setError("Demo sign-in failed. Please use the sign-in page with email: demo@nichebriefs.com and password: demo");
      } else {
        router.push("/dashboard");
      }
    }
    autoSignIn();
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
        <div className="text-center max-w-sm">
          <Wind className="h-7 w-7 text-[#2563EB] mx-auto mb-4" />
          <p className="text-sm text-red-500 mb-2">{error}</p>
          <Link href="/sign-in" className="text-sm text-[#2563EB] hover:underline">
            Go to sign-in →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
      <div className="text-center">
        <Wind className="h-8 w-8 text-[#2563EB] mx-auto mb-4" />
        <h2 className="font-semibold text-[#0F172A] mb-2">Loading demo workspace…</h2>
        <p className="text-sm text-slate-500 mb-4">
          Signing in with demo credentials
        </p>
        <Loader2 className="h-5 w-5 animate-spin text-slate-400 mx-auto" />
      </div>
    </div>
  );
}
