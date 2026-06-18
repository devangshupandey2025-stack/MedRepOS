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
} from "lucide-react";

const routes = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Upload", icon: Upload, href: "/uploads" },
  { label: "HQ", icon: Building2, href: "/analytics/hq" },
  { label: "Products", icon: Pill, href: "/analytics/products" },
  { label: "History", icon: History, href: "/upload-history" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-gray-800 bg-gray-950/95 backdrop-blur-md">
      <div className="flex items-center justify-around px-2 py-2">
        {routes.map((route) => {
          const isActive = pathname === route.href || pathname.startsWith(route.href + "/");
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors",
                isActive
                  ? "text-blue-400"
                  : "text-gray-500 hover:text-gray-300"
              )}
            >
              <route.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{route.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
