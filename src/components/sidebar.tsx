"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Upload,
  BarChart3,
  Pill,
  Building2,
  History,
  Settings,
} from "lucide-react";

const routes = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Upload Data", icon: Upload, href: "/uploads" },
  { label: "HQ Analytics", icon: Building2, href: "/analytics/hq" },
  { label: "Product Analytics", icon: Pill, href: "/analytics/products" },
  { label: "Upload History", icon: History, href: "/upload-history" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex h-screen w-64 flex-col fixed left-0 top-0 border-r border-gray-800 bg-gray-950">
      <div className="p-6 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">MedRepOS</h1>
            <p className="text-xs text-gray-500">v0.1.0</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {routes.map((route) => {
          const isActive = pathname === route.href || pathname.startsWith(route.href + "/");
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-600/10 text-blue-400 border border-blue-600/20"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <p className="text-xs text-gray-600">
          MedRepOS Excel Analytics
        </p>
      </div>
    </aside>
  );
}
