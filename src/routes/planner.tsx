import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Plus, Flame, Clock3, Target, Layers, CheckCircle2 } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
} from "recharts";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { SectionCard, StatCard, PriorityBadge } from "@/components/common/Primitives";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { quizTrend, studyGoals, studyStats, subjects, tasks, weeklyProductivity } from "@/data/academic";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Study planner & analytics — UitSphere" },
      { name: "description", content: "Track study goals, tasks, streaks and revision analytics across all your university modules." },
      { property: "og:title", content: "Study planner — UitSphere" },
      { property: "og:description", content: "Goals, task cards and study analytics that keep your semester on track." },
    ],
  }),
  component: PlannerPage,
});

const subjectOf = (id: string) => subjects.find((s) => s.id === id)!;

function PlannerPage() {
  const [items, setItems] = useState(tasks);
  const done = items.filter((t) => t.done).length;

  const toggle = (id: string) => {
    setItems((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (!t.done) toast.success("Task completed", { description: t.title });
        return { ...t, done: !t.done };
      }),
    );
  };

  return (
    <AppShell>
      <PageHeader
        title="Study Planner"
        description={`${done} of ${items.length} tasks complete this week`}
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button className="rounded-xl">
                <Plus className="size-4" /> New task
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add a study task</DialogTitle>
                <DialogDescription>Tasks are local to this prototype and reset on reload.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="t-title">Title</Label>
                  <Input id="t-title" placeholder="Revise consensus algorithms" className="rounded-xl" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Select defaultValue={subjects[0].id}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button className="rounded-xl" onClick={() => toast.success("Task added to your planner")}>
                  Add task
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Flame} label="Study streak" value={`${studyStats.streakDays} days`} hint="Longest: 24 days" />
        <StatCard icon={Clock3} label="Hours studied" value={`${studyStats.hoursThisWeek}h`} tone="accent" hint="Goal: 25h / week" />
        <StatCard icon={Target} label="Quiz average" value={`${studyStats.quizAverage}%`} tone="warning" hint="+11% this month" />
        <StatCard icon={Layers} label="Flashcards" value={`${studyStats.flashcardsCompleted}`} tone="muted" hint="88% retention" />
      </div>

      <Tabs defaultValue="tasks" className="mt-6">
        <TabsList className="rounded-xl">
          <TabsTrigger value="tasks" className="rounded-lg">Tasks</TabsTrigger>
          <TabsTrigger value="goals" className="rounded-lg">Goals</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-lg">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {items.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
              >
                <Card
                  className={cn(
                    "hover-lift gap-0 rounded-2xl border-border p-4 shadow-soft",
                    t.done && "opacity-60",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox checked={t.done} onCheckedChange={() => toggle(t.id)} className="mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-sm font-semibold", t.done && "line-through")}>{t.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {subjectOf(t.subjectId).code} · {t.due} · {t.estimate}
                      </p>
                    </div>
                    <PriorityBadge priority={t.priority} />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="goals" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {studyGoals.map((g) => {
              const pct = Math.round((g.completedHours / g.targetHours) * 100);
              return (
                <Card key={g.id} className="hover-lift gap-0 rounded-2xl border-border p-5 shadow-soft">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{g.title}</p>
                      <p className="text-xs text-muted-foreground">{subjectOf(g.subjectId).name}</p>
                    </div>
                    {pct >= 100 ? (
                      <CheckCircle2 className="size-5 shrink-0 text-success" />
                    ) : (
                      <span className="shrink-0 font-display text-lg font-bold text-primary">{pct}%</span>
                    )}
                  </div>
                  <Progress value={pct} className="mt-4 h-2" />
                  <p className="mt-2 text-xs text-muted-foreground">
                    {g.completedHours}h of {g.targetHours}h completed
                  </p>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard title="Quiz average trend" description="Last six weeks">
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={quizTrend} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                    <YAxis domain={[50, 100]} tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-card)", fontSize: 12 }} />
                    <Line type="monotone" dataKey="average" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4 }} animationDuration={1000} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard title="Hours studied" description="This week by day">
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyProductivity} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-card)", fontSize: 12 }} />
                    <Bar dataKey="hours" fill="var(--color-chart-2)" radius={[8, 8, 0, 0]} animationDuration={900} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
