"use client";

import { signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  user?: { name?: string | null; email?: string | null };
}

export function Header({ title, description, actions, user }: HeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#E2E8F0] bg-white px-6">
      <div>
        <h1 className="text-sm font-semibold text-[#0F172A]">{title}</h1>
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        {user && (
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-[#E2E8F0]">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB]">
              <User className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs text-slate-600 hidden sm:block">
              {user.name ?? user.email}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => signOut({ callbackUrl: "/sign-in" })}
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5 text-slate-400" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
