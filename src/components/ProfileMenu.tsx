"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { handleLogout } from "@/lib/adminFun";
import { getImageUrl } from "@/lib/imageHelper";
import { useAppSelector } from "@/store/hooks";
import { ChevronDown, LogOut, KeyRound, User } from "lucide-react";

export default function ProfileMenu() {
  const [open, setOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const username = user?.username || "Admin";

  const initials =
    username
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "A";

  // Close dropdown menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 focus:outline-hidden group cursor-pointer"
      >
        {/* Avatar */}
        <img
          src={getImageUrl(user?.profileImage)}
          alt={username}
          className="w-8 h-8 rounded-full object-cover shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200"
        />
        {/* Username */}
        <span className="hidden md:inline text-sm font-semibold text-slate-700 dark:text-slate-200">
          {username}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User Info Header */}
          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Signed in as
            </p>
            <p className="text-sm font-semibold truncate text-slate-800 dark:text-slate-100 mt-0.5">
              {username}
            </p>
          </div>

          {/* Profile link */}
          <button
            onClick={() => {
              navigate.push("/profile");
              setOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors duration-155 cursor-pointer"
          >
            <User className="w-4 h-4 text-slate-400" />
            Profile
          </button>

          {/* Change Password link */}
          <button
            onClick={() => {
              navigate.push("/change-password");
              setOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors duration-155 cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-slate-400" />
            Change Password
          </button>

          {/* Logout button */}
          <button
            onClick={() => {
              handleLogout(navigate);
              setOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-left font-medium transition-colors duration-155 border-t border-slate-100 dark:border-slate-800 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
