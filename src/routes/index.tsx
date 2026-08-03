import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Flame,
  Clock3,
  Target,
  Layers,
  ArrowUpRight,
  Sparkles,
  CalendarDays,
  ListChecks,
  PackageSearch,
  MapPin,
  Pin,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { SectionCard, StatCard, PriorityBadge } from "@/components/common/Primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  currentStudent,
  formatTime,
  deadlines,
  studyStats,
  subjects,
  todayClasses,
  weeklyProductivity,
  subjectMastery,
} from "@/data/academic";
import { announcements, lostItems } from "@/data/campus";
import { recentAiActivity } from "@/data/studio";

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
        content: "Classes, deadlines, study analytics and AI tools for university students in one calm workspace.",
      },
    ],
  }),
  component: DashboardPage,
});

const subjectOf = (id: string) => subjects.find((s) => s.id === id)!;

const quickActions = [
  { label: "Ask the AI Tutor", desc: "Get unstuck in seconds", icon: Sparkles, to: "/studio" as const },
  { label: "View timetable", desc: "5 classes this week", icon: CalendarDays, to: "/timetable" as const },
  { label: "Plan your day", desc: "4 tasks pending", icon: ListChecks, to: "/planner" as const },
  { label: "Lost something?", desc: "2 possible matches", icon: PackageSearch, to: "/lost-found" as const },
];

function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-3xl gradient-brand p-6 text-primary-foreground lg:p-8"
        >
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-primary-foreground/10 blur-2xl" />
          <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="min-w-0">
              <Badge className="rounded-full border-0 bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/20">
                Monday, 10 March
              </Badge>
              <h1 className="mt-3 text-2xl font-bold lg:text-3xl">
                Good morning, {currentStudent.name.split(" ")[0]} 👋
              </h1>
              <p className="mt-2 max-w-xl text-sm text-primary-foreground/80">
                You have <strong>3 classes</strong> today and <strong>2 deadlines</strong> this week. Your focus score is
                up 8% — a great day to tackle the consensus report.
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
            <div className="grid grid-cols-3 gap-3 rounded-2xl bg-primary-foreground/10 p-4 backdrop-blur-sm lg:w-[320px]">
              {[
                { k: "Streak", v: `${studyStats.streakDays}d` },
                { k: "Focus", v: `${studyStats.focusScore}%` },
                { k: "Quiz avg", v: `${studyStats.quizAverage}%` },
              ].map((s) => (
                <div key={s.k}>
                  <p className="text-[11px] uppercase tracking-wide text-primary-foreground/70">{s.k}</p>
                  <p className="font-display text-xl font-bold">{s.v}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Flame} label="Study streak" value={`${studyStats.streakDays} days`} hint="Personal best: 24 days" delay={0} />
          <StatCard icon={Clock3} label="Hours this week" value={`${studyStats.hoursThisWeek}h`} hint="+3.4h vs last week" tone="accent" delay={0.05} />
          <StatCard icon={Target} label="Quiz average" value={`${studyStats.quizAverage}%`} hint="Across 12 quizzes" tone="warning" delay={0.1} />
          <StatCard icon={Layers} label="Flashcards done" value={`${studyStats.flashcardsCompleted}`} hint="6 decks active" tone="muted" delay={0.15} />
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <SectionCard
            title="Today's classes"
            description="Monday · 3 sessions"
            action={
              <Button asChild variant="ghost" size="sm" className="rounded-lg">
                <Link to="/timetable">
                  All <ArrowUpRight className="size-3.5" />
                </Link>
              </Button>
            }
          >
            <ul className="space-y-3">
              {todayClasses.map((c) => {
                const s = subjectOf(c.subjectId);
                return (
                  <li
                    key={c.id}
                    className="hover-lift flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                  >
                    <span
                      className="h-11 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: `var(--color-${s.colorToken})` }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{s.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.room} · {c.type}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold">{formatTime(c.start)}</p>
                      <p className="text-[11px] text-muted-foreground">{formatTime(c.end)}</p>
                    </div>
                  </li>
                );
              })}
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
            <ul className="space-y-3">
              {deadlines.slice(0, 4).map((d) => (
                <li key={d.id} className="rounded-xl border border-border p-3">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{d.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {subjectOf(d.subjectId).code} · due {d.dueIn}
                      </p>
                    </div>
                    <PriorityBadge priority={d.priority} />
                  </div>
                  <Progress value={d.progress} className="mt-3 h-1.5" />
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Study progress" description="Mastery by subject">
            <div className="h-[232px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectMastery} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="subject" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--color-border)",
                      background: "var(--color-card)",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="score" fill="var(--color-primary)" radius={[8, 8, 0, 0]} animationDuration={900} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <SectionCard title="Weekly productivity" description="Hours studied and focus score" className="xl:col-span-2">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyProductivity} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                  <defs>
                    <linearGradient id="hoursFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="focusFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--color-border)",
                      background: "var(--color-card)",
                      fontSize: 12,
                    }}
                  />
                  <Area type="monotone" dataKey="focus" stroke="var(--color-chart-2)" fill="url(#focusFill)" strokeWidth={2} animationDuration={1000} />
                  <Area type="monotone" dataKey="hours" stroke="var(--color-primary)" fill="url(#hoursFill)" strokeWidth={2.5} animationDuration={1000} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
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

        <div className="grid gap-4 xl:grid-cols-3">
          <SectionCard
            title="Recent announcements"
            action={
              <Button asChild variant="ghost" size="sm" className="rounded-lg">
                <Link to="/announcements">
                  All <ArrowUpRight className="size-3.5" />
                </Link>
              </Button>
            }
          >
            <ul className="space-y-3">
              {announcements.slice(0, 3).map((a) => (
                <li key={a.id} className="rounded-xl border border-border p-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="rounded-full text-[11px]">
                      {a.category}
                    </Badge>
                    {a.pinned && <Pin className="size-3 text-primary" />}
                    <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">{a.date}</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold">{a.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{a.description}</p>
                </li>
              ))}
            </ul>
          </SectionCard>

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
              {lostItems.slice(0, 3).map((i) => (
                <li key={i.id} className="hover-lift flex items-center gap-3 rounded-xl border border-border p-2.5">
                  <img
                    src={i.image}
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
                    {i.status}
                  </Badge>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Recent AI activity" description="Last 48 hours">
            <ul className="space-y-3">
              {recentAiActivity.map((a) => (
                <li key={a.id} className="flex items-start gap-3 rounded-xl border border-border p-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent/40 text-accent-foreground">
                    <Sparkles className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{a.label}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {a.tool} · {a.when}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>

        <Card className="rounded-2xl border-dashed p-5 text-center shadow-none">
          <p className="text-sm text-muted-foreground">
            All data on this dashboard is illustrative sample data for the Ma-Haw-Tha-Dar prototype.
          </p>
        </Card>
      </div>
    </AppShell>
  );
}
