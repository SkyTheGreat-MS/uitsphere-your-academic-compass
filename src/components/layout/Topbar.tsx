import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Search, Menu, Command } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { currentStudent } from "@/data/academic";
import { notifications } from "@/data/campus";
import { navItems } from "./Sidebar";
import { cn } from "@/lib/utils";

export function Topbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-30 border-b border-border glass-panel">
      <div className="flex h-16 items-center gap-3 px-4 lg:px-8">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px] p-0">
            <nav className="space-y-1 p-4 pt-14">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                    pathname === item.to
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-foreground hover:bg-muted",
                  )}
                >
                  <item.icon className="size-[18px]" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <div className="relative min-w-0 flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search notes, subjects, announcements…"
            className="h-10 rounded-xl border-border bg-card pl-9 pr-16 shadow-none"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:flex">
            <Command className="size-3" />K
          </kbd>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative rounded-xl" aria-label="Notifications">
                <Bell className="size-5" />
                <span className="absolute right-2 top-2 size-2 rounded-full bg-destructive ring-2 ring-card" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 rounded-xl p-2">
              <DropdownMenuLabel className="flex items-center justify-between">
                Notifications
                <Badge variant="secondary" className="rounded-full">
                  {notifications.length} new
                </Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((n) => (
                <DropdownMenuItem key={n.id} className="flex-col items-start gap-0.5 rounded-lg p-3">
                  <div className="flex w-full items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold">{n.title}</span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{n.when}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{n.body}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-xl p-1 pr-2 transition-colors hover:bg-muted">
                <Avatar className="size-9">
                  <AvatarFallback className="gradient-brand text-xs font-bold text-primary-foreground">
                    {currentStudent.avatarInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-left lg:block">
                  <span className="block text-xs font-semibold leading-tight">{currentStudent.name}</span>
                  <span className="block text-[11px] leading-tight text-muted-foreground">Year 3 · CSE</span>
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl">
              <DropdownMenuLabel>{currentStudent.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/onboarding">Profile setup</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/login">Sign out</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
