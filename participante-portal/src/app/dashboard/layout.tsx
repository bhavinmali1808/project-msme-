"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileCode2,
  Award,
  Bell,
  Trophy,
  Megaphone,
  Settings,
  LogOut,
  User
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "My Team", href: "/dashboard/team", icon: <Users size={20} /> },
    { name: "Submissions", href: "/dashboard/submissions", icon: <FileCode2 size={20} /> },
    { name: "Leaderboard", href: "/dashboard/leaderboard", icon: <Trophy size={20} /> },
    { name: "Certificates", href: "/dashboard/certificates", icon: <Award size={20} /> },
    { name: "Announcements", href: "/dashboard/announcements", icon: <Megaphone size={20} /> },
    { name: "Notifications", href: "/dashboard/notifications", icon: <Bell size={20} /> },
    { name: "Settings", href: "/dashboard/settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900" suppressHydrationWarning>
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white hidden md:flex flex-col shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-10 relative">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-heading font-bold text-xl text-white shadow-md shadow-blue-200 group-hover:shadow-lg group-hover:shadow-blue-300 transition-all group-hover:-translate-y-0.5">
              C
            </div>
            <span className="font-heading font-bold text-xl tracking-tight text-slate-800">CFG 2026</span>
          </Link>
        </div>

        <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${isActive
                    ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent"
                  }`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-100 mt-auto bg-slate-50/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm flex-shrink-0" suppressHydrationWarning>
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-800 truncate" suppressHydrationWarning>{user?.name || "Loading..."}</p>
              <p className="text-xs text-slate-500 truncate" suppressHydrationWarning>{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl w-full text-red-600 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-100 transition-all text-sm font-semibold shadow-sm hover:shadow"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px] pointer-events-none" />
        <div className="p-6 md:p-10 max-w-6xl mx-auto">
          <header className="flex justify-between items-center mb-8 relative z-10">
            <h1 className="text-2xl font-heading font-bold text-slate-900">Dashboard</h1>
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm">
                <Bell size={18} />
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md border-2 border-white" suppressHydrationWarning>
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
            </div>
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}
