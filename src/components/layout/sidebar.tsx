"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  Settings,
  PlusCircle,
  Wind,
  Menu,
  X,
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = (
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
            onClick={() => setMobileOpen(false)}
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
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex h-full w-56 shrink-0 flex-col border-r border-[#E2E8F0] bg-white">
        <SidebarLogo />
        {nav}
        <SidebarFooter />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between h-12 px-4 border-b border-[#E2E8F0] bg-white">
        <div className="flex items-center gap-2">
          <Wind className="h-4 w-4 text-[#2563EB]" />
          <span className="text-sm font-semibold text-[#0F172A]">
            NicheBriefs <span className="text-[#2563EB]">HVAC</span>
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <aside className="relative flex h-full w-64 flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between h-14 px-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <Wind className="h-5 w-5 text-[#2563EB]" />
                <span className="text-sm font-semibold text-[#0F172A]">
                  NicheBriefs <span className="text-[#2563EB]">HVAC</span>
                </span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {nav}
            <SidebarFooter />
          </aside>
        </div>
      )}
    </>
  );
}

function SidebarLogo() {
  return (
    <div className="flex h-14 items-center gap-2 border-b border-[#E2E8F0] px-4">
      <Wind className="h-5 w-5 text-[#2563EB]" />
      <span className="text-sm font-semibold text-[#0F172A] tracking-tight">
        NicheBriefs
        <span className="ml-1 text-xs font-medium text-[#2563EB]">HVAC</span>
      </span>
    </div>
  );
}

function SidebarFooter() {
  return (
    <div className="border-t border-[#E2E8F0] p-4">
      <p className="text-xs text-slate-400">HVAC SEO Brief Generator</p>
    </div>
  );
}
