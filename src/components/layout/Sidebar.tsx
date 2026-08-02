import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Sparkles,
  CalendarDays,
  ListChecks,
  PackageSearch,
  Megaphone,
  UserRound,
  GraduationCap,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { currentStudent } from "@/data/academic";

export const navItems = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "AI Learning Studio", to: "/studio", icon: Sparkles },
  { label: "Timetable", to: "/timetable", icon: CalendarDays },
  { label: "Study Planner", to: "/planner", icon: ListChecks },
  { label: "Lost & Found", to: "/lost-found", icon: PackageSearch },
  { label: "Announcements", to: "/announcements", icon: Megaphone },
  { label: "Profile", to: "/profile", icon: UserRound },
] as const;

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300 md:flex",
        collapsed ? "w-[76px]" : "w-[264px]",
      )}
    >
      <div className="flex h-16 items-center gap-3 px-4">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl gradient-brand text-primary-foreground">
          <GraduationCap className="size-5" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate font-display text-base font-bold">Ma-Haw-Tha-Dar</p>
            <p className="truncate text-[11px] text-muted-foreground">Student companion</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {!collapsed && (
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Workspace
          </p>
        )}
        {navItems.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              title={item.label}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                collapsed && "justify-center px-0",
              )}
            >
              <item.icon
                className={cn(
                  "size-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110",
                  active && "text-sidebar-primary",
                )}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        {!collapsed && (
          <div className="mb-3 rounded-xl bg-sidebar-accent/70 p-3">
            <p className="text-xs font-semibold text-sidebar-accent-foreground">Study streak</p>
            <p className="mt-1 font-display text-2xl font-bold text-sidebar-primary">18 days</p>
            <p className="text-[11px] text-muted-foreground">Keep it alive — 20 min today</p>
          </div>
        )}
        <div className={cn("flex items-center gap-2", collapsed && "flex-col")}>
          <button
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          </button>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">{currentStudent.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">{currentStudent.universityId}</p>
              </div>
              <Link
                to="/login"
                aria-label="Sign out"
                className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <LogOut className="size-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
