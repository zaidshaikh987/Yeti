import { db } from '@/api/base44Client';

import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Globe, Accessibility, LogIn, Bell, User, Menu, X, ChevronDown, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import { ROLES } from "@/lib/polarSetu";

const PUBLIC_NAV = [
  { label: "Explore", path: "/explore" },
  { label: "Research", path: "/search" },
  { label: "Learn", path: "/learn" },
  { label: "Map", path: "/map" },
  { label: "Graph", path: "/knowledge-graph" },
  { label: "News", path: "/news" },
];

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);

  const userRole = user?.role || "user";
  const roleConfig = ROLES[userRole] || ROLES.user;
  const isAdmin = ["admin", "super_admin", "repository_admin", "communication_editor", "scientific_reviewer", "teacher_coordinator", "read_only_auditor"].includes(userRole);

  const navItems = [...PUBLIC_NAV];
  if (isAdmin) navItems.push({ label: "Admin", path: "/admin" });

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#0B2942] to-[#4DA8D8]">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <div className="text-lg font-bold leading-none text-[#071A2B]" style={{ fontFamily: "'Inter', sans-serif" }}>
                Polar<span className="text-[#4DA8D8]">Setu</span>
              </div>
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">NCPOR · MoES</div>
            </div>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const active = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-secondary text-[#071A2B]" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate("/search")}
            className="hidden items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground md:flex"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
            <span className="hidden lg:inline">Search</span>
          </button>
          <button className="hidden items-center gap-1.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground md:flex" aria-label="Language selector">
            <Globe className="h-4 w-4" />
            <span className="hidden xl:inline">EN</span>
          </button>
          <button className="hidden items-center gap-1.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground md:flex" aria-label="Accessibility">
            <Accessibility className="h-4 w-4" />
          </button>

          {isAuthenticated ? (
            <>
              <button className="relative rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Notifications">
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#F4A340]"></span>
              </button>
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-md border border-border bg-white px-2 py-1.5 hover:bg-muted"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0B2942] text-xs font-semibold text-white">
                    {user?.full_name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-lg border border-border bg-white p-2 shadow-lg">
                    <div className="border-b border-border px-3 py-2">
                      <div className="text-sm font-semibold text-[#071A2B]">{user?.full_name || "User"}</div>
                      <div className="text-xs text-muted-foreground">{user?.email}</div>
                      <div className={cn("mt-1.5 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold", roleConfig.color)}>
                        <ShieldCheck className="h-3 w-3" />
                        {roleConfig.label}
                      </div>
                    </div>
                    <Link to="/admin" className="block rounded-md px-3 py-2 text-sm hover:bg-muted" onClick={() => setProfileOpen(false)}>
                      Dashboard
                    </Link>
                    <Link to="/profile" className="block rounded-md px-3 py-2 text-sm hover:bg-muted" onClick={() => setProfileOpen(false)}>
                      Profile
                    </Link>
                    <button
                      onClick={() => { setProfileOpen(false); import("@/api/base44Client").then(({ base44 }) => db.auth.logout()); }}
                      className="block w-full rounded-md px-3 py-2 text-left text-sm text-destructive hover:bg-muted"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="ml-1 flex items-center gap-1.5 rounded-md bg-[#0B2942] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#071A2B]"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Login</span>
            </Link>
          )}

          <button onClick={() => setMobileOpen(!mobileOpen)} className="rounded-md p-2 text-muted-foreground hover:bg-muted lg:hidden" aria-label="Menu">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="border-t border-border bg-white lg:hidden">
          <div className="mx-auto max-w-[1360px] px-4 py-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}