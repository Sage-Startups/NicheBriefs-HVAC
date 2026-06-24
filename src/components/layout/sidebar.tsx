"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Settings,
  PlusCircle,
  Wind,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/briefs/new", label: "New Brief", icon: PlusCircle },
  { href: "/projects", label: "Projects", icon: FolderOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-56 flex-col border-r border-[#E2E8F0] bg-white">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-[#E2E8F0] px-4">
        <Wind className="h-5 w-5 text-[#2563EB]" />
        <span className="text-sm font-semibold text-[#0F172A] tracking-tight">
          NicheBriefs
          <span className="ml-1 text-xs font-medium text-[#2563EB]">HVAC</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#EFF6FF] text-[#2563EB]"
                  : "text-[#334155] hover:bg-slate-50 hover:text-[#0F172A]"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer tag */}
      <div className="border-t border-[#E2E8F0] p-4">
        <p className="text-xs text-slate-400">HVAC SEO Brief Generator</p>
      </div>
    </aside>
  );
}
