"use client";

import { menuList } from "@/Router";
import MenuItem from "./MenuItem";
import { useAppSelector } from "@/store/hooks";
import { useMemo, useState, useEffect } from "react";
import { GetSettingApi } from "@/Api/setting";
import { useSidebar } from "@/context/SidebarContext";
import {
  LayoutDashboard,
  ShoppingBag,
  Briefcase,
  Settings,
  Mail,
  ShieldCheck,
  ClipboardList,
  Users,
} from "lucide-react";

// Map router icon string values to Lucide Icons dynamically
export const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  ShoppingBag,
  Briefcase,
  Settings,
  Mail,
  ShieldCheck,
  ClipboardList,
  Users,
};

export default function Sidebar() {
  const user = useAppSelector((state) => state.auth.user);
  const { isCollapsed, isMobileOpen } = useSidebar();
  const [siteTitle, setSiteTitle] = useState("Portfolio Admin");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await GetSettingApi();
        if (response?.success && response?.result?.title) {
          setSiteTitle(response.result.title);
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    };
    fetchSettings();
  }, []);

  const initials = useMemo(() => {
    return siteTitle
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [siteTitle]);

  const filteredMenu = useMemo(() => {
    if (!user || user.role === "superadmin") return menuList;

    const permissions = Array.isArray(user.restriction)
      ? user.restriction
      : [];
    const canView = (label: string) => {
      const match = permissions.find((p) => p?.module === label);
      return Boolean(match?.view);
    };

    return menuList
      .map((menu) => {
        if (menu.subMenu && menu.subMenu.length > 0) {
          const subMenu = menu.subMenu.filter((sub) => canView(sub.label));
          if (subMenu.length === 0) return null;
          return { ...menu, subMenu };
        }
        if (menu.path && canView(menu.label)) return menu;
        return null;
      })
      .filter(Boolean) as typeof menuList;
  }, [user]);

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-900 text-slate-100 border-r border-slate-800 transition-all duration-300 ease-in-out
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
        ${isCollapsed ? "lg:w-20" : "lg:w-64"}
      `}
    >
      {/* Sidebar Header / Logo */}
      <div
        className={`flex items-center justify-between h-16 px-6 border-b border-slate-800 shrink-0 ${
          isCollapsed ? "lg:justify-center lg:px-0" : ""
        }`}
      >
        {!isCollapsed ? (
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent tracking-wide hidden lg:block">
            {siteTitle}
          </span>
        ) : (
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent lg:block hidden">
            {initials}
          </span>
        )}
        <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent block lg:hidden">
          {siteTitle}
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
        {filteredMenu.map((menu) => (
          <MenuItem key={menu.label} menu={menu} />
        ))}
      </nav>

      {/* Sidebar Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-800 text-center text-xs text-slate-500 block">
          v1.0.0 &bull; &copy; 2026
        </div>
      )}
    </aside>
  );
}
