"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, UsersRound, GraduationCap, LogOut, Building2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { name: "Overview", href: "/university", icon: <LayoutDashboard size={18} /> },
  { name: "Students", href: "/university/students", icon: <GraduationCap size={18} /> },
  { name: "Teams", href: "/university/teams", icon: <UsersRound size={18} /> },
  { name: "Mentors", href: "/university/mentors", icon: <Users size={18} /> },
];

export default function UniversityLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <style dangerouslySetInnerHTML={{__html: `
        .tab-active {
          background-color: white;
          border-top-left-radius: 1.5rem;
          border-top-right-radius: 1.5rem;
          position: relative;
          color: #0f172a; /* text-slate-900 */
          font-weight: 600;
        }
        .tab-active::before,
        .tab-active::after {
          content: "";
          position: absolute;
          bottom: 0;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          pointer-events: none;
        }
        .tab-active::before {
          left: -24px;
          box-shadow: 12px 12px 0 0 white;
        }
        .tab-active::after {
          right: -24px;
          box-shadow: -12px 12px 0 0 white;
        }
        .tab-inactive {
          color: #64748b; /* text-slate-500 */
          font-weight: 500;
        }
        .tab-inactive:hover {
          color: #334155; /* text-slate-700 */
        }
      `}} />

      {/* Top Header */}
      <header className="px-8 py-6 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-200">
            <Building2 size={20} className="text-white" />
          </div>
          <div>
            <p className="font-heading font-bold text-slate-800 text-sm leading-tight">University Portal</p>
            <p className="text-xs text-slate-500">CFG 2026</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 text-right">
            <div className="min-w-0 hidden md:block">
              <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-100 to-purple-100 border-2 border-white shadow-sm flex items-center justify-center text-violet-700 font-bold text-sm">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
          </div>
          <button
            onClick={logout}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm"
            title="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Tab Navigation & Main Content Container */}
      <main className="flex-1 flex flex-col px-4 md:px-8 pb-8 max-w-7xl w-full mx-auto">
        
        {/* Tabs */}
        <div className="flex justify-center px-6">
          <nav className="flex space-x-2 md:space-x-4 relative z-10">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-6 py-4 transition-all duration-300 text-sm ${
                    isActive ? "tab-active shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)]" : "tab-inactive hover:-translate-y-0.5"
                  }`}
                >
                  <span className={isActive ? "text-violet-600" : "text-slate-400"}>{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white rounded-3xl rounded-tl-none md:rounded-tl-3xl shadow-xl shadow-slate-200/40 p-8 md:p-10 relative z-0">
          {children}
        </div>
      </main>
    </div>
  );
}
