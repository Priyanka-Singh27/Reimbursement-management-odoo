"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "../../store/authStore";
import { useUiStore } from "../../store/uiStore";
import { GlobalToasts } from "../../components/ui/SharedStates";
import { RightPanelRouter } from "../../components/ui/RightPanelRouter";
import {
  LayoutDashboard,
  FileText,
  Clock,
  CheckSquare,
  Users,
  Settings,
  LogOut,
  Bell
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const NavItem = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link href={href} className={`flex items-center gap-3 px-4 py-2 text-[16px] transition-opacity hover:opacity-100 ${
      active 
        ? "text-white border-l-2 border-[#EDD9A3] opacity-100 bg-white/5" 
        : "text-[#9a9a9a] border-l-2 border-transparent opacity-80"
    }`}>
      <Icon size={16} />
      {label}
    </Link>
  );
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, company, logout } = useAuthStore();
  const { isRightPanelOpen } = useUiStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user || !company) return null;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex flex-row h-[calc(100vh-32px)] m-4 rounded-[16px] shadow-sm bg-cream text-near-black overflow-hidden relative font-sans">
      
      {/* Sidebar - 200px Fixed */}
      <aside className="w-[200px] h-full bg-near-black flex flex-col shrink-0 relative z-20">
        <div className="p-6">
          <div className="text-white font-medium text-2xl lowercase tracking-tight">reimburse.io</div>
        </div>

        <nav className="flex-1 overflow-y-auto w-full py-4 flex flex-col gap-6">
          
          <div>
            <p className="px-6 text-[12px] uppercase text-[#555] tracking-[0.08em] mb-3">General</p>
            <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            
            {user.role === "Employee" && (
              <>
                <NavItem href="/dashboard/submit" icon={FileText} label="Submit Expense" />
                <NavItem href="/dashboard/my-expenses" icon={Clock} label="My Expenses" />
              </>
            )}
            
            {(user.role === "Manager" || user.role === "Admin") && (
              <>
                <NavItem href="/dashboard/approvals" icon={CheckSquare} label="Approval Queue" />
                <NavItem href="/dashboard/team-expenses" icon={Users} label="Team Expenses" />
              </>
            )}
          </div>

          {user.role === "Admin" && (
            <div>
              <p className="px-6 text-[12px] uppercase text-[#555] tracking-[0.08em] mb-3">Tools</p>
              <NavItem href="/dashboard/users" icon={Users} label="Users" />
              <NavItem href="/dashboard/rules" icon={FileText} label="Rules Builder" />
              <NavItem href="/dashboard/settings" icon={Settings} label="Settings" />
            </div>
          )}
        </nav>

        <div className="p-4 mt-auto">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-2 py-2 text-[16px] text-[#9a9a9a] hover:text-white transition-colors w-full"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-cream min-h-0">
        
        {/* Floating Top Right Tools */}
        <div className="absolute top-6 right-6 z-50 flex items-center gap-4">
          <button className="relative text-near-black/60 hover:text-near-black transition-colors">
            <Bell size={21} />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#EDD9A3] text-near-black text-[13px] font-bold">
              3
            </span>
          </button>
          <div className="h-8 w-8 rounded-full bg-[#E2DDD6] border border-[#d6cfc4] flex items-center justify-center text-near-black font-semibold text-[18px]">
            {user.name.charAt(0)}
          </div>
        </div>

        {/* Page Content Map */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto flex flex-col min-h-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col w-full min-h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Conditional Right Panel Placeholder (The actual rendering logic will mount into a portal or be read from Zustand) */}
      <AnimatePresence>
        {isRightPanelOpen && (
          <motion.aside
            initial={{ opacity: 0, x: 320 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 320 }}
            transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }} // smooth spec timing
            className="w-[320px] bg-cream border-l border-[#E2DDD6] shrink-0 h-full overflow-y-auto z-40 relative shadow-[-10px_0_30px_rgba(0,0,0,0.02)]"
            id="right-panel-portal-target"
          >
            <RightPanelRouter />
          </motion.aside>
        )}
      </AnimatePresence>

      <GlobalToasts />
    </div>
  );
}
