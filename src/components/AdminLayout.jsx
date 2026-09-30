import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Upload, FolderOpen, ClipboardCheck, Sparkles,
  CalendarClock, BarChart3, Users, ScrollText, FileText, Network,
  Send, Quote, User as UserIcon, ChevronLeft, LogOut, Menu, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import { ROLES } from "@/lib/polarSetu";
import Header from "@/components/Header";

const ADMIN_NAV = [
  { section: "Overview", items: [
    { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  ]},
  { section: "Repository", items: [
    { label: "Upload Centre", path: "/admin/upload", icon: Upload },
    { label: "Repository", path: "/admin/repository", icon: FolderOpen },
    { label: "Metadata Editor", path: "/admin/metadata", icon: FileText },
  ]},
  { section: "Review & Publish", items: [
    { label: "Approval Queue", path: "/admin/review", icon: ClipboardCheck },
    { label: "AI Outreach Studio", path: "/admin/ai-studio", icon: Sparkles },
    { label: "Publishing", path: "/admin/publishing", icon: Send },
    { label: "Calendar", path: "/admin/calendar", icon: CalendarClock },
  ]},
  { section: "Insights", items: [
    { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
    { label: "Users & Roles", path: "/admin/users", icon: Users },
    { label: "Audit Log", path: "/admin/audit", icon: ScrollText },
  ]},
];

export default function AdminLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const userRole = user?.role || "user";
  const roleConfig = ROLES[userRole] || ROLES.user;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 top-16 z-40 w-64 shrink-0 border-r border-[#0B2942]/30 bg-[#071A2B] text-white transition-transform lg:static lg:top-0 lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-full flex-col overflow-y-auto">
            <div className="border-b border-white/10 px-4 py-3">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Admin Portal</div>
              <div className={cn("mt-1 inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-semibold", roleConfig.color)}>
                {roleConfig.label}
              </div>
            </div>
            <nav className="flex-1 px-2 py-3">
              {ADMIN_NAV.map((group) => (
                <div key={group.section} className="mb-4">
                  <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/40">{group.section}</div>
                  {group.items.map((item) => {
                    const active = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                          active ? "bg-[#4DA8D8] text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>
            <div className="border-t border-white/10 p-2">
              <Link to="/" className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white">
                <ChevronLeft className="h-4 w-4" /> Back to Public Portal
              </Link>
            </div>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && <div className="fixed inset-0 top-16 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Main */}
        <div className="flex-1 overflow-x-hidden">
          {/* Mobile toggle */}
          <div className="sticky top-16 z-20 flex items-center border-b border-border bg-white/90 px-4 py-2 backdrop-blur lg:hidden">
            <button onClick={() => setSidebarOpen(true)} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Menu className="h-4 w-4" /> Admin Menu
            </button>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}