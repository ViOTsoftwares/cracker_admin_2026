"use client";

import { Menu } from "@/Router";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useSidebar } from "@/context/SidebarContext";
import { iconMap } from "./Sidebar";
import { ChevronRight } from "lucide-react";

export default function MenuItem({ menu }: { menu: Menu }) {
  const pathname = usePathname();
  const { isCollapsed } = useSidebar();

  const hasSubMenu = Boolean(menu.subMenu && menu.subMenu.length > 0);
  const isSubMenuChildActive = hasSubMenu
    ? menu.subMenu?.some((sub) => sub.path === pathname) ?? false
    : false;

  const [open, setOpen] = useState<boolean>(isSubMenuChildActive);

  // Keep submenu open if active child path changes
  useEffect(() => {
    if (isSubMenuChildActive) {
      setOpen(true);
    }
  }, [pathname, isSubMenuChildActive]);

  const isActive = menu.path === pathname;
  const Icon = menu.icon ? iconMap[menu.icon] : null;

  if (hasSubMenu && menu.subMenu) {
    return (
      <div className="w-full">
        <button
          onClick={() => setOpen(!open)}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group cursor-pointer
            ${
              open || isSubMenuChildActive
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }
          `}
        >
          <div className="flex items-center gap-3">
            {Icon && (
              <Icon
                className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                  open || isSubMenuChildActive
                    ? "text-indigo-400"
                    : "text-slate-400"
                }`}
              />
            )}
            <span
              className={`transition-all duration-300 origin-left whitespace-nowrap ${
                isCollapsed
                  ? "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                  : "opacity-100 w-auto"
              }`}
            >
              {menu.label}
            </span>
          </div>
          <ChevronRight
            className={`w-4 h-4 transition-transform duration-200 ${
              open ? "rotate-90 text-indigo-400" : "text-slate-500"
            } ${isCollapsed ? "lg:hidden" : ""}`}
          />
        </button>

        {/* Submenu links */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            open &&
            (!isCollapsed ||
              (typeof window !== "undefined" && window.innerWidth < 1024))
              ? "max-h-[400px] opacity-100 mt-1"
              : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
          <div
            className={`space-y-1 ${
              isCollapsed
                ? "lg:pl-0"
                : "pl-8 border-l border-slate-800 ml-5"
            }`}
          >
            {menu.subMenu.map((sub) => {
              const isSubActive = pathname === sub.path;
              return (
                <Link
                  key={sub.label}
                  href={sub.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 relative group
                    ${
                      isSubActive
                        ? "text-indigo-400 bg-slate-800/50"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/30"
                    }
                  `}
                >
                  {/* Circle Indicator */}
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-200 shrink-0
                      ${
                        isSubActive
                          ? "bg-indigo-400 scale-125"
                          : "bg-slate-600 group-hover:bg-slate-400"
                      }
                    `}
                  />
                  <span
                    className={`transition-all duration-300 whitespace-nowrap ${
                      isCollapsed
                        ? "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                        : "opacity-100 w-auto"
                    }`}
                  >
                    {sub.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={menu.path || "#"}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
        ${
          isActive
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-900/30"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }
      `}
    >
      {Icon && (
        <Icon
          className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
            isActive ? "text-white" : "text-slate-400"
          }`}
        />
      )}
      <span
        className={`transition-all duration-300 origin-left whitespace-nowrap ${
          isCollapsed
            ? "lg:opacity-0 lg:w-0 lg:overflow-hidden"
            : "opacity-100 w-auto"
        }`}
      >
        {menu.label}
      </span>
    </Link>
  );
}
