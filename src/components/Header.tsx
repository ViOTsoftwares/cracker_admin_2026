"use client";

import { usePathname } from "next/navigation";
import ProfileMenu from "./ProfileMenu";
import { useSidebar } from "@/context/SidebarContext";
import { Menu, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function Header() {
  const pathname = usePathname();
  const { toggleMobile, toggleCollapse } = useSidebar();

  // Dynamically resolve page title from path segments
  const getPageTitle = () => {
    if (pathname === "/") return "Dashboard";
    const segment = pathname.split("/").filter(Boolean).pop();
    if (!segment) return "Admin";
    return segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const title = getPageTitle();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        {/* Toggle Button for Mobile Drawer */}
        <button
          onClick={toggleMobile}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden focus:outline-hidden cursor-pointer"
          aria-label="Toggle mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Toggle Button for Desktop Collapse */}
        <button
          onClick={toggleCollapse}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hidden lg:block focus:outline-hidden cursor-pointer"
          aria-label="Collapse sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb Navigation */}
        <nav className="hidden sm:flex items-center space-x-1.5 text-sm font-medium select-none ml-2">
          <Link
            href="/"
            className="text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            Admin
          </Link>
          {pathname !== "/" && (
            <>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <span className="text-slate-800 dark:text-white">{title}</span>
            </>
          )}
        </nav>

        {/* Mobile Page Title */}
        <span className="sm:hidden text-base font-semibold text-slate-850 dark:text-white">
          {title}
        </span>
      </div>

      {/* Profile menu dropdown on the right */}
      <div className="flex items-center gap-4">
        <ProfileMenu />
      </div>
    </header>
  );
}
