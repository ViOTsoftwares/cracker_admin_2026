"use client";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useSidebar } from "@/context/SidebarContext";

export default function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed, isMobileOpen, closeMobile } = useSidebar();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex text-slate-800 dark:text-slate-200 font-sans antialiased">
      {/* Sidebar Component */}
      <Sidebar />

      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Main Layout Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
