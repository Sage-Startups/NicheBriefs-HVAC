"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Wind, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    // Create account by signing in with demo password
    const result = await signIn("credentials", {
      email,
      password: "demo",
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Could not create account. Please try again.");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <Wind className="h-6 w-6 text-[#2563EB]" />
            <span className="text-xl font-semibold text-[#0F172A]">
              NicheBriefs <span className="text-[#2563EB]">HVAC</span>
            </span>
          </div>
          <p className="text-sm text-slate-500">HVAC SEO Brief Generator</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Create account</CardTitle>
            <CardDescription>
              Start generating HVAC SEO briefs for your clients.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@agency.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <p className="text-xs text-slate-400">
                Demo mode: any email is accepted. Your password will be{" "}
                <code className="font-mono bg-slate-100 px-1 rounded">demo</code>.
              </p>
              {error && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Create account
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-[#2563EB] hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
