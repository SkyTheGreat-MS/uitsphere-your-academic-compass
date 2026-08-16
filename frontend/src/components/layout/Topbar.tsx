import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Menu, CheckCheck, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { navItems } from "./Sidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  deleteNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from "@/api/notificationApi";

export function Topbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { student, logout } = useAuth();
  const initials =
    student?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "ST";

  const activeNav = navItems.find((item) =>
    item.to === "/" ? pathname === "/" : pathname.startsWith(item.to),
  );
  const pageTitle = activeNav?.label ?? "Ma-Haw-Tha-Dar";

  const { data: notifications = [], isLoading: notifLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    enabled: Boolean(student),
    refetchInterval: 30_000,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const refreshNotifications = () => {
    void queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const handleOpen = (notification: AppNotification) => {
    if (!notification.read) {
      void markNotificationRead(notification.id).then(refreshNotifications);
    }
    navigate({
      to: notification.link as
        "/" | "/studio" | "/planner" | "/timetable" | "/lost-found" | "/announcements" | "/profile",
    });
  };

  const handleMarkAllRead = () => {
    void markAllNotificationsRead().then(refreshNotifications);
  };

  const handleDelete = (id: number) => {
    void deleteNotification(id).then(refreshNotifications);
  };

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

        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base font-bold">{pageTitle}</p>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-xl"
                aria-label="Notifications"
              >
                <Bell className="size-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid min-w-[18px] place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-4 text-white ring-2 ring-card">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 rounded-xl p-2">
              <DropdownMenuLabel className="flex items-center justify-between">
                Notifications
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/10"
                  >
                    <CheckCheck className="size-3.5" /> Mark all as read
                  </button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[360px] overflow-y-auto">
                {notifLoading ? (
                  <div className="space-y-2 p-1">
                    {[0, 1, 2].map((i) => (
                      <Skeleton key={i} className="h-14 rounded-lg" />
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <p className="px-3 py-8 text-center text-xs text-muted-foreground">
                    No notifications yet.
                  </p>
                ) : (
                  notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      onSelect={(event) => {
                        event.preventDefault();
                        handleOpen(notification);
                      }}
                      className={cn(
                        "flex-col items-start gap-1 rounded-lg p-3 pr-8",
                        !notification.read && "bg-primary-soft",
                      )}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold">{notification.title}</span>
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">{notification.message}</span>
                      {!notification.read && (
                        <span className="absolute left-2 top-1/2 size-2 -translate-y-1/2 rounded-full bg-destructive" />
                      )}
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDelete(notification.id);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.stopPropagation();
                            handleDelete(notification.id);
                          }
                        }}
                        aria-label="Delete notification"
                        className="absolute right-2.5 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </span>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-xl p-1 pr-2 transition-colors hover:bg-muted">
                <Avatar className="size-9">
                  {student?.avatarUrl && (
                    <AvatarImage
                      src={`http://localhost:8080${student.avatarUrl}`}
                      alt={`${student.name ?? "Student"} profile`}
                    />
                  )}
                  <AvatarFallback className="gradient-brand text-xs font-bold text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-left lg:block">
                  <span className="block text-xs font-semibold leading-tight">
                    {student?.name || "Loading student information..."}
                  </span>
                  <span className="block truncate text-[11px] leading-tight text-muted-foreground">
                    {student?.year ? `Year ${student.year}` : "Student"} ·{" "}
                    {student?.department || "University account"}
                  </span>
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl">
              <DropdownMenuLabel>{student?.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile">Profile Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  logout();
                  navigate({ to: "/login" });
                }}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
