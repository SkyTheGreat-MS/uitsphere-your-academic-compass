import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  Flame,
  Clock3,
  Layers,
  ArrowUpRight,
  Sparkles,
  CalendarDays,
  ListChecks,
  PackageSearch,
  MapPin,
  FileText,
  Award,
  BookOpen,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionCard, StatCard } from "@/components/common/Primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getTimetable, type TimetableEntry } from "@/api/timetableApi";
import { getDashboard } from "@/api/dashboardApi";
import { browseLostFound } from "@/api/lostFoundApi";
import { formatMinutesUntil, getTimetableState, timeToMinutes } from "@/lib/timetable";
import { formatTime12 } from "@/lib/date";
import { activityTool, formatWhen } from "@/lib/activity";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AuthLoadingScreen } from "@/components/auth/AuthLoadingScreen";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Ma-Haw-Tha-Dar Student Companion" },
      {
        name: "description",
        content:
          "Your personalised university dashboard: today's classes, upcoming deadlines, study progress and AI learning activity.",
      },
      { property: "og:title", content: "Dashboard — Ma-Haw-Tha-Dar" },
      {
        property: "og:description",
        content: "Classes, study analytics and AI study tools in one calm workspace.",
      },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  ),
});

const quickActions = [
  {
    label: "Ask the AI Tutor",
    desc: "Get unstuck in seconds",
    icon: Sparkles,
    to: "/studio" as const,
  },
  {
    label: "View timetable",
    desc: "Plan around your classes",
    icon: CalendarDays,
    to: "/timetable" as const,
  },
  {
    label: "Plan your day",
    desc: "Organise your study tasks",
    icon: ListChecks,
    to: "/planner" as const,
  },
  {
    label: "Lost something?",
    desc: "Check campus reports",
    icon: PackageSearch,
    to: "/lost-found" as const,
  },
];

const materialStatusLabel = (status: string) => status.charAt(0) + status.slice(1).toLowerCase();

const materialStatusTone: Record<string, string> = {
  READY: "border-success/30 bg-success/10 text-success",
  PROCESSING: "border-warning/30 bg-warning/15 text-warning-foreground",
  UPLOADED: "border-warning/30 bg-warning/15 text-warning-foreground",
  FAILED: "border-destructive/30 bg-destructive/10 text-destructive",
};

function formatUploadDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function DashboardPage() {
  const { student, isLoading } = useAuth();
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [now, setNow] = useState(() => new Date());
  const {
    data: dashboard,
    isLoading: dashLoading,
    isError: dashError,
    refetch: refetchDashboard,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => getDashboard(),
    enabled: Boolean(student),
    staleTime: 60_000,
  });
  const { data: recentLost = [] } = useQuery({
    queryKey: ["lost-found", "browse", "LOST", "All", ""],
    queryFn: () => browseLostFound({ type: "LOST" }),
    enabled: Boolean(student),
    staleTime: 30_000,
  });
  useEffect(() => {
    if (!student) return;
    getTimetable()
      .then(setTimetable)
      .catch(() => setTimetable([]));
  }, [student]);
  useEffect(() => {
    const onFocus = () => {
      if (document.visibilityState === "visible" && student) void refetchDashboard();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [refetchDashboard, student]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const schedule = getTimetableState(timetable, now);
  const currentDay = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(now);
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(now);

  if (isLoading || !student) {
    return <AuthLoadingScreen message="Checking your session..." />;
  }

  const quizStats = dashboard?.quizStats;
  const flashcardStats = dashboard?.flashcardStats;
  const studyProgress = dashboard?.studyProgress;
  const classesToday = schedule.today.length;
  const classLabel = classesToday === 1 ? "class" : "classes";
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <AppShell>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-3xl gradient-brand p-6 text-primary-foreground lg:p-8"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-primary-foreground/10 blur-2xl"
          />
          <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="min-w-0">
              <Badge className="rounded-full border-0 bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/20">
                {dateLabel}
              </Badge>
              <h1 className="mt-3 text-2xl font-bold lg:text-3xl">
                {greeting}, {student.name?.split(" ")[0]} 👋
              </h1>
              <p className="mt-2 max-w-xl text-sm text-primary-foreground/80">
                {classesToday > 0
                  ? `You have ${classesToday} ${classLabel} today. ${
                      quizStats?.completed
                        ? `You have finished ${quizStats.completed} ${
                            quizStats.completed === 1 ? "quiz" : "quizzes"
                          } with an average of ${quizStats.averageScore}%.`
                        : "Ready to build your study progress in the AI Learning Studio?"
                    }`
                  : "No classes scheduled today. A relaxed day to review your materials or take a quiz."}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button asChild size="lg" variant="secondary" className="rounded-xl">
                  <Link to="/studio">
                    <Sparkles className="size-4" /> Open AI Learning Studio
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="rounded-xl text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
                >
                  <Link to="/planner">Review today's plan</Link>
                </Button>
              </div>
            </div>
            {dashLoading ? (
              <div className="grid grid-cols-3 gap-3 rounded-2xl bg-primary-foreground/10 p-4 backdrop-blur-sm lg:w-[320px]">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="h-2 w-12 animate-pulse rounded bg-primary-foreground/30" />
                    <div className="h-5 w-16 animate-pulse rounded bg-primary-foreground/30" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 rounded-2xl bg-primary-foreground/10 p-4 backdrop-blur-sm lg:w-[320px]">
                {[
                  { k: "Classes today", v: `${classesToday}` },
                  { k: "Quiz avg", v: quizStats ? `${quizStats.averageScore}%` : "—" },
                  {
                    k: "Flashcards",
                    v: flashcardStats ? `${flashcardStats.learned}/${flashcardStats.total}` : "—",
                  },
                ].map((s) => (
                  <div key={s.k}>
                    <p className="text-[11px] uppercase tracking-wide text-primary-foreground/70">
                      {s.k}
                    </p>
                    <p className="font-display text-xl font-bold">{s.v}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {dashLoading ? (
            <>
              <Skeleton className="h-[118px] rounded-2xl" />
              <Skeleton className="h-[118px] rounded-2xl" />
              <Skeleton className="h-[118px] rounded-2xl" />
              <Skeleton className="h-[118px] rounded-2xl" />
            </>
          ) : (
            <>
              <StatCard
                icon={Flame}
                label="Quizzes completed"
                value={`${quizStats?.completed ?? 0}`}
                hint="Completed AI quizzes"
                delay={0}
              />
              <StatCard
                icon={Clock3}
                label="Quiz average"
                value={`${quizStats?.averageScore ?? 0}%`}
                hint={`Across ${quizStats?.completed ?? 0} ${
                  quizStats?.completed === 1 ? "quiz" : "quizzes"
                }`}
                tone="accent"
                delay={0.05}
              />
              <StatCard
                icon={Award}
                label="Best quiz score"
                value={`${quizStats?.bestScore ?? 0}%`}
                hint={
                  quizStats?.latestResult
                    ? `Latest: ${quizStats.latestResult.quizTitle}`
                    : "No quiz attempts yet"
                }
                tone="warning"
                delay={0.1}
              />
              <StatCard
                icon={Layers}
                label="Flashcards learned"
                value={`${flashcardStats?.learned ?? 0} / ${flashcardStats?.total ?? 0}`}
                hint={`${flashcardStats?.decks ?? 0} ${
                  flashcardStats?.decks === 1 ? "deck" : "decks"
                }`}
                tone="muted"
                delay={0.15}
              />
            </>
          )}
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <SectionCard
            title={
              schedule.current
                ? "Current class"
                : schedule.isBreak
                  ? schedule.breakLabel
                  : schedule.nextUpcoming
                    ? "Next class"
                    : "Today's classes"
            }
            description={`${currentDay} · ${schedule.today.length} ${schedule.today.length === 1 ? "session" : "sessions"}`}
            action={
              <Button asChild variant="ghost" size="sm" className="rounded-lg">
                <Link to="/timetable">
                  All <ArrowUpRight className="size-3.5" />
                </Link>
              </Button>
            }
          >
            {schedule.current && (
              <div className="mb-3 rounded-xl border border-primary/30 bg-primary-soft p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  In progress · ends {formatTime12(schedule.current.endTime)}
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {schedule.current.subjectCode} · {schedule.current.subjectName}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Room {schedule.current.room} · {schedule.current.type}
                </p>
              </div>
            )}
            {!schedule.current && schedule.isBreak && (
              <div className="mb-3 rounded-xl border border-dashed border-border bg-muted/40 p-3">
                <p className="text-sm font-semibold">{schedule.breakLabel}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Next class starts at {formatTime12(schedule.nextToday?.startTime)} ·{" "}
                  {formatMinutesUntil(
                    timeToMinutes(schedule.nextToday!.startTime) -
                      (now.getHours() * 60 + now.getMinutes()),
                  )}
                  .
                </p>
              </div>
            )}
            {!schedule.current && !schedule.isBreak && schedule.nextUpcoming && (
              <div className="mb-3 rounded-xl border border-primary/30 bg-primary-soft p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Next class · {schedule.nextUpcomingDay}
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {schedule.nextUpcoming.subjectCode} · {schedule.nextUpcoming.subjectName}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Starts at {formatTime12(schedule.nextUpcoming.startTime)} · Room {schedule.nextUpcoming.room}
                  {schedule.nextUpcomingDay === currentDay
                    ? ` · ${formatMinutesUntil(timeToMinutes(schedule.nextUpcoming.startTime) - (now.getHours() * 60 + now.getMinutes()))}`
                    : ""}
                </p>
              </div>
            )}
            {schedule.hasFinishedToday && (
              <div className="mb-3 rounded-xl border border-dashed border-border bg-muted/40 p-3">
                <p className="text-sm font-semibold">No more classes today.</p>
              </div>
            )}
            <ul className="space-y-3">
              {schedule.remaining.map((c) => {
                return (
                  <li
                    key={`${c.day}-${c.startTime}-${c.subjectCode}`}
                    className="hover-lift flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                  >
                    <span
                      className="h-11 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: "var(--color-chart-1)" }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{c.subjectName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.room} · {c.type}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold">{formatTime12(c.startTime)}</p>
                      <p className="text-[11px] text-muted-foreground">{formatTime12(c.endTime)}</p>
                    </div>
                  </li>
                );
              })}
              {!schedule.remaining.length && !schedule.hasFinishedToday && !schedule.current && (
                <li className="rounded-xl border border-dashed border-border p-3 text-sm text-muted-foreground">
                  No upcoming classes today.
                </li>
              )}
            </ul>
          </SectionCard>

          <SectionCard
            title="Upcoming deadlines"
            description="Next 14 days"
            action={
              <Button asChild variant="ghost" size="sm" className="rounded-lg">
                <Link to="/planner">
                  Planner <ArrowUpRight className="size-3.5" />
                </Link>
              </Button>
            }
          >
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 px-6 py-10 text-center">
              <span className="grid size-11 place-items-center rounded-2xl bg-primary-soft text-primary">
                <CalendarDays className="size-5" />
              </span>
              <h3 className="mt-3 text-sm font-semibold">No upcoming deadlines</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Deadlines will appear here once you add them to the Study Planner.
              </p>
            </div>
          </SectionCard>

          <SectionCard title="Study progress" description="Based on your real activity">
            {dashLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full rounded-full" />
                <Skeleton className="h-2.5 w-4/5 rounded-full" />
                <Skeleton className="h-2.5 w-3/5 rounded-full" />
              </div>
            ) : dashError ? (
              <p className="text-sm text-muted-foreground">
                Could not load your study progress right now.
              </p>
            ) : studyProgress?.overall == null ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 px-6 py-10 text-center">
                <span className="grid size-11 place-items-center rounded-2xl bg-primary-soft text-primary">
                  <BookOpen className="size-5" />
                </span>
                <h3 className="mt-3 text-sm font-semibold">
                  Start studying to build your progress
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Progress appears once you complete quizzes, learn flashcards or use the AI
                  Learning Studio.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Overall progress
                    </p>
                    <p className="font-display text-lg font-bold">{studyProgress.overall}%</p>
                  </div>
                  <Progress value={studyProgress.overall} className="mt-2 h-2.5" />
                </div>
                <ul className="space-y-3">
                  {studyProgress.components.map((component) => (
                    <li key={component.label}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{component.label}</span>
                        <span className="font-semibold">{component.percent}%</span>
                      </div>
                      <Progress value={component.percent} className="mt-1.5 h-1.5" />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </SectionCard>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <SectionCard
            title="Recent materials"
            description="Latest lecture uploads"
            className="xl:col-span-2"
          >
            {dashLoading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-14 rounded-xl" />
                ))}
              </div>
            ) : dashError ? (
              <p className="text-sm text-muted-foreground">Could not load your recent materials.</p>
            ) : !dashboard?.recentMaterials.length ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 px-6 py-10 text-center">
                <span className="grid size-11 place-items-center rounded-2xl bg-primary-soft text-primary">
                  <FileText className="size-5" />
                </span>
                <h3 className="mt-3 text-sm font-semibold">No materials uploaded yet</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Upload a lecture in the AI Learning Studio to get started.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {dashboard.recentMaterials.slice(0, 5).map((material) => (
                  <li
                    key={material.id}
                    className="hover-lift flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                      <FileText className="size-[18px]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{material.fileName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {material.fileType} · Uploaded {formatUploadDate(material.uploadedAt)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`shrink-0 rounded-full text-[11px] ${
                        materialStatusTone[material.status] ?? "border-border text-muted-foreground"
                      }`}
                    >
                      {materialStatusLabel(material.status)}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Quick actions" description="Jump straight back in">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {quickActions.map((a) => (
                <Link
                  key={a.label}
                  to={a.to}
                  className="hover-lift group flex items-center gap-3 rounded-xl border border-border p-3"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary transition-transform group-hover:scale-110">
                    <a.icon className="size-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{a.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{a.desc}</p>
                  </div>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard
            title="Lost & Found"
            description="Recently reported near you"
            action={
              <Button asChild variant="ghost" size="sm" className="rounded-lg">
                <Link to="/lost-found">
                  Browse <ArrowUpRight className="size-3.5" />
                </Link>
              </Button>
            }
          >
            <ul className="space-y-3">
              {recentLost.length ? (
                recentLost.slice(0, 3).map((i) => (
                  <li
                    key={i.id}
                    className="hover-lift flex items-center gap-3 rounded-xl border border-border p-2.5"
                  >
                    <img
                      src={i.imageUrl ? `http://localhost:8080${i.imageUrl}` : undefined}
                      alt={i.title}
                      loading="lazy"
                      className="size-12 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{i.title}</p>
                      <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                        <MapPin className="size-3 shrink-0" /> {i.location}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 rounded-full text-[11px]">
                      {i.status.charAt(0) + i.status.slice(1).toLowerCase()}
                    </Badge>
                  </li>
                ))
              ) : (
                <li className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-6 text-center text-xs text-muted-foreground">
                  No lost items reported yet.
                </li>
              )}
            </ul>
          </SectionCard>

          <SectionCard title="Recent AI activity" description="From your study tools">
            {dashLoading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-14 rounded-xl" />
                ))}
              </div>
            ) : dashError ? (
              <p className="text-sm text-muted-foreground">
                Could not load your recent AI activity.
              </p>
            ) : !dashboard?.recentActivity.length ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 px-6 py-10 text-center">
                <span className="grid size-11 place-items-center rounded-2xl bg-primary-soft text-primary">
                  <Sparkles className="size-5" />
                </span>
                <h3 className="mt-3 text-sm font-semibold">No AI activity yet</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Generate summaries, notes, flashcards or quizzes and they will show up here.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {dashboard.recentActivity.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-start gap-3 rounded-xl border border-border p-3"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent/40 text-accent-foreground">
                      <Sparkles className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{a.label}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {activityTool[a.type] ?? a.type} · {formatWhen(a.at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}
