import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  Plus,
  CalendarDays,
  CheckCircle2,
  Clock,
  Pencil,
  Trash2,
  Sparkles,
  BookOpen,
  ListChecks,
  GraduationCap,
  MapPin,
  FileText,
  NotebookPen,
  Layers,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { SectionCard, EmptyState, PriorityBadge } from "@/components/common/Primitives";
import { DatePickerField, PickerTrigger } from "@/components/common/DatePicker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getPlanner,
  createStudyTask,
  updateStudyTask,
  toggleStudyTask,
  deleteStudyTask,
  type PlannerFlashcard,
  type PlannerQuiz,
  type PlannerResource,
  type StudyTask,
  type StudyTaskInput,
  type TaskPriority,
} from "@/api/plannerApi";
import {
  formatCountdown,
  formatShortDate,
  formatTime12,
  getUpcomingEvents,
  groupUpcomingEvents,
  getYangonParts,
  type GroupedPlannerEvents,
  type UnifiedPlannerEvent,
} from "@/lib/planner";
import { cn } from "@/lib/utils";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Study Planner — Ma-Haw-Tha-Dar" },
      {
        name: "description",
        content:
          "Your unified study workspace: live upcoming classes, study tasks, countdowns and recommended activities.",
      },
      { property: "og:title", content: "Study Planner — Ma-Haw-Tha-Dar" },
      {
        property: "og:description",
        content: "Plan what to study and when with your real timetable and live study schedule.",
      },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <PlannerPage />
    </ProtectedRoute>
  ),
});

function PlannerPage() {
  const queryClient = useQueryClient();
  // Real current time in user's environment, updated live
  const [now, setNow] = useState(() => new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<StudyTask | null>(null);
  const [form, setForm] = useState<StudyTaskInput>({
    title: "",
    description: "",
    dueDate: null,
    dueTime: null,
    priority: "medium",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Auto-refresh the clock every 10 seconds to update live countdowns and automatically remove passed events
  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 10_000);
    return () => window.clearInterval(timer);
  }, []);

  const {
    data: planner,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["planner"],
    queryFn: getPlanner,
  });

  const refresh = () => void queryClient.invalidateQueries({ queryKey: ["planner"] });

  const set = (updates: Partial<StudyTaskInput>) =>
    setForm((current) => ({ ...current, ...updates }));

  const yangon = useMemo(() => getYangonParts(now), [now]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: "",
      description: "",
      dueDate: yangon.isoDate,
      dueTime: null,
      priority: "medium",
    });
    setDialogOpen(true);
  };

  const openEdit = (task: StudyTask) => {
    setEditing(task);
    setForm({
      title: task.title,
      description: task.description ?? "",
      dueDate: task.dueDate,
      dueTime: task.dueTime,
      priority: task.priority,
    });
    setDialogOpen(true);
  };

  const submit = async () => {
    if (!form.title?.trim()) {
      toast.error("Missing title", { description: "Give your study task a title." });
      return;
    }
    setIsSaving(true);
    try {
      if (editing) {
        await updateStudyTask(editing.id, form);
        toast.success("Task updated");
      } else {
        await createStudyTask(form);
        toast.success("Task created");
      }
      setDialogOpen(false);
      refresh();
    } catch {
      toast.error(editing ? "Unable to update task" : "Unable to create task");
    } finally {
      setIsSaving(false);
    }
  };

  const toggle = async (task: StudyTask) => {
    try {
      await toggleStudyTask(task.id);
      refresh();
      if (task.status === "todo") {
        toast.success("Task completed", { description: task.title });
      }
    } catch {
      toast.error("Unable to update task");
    }
  };

  const remove = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteStudyTask(id);
      toast.success("Task deleted");
      refresh();
    } catch {
      toast.error("Unable to delete task");
    } finally {
      setDeletingId(null);
    }
  };

  // Top stats
  const stats = useMemo(() => {
    if (!planner) return null;
    const day = yangon.weekday;
    const classesToday = planner.classes.filter((c) => c.day === day);
    const openTasks = planner.tasks.filter((t) => t.status === "todo").length;
    const openQuizzes = planner.quizzes.filter((q) => !q.completed).length;
    const cardsToReview = planner.flashcards.reduce(
      (sum, f) => sum + Math.max(0, f.total - f.learned),
      0,
    );
    return { classesToday, openTasks, openQuizzes, cardsToReview, day };
  }, [planner, yangon]);

  // Unified upcoming events schedule (chronological, filtered strictly to future datetime)
  const upcomingEvents = useMemo(() => {
    if (!planner) return [];
    return getUpcomingEvents(planner.classes, planner.tasks, now);
  }, [planner, now]);

  // Non-scheduled study activities for side panel
  const studyActivities = useMemo(() => {
    if (!planner) {
      return {
        quizzes: [] as PlannerQuiz[],
        flashcards: [] as PlannerFlashcard[],
        notes: [] as PlannerResource[],
        summaries: [] as PlannerResource[],
      };
    }
    const openQuizzes = planner.quizzes.filter((q) => !q.completed).slice(0, 4);
    const flashToReview = planner.flashcards.filter((f) => f.total - f.learned > 0).slice(0, 4);
    const notes = planner.notes.slice(0, 4);
    const summaries = planner.summaries.slice(0, 4);

    return {
      quizzes: openQuizzes,
      flashcards: flashToReview,
      notes,
      summaries,
    };
  }, [planner]);

  const classesTodayCount = stats?.classesToday.length ?? 0;

  return (
    <AppShell>
      <PageHeader
        title="Study Planner"
        description="What should you study and when?"
        actions={
          <Button className="rounded-xl shadow-soft" onClick={openCreate}>
            <Plus className="size-4" /> New task
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[118px] rounded-2xl" />
            ))}
          </div>
          <div className="grid gap-4 xl:grid-cols-3">
            <Skeleton className="h-96 rounded-2xl xl:col-span-2" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </div>
      ) : isError ? (
        <EmptyState
          icon={CalendarDays}
          title="Couldn't load your planner"
          description="We couldn't reach the server. Please try again."
          action={
            <Button variant="outline" className="rounded-xl" onClick={() => void refetch()}>
              Try again
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <PlannerStat
              icon={GraduationCap}
              label={`Classes · ${stats?.day ?? yangon.weekday}`}
              value={`${classesTodayCount}`}
              hint="Today's timetable"
            />
            <PlannerStat
              icon={ListChecks}
              label="Open tasks"
              value={`${stats?.openTasks ?? 0}`}
              tone="accent"
              hint="Across all dates"
            />
            <PlannerStat
              icon={BookOpen}
              label="Quizzes to do"
              value={`${stats?.openQuizzes ?? 0}`}
              tone="warning"
              hint="Unfinished quizzes"
            />
            <PlannerStat
              icon={Layers}
              label="Flashcards to review"
              value={`${stats?.cardsToReview ?? 0}`}
              tone="muted"
              hint="Not yet learned"
            />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            {/* Left Column: Unified Upcoming Schedule & Study Tasks */}
            <div className="space-y-6 xl:col-span-2">
              <SectionCard
                title="Upcoming"
                description="Live schedule of future classes, study tasks and deadlines"
                action={
                  upcomingEvents.length > 0 ? (
                    <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-xs font-semibold">
                      {upcomingEvents.length} {upcomingEvents.length === 1 ? "upcoming item" : "upcoming items"}
                    </Badge>
                  ) : undefined
                }
              >
                <UpcomingTimeline
                  events={upcomingEvents}
                  now={now}
                  onAddTask={openCreate}
                  onToggleTask={toggle}
                  onEditTask={openEdit}
                  onDeleteTask={remove}
                  deletingId={deletingId}
                />
              </SectionCard>

              <SectionCard
                title="Study tasks"
                description="Your personal study to-dos"
                action={
                  <Button variant="ghost" size="sm" className="rounded-lg" onClick={openCreate}>
                    <Plus className="size-3.5" /> Add
                  </Button>
                }
              >
                <TaskList
                  tasks={planner?.tasks ?? []}
                  deletingId={deletingId}
                  onToggle={toggle}
                  onEdit={openEdit}
                  onDelete={remove}
                  onAdd={openCreate}
                />
              </SectionCard>
            </div>

            {/* Right Column: Recommendations & Study Activities */}
            <div className="space-y-6">
              <SectionCard title="Recommended for you" description="Based on your real activity">
                {!planner?.recommendations.length ? (
                  <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                    Complete quizzes, upload materials or add tasks to unlock recommendations.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {planner.recommendations.map((rec, i) => (
                      <motion.li
                        key={rec.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.3 }}
                        className="flex items-start gap-3 rounded-xl border border-border p-3"
                      >
                        <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                          <RecommendationIcon type={rec.type} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{rec.title}</p>
                          <p className="line-clamp-2 text-xs text-muted-foreground">{rec.detail}</p>
                        </div>
                        {rec.type !== "task" && (
                          <Button asChild variant="ghost" size="sm" className="rounded-lg">
                            <Link to="/studio">Open</Link>
                          </Button>
                        )}
                      </motion.li>
                    ))}
                  </ul>
                )}
              </SectionCard>

              <SectionCard title="Study activities" description="Quizzes, flashcards & notes">
                <ScrollArea className="max-h-[360px] pr-3">
                  <StudyActivitiesPanel activities={studyActivities} />
                </ScrollArea>
              </SectionCard>
            </div>
          </div>
        </>
      )}

      {/* Create / Edit Task Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit study task" : "Add a study task"}</DialogTitle>
            <DialogDescription>
              Tasks are saved to your account and persist across sessions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="t-title">Title</Label>
              <Input
                id="t-title"
                placeholder="Review Network Layer"
                value={form.title ?? ""}
                onChange={(e) => set({ title: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-desc">Description</Label>
              <Textarea
                id="t-desc"
                rows={2}
                placeholder="Optional notes"
                value={form.description ?? ""}
                onChange={(e) => set({ description: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Schedule
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="t-date">Date</Label>
                  <DatePickerField
                    id="t-date"
                    value={form.dueDate}
                    onChange={(date) => set({ dueDate: date })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="t-time">Time</Label>
                  <TimePickerField
                    id="t-time"
                    value={form.dueTime}
                    onChange={(time) => set({ dueTime: time })}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(priority) => set({ priority: priority as TaskPriority })}
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="rounded-xl" onClick={() => void submit()} disabled={isSaving}>
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
              {editing ? "Save changes" : "Add task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function PlannerStat({
  icon: Icon,
  label,
  value,
  hint,
  tone = "primary",
}: {
  icon: typeof GraduationCap;
  label: string;
  value: string;
  hint?: string;
  tone?: "primary" | "accent" | "warning" | "muted";
}) {
  const tones: Record<string, string> = {
    primary: "bg-primary-soft text-primary",
    accent: "bg-accent/40 text-accent-foreground",
    warning: "bg-warning/20 text-warning-foreground",
    muted: "bg-muted text-muted-foreground",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <Card className="hover-lift gap-0 rounded-2xl border-border p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", tones[tone])}>
            <Icon className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            <p className="font-display text-2xl font-bold leading-tight">{value}</p>
          </div>
        </div>
        {hint && <p className="mt-3 text-xs text-muted-foreground">{hint}</p>}
      </Card>
    </motion.div>
  );
}

/**
 * Unified upcoming chronological timeline component.
 */
function UpcomingTimeline({
  events,
  now,
  onAddTask,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  deletingId,
}: {
  events: UnifiedPlannerEvent[];
  now: Date;
  onAddTask: () => void;
  onToggleTask: (task: StudyTask) => void;
  onEditTask: (task: StudyTask) => void;
  onDeleteTask: (id: number) => void;
  deletingId: number | null;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const nowMs = now.getTime();

  if (!events.length) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="You're all caught up"
        description="No upcoming classes or tasks scheduled."
        action={
          <Button className="rounded-xl" onClick={onAddTask}>
            <Plus className="size-4" /> New task
          </Button>
        }
      />
    );
  }

  const totalCount = events.length;
  const visibleEvents = isExpanded ? events : events.slice(0, 5);
  const groupedEvents = groupUpcomingEvents(visibleEvents, now);

  return (
    <div className="space-y-6">
      {groupedEvents.map((group) => (
        <div key={group.dateKey} className="space-y-3">
          {/* Day Group Header */}
          <div className="flex items-center gap-2">
            <Badge
              variant={group.isToday ? "default" : "secondary"}
              className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
            >
              {group.label}
            </Badge>
            <span className="text-xs font-medium text-muted-foreground">{group.formattedDate}</span>
            <span className="h-px flex-1 bg-border/60" aria-hidden />
          </div>

          {/* Chronological events list */}
          <ul className="relative space-y-3 pl-6">
            <span className="absolute inset-y-2 left-2 w-px bg-border" aria-hidden />
            {group.events.map((item, i) => (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                className="relative"
              >
                <span
                  className={cn(
                    "absolute -left-6 top-4 size-4 rounded-full border-4 border-card shadow-xs",
                    item.type === "class" ? "bg-chart-1" : "bg-primary",
                  )}
                  aria-hidden
                />
                <Card className="hover-lift gap-0 rounded-2xl border-border p-4 shadow-soft">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      {item.type === "task" && item.originalTask && (
                        <Checkbox
                          checked={item.originalTask.status === "completed"}
                          onCheckedChange={() => onToggleTask(item.originalTask!)}
                          className="mt-1"
                          aria-label="Mark task as completed"
                        />
                      )}
                      <div className="shrink-0 pt-0.5 text-sm font-semibold tabular-nums text-foreground">
                        {item.displayTime}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
                        <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                          {item.type === "class" ? (
                            <>
                              <MapPin className="size-3 shrink-0 text-muted-foreground" />
                              <span>Room {item.room}</span>
                              <span>·</span>
                              <span>{item.classType}</span>
                              {item.endTime && <span>· ends {item.endTime}</span>}
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="size-3 shrink-0 text-primary" />
                              <span>{item.subtitle || "Study task"}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border/40 pt-2 sm:border-0 sm:pt-0">
                      {/* Live countdown badge */}
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 rounded-full border-primary/25 bg-primary-soft/80 px-2.5 py-0.5 text-[11px] font-medium text-primary"
                      >
                        <Clock className="size-3" />
                        <span>{formatCountdown(item.targetDateTimeMs, nowMs)}</span>
                      </Badge>

                      {/* Type badge */}
                      {item.type === "class" ? (
                        <Badge
                          variant="secondary"
                          className="shrink-0 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                        >
                          Class
                        </Badge>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Badge
                            variant="outline"
                            className="shrink-0 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                          >
                            Task
                          </Badge>
                          {item.originalTask && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 rounded-lg"
                                onClick={() => onEditTask(item.originalTask!)}
                                aria-label="Edit task"
                              >
                                <Pencil className="size-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 rounded-lg text-destructive hover:text-destructive"
                                onClick={() => onDeleteTask(item.originalTask!.id)}
                                disabled={deletingId === item.originalTask!.id}
                                aria-label="Delete task"
                              >
                                {deletingId === item.originalTask!.id ? (
                                  <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="size-3.5" />
                                )}
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.li>
            ))}
          </ul>
        </div>
      ))}

      {totalCount > 5 && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-border bg-card text-xs font-semibold shadow-xs hover:bg-muted"
            onClick={() => setIsExpanded((prev) => !prev)}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="size-3.5" /> Show less
              </>
            ) : (
              <>
                <ChevronDown className="size-3.5" /> Show more ({totalCount - 5} more)
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

function TaskList({
  tasks,
  deletingId,
  onToggle,
  onEdit,
  onDelete,
  onAdd,
}: {
  tasks: StudyTask[];
  deletingId: number | null;
  onToggle: (task: StudyTask) => void;
  onEdit: (task: StudyTask) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
}) {
  const sorted = [...tasks].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 } as const;
    if (a.status !== b.status) return a.status === "todo" ? -1 : 1;
    return order[a.priority] - order[b.priority];
  });

  if (!sorted.length) {
    return (
      <EmptyState
        icon={ListChecks}
        title="No tasks yet"
        description="Create a study task to start planning your study session."
        action={
          <Button variant="outline" className="rounded-xl" onClick={onAdd}>
            <Plus className="size-4" /> Add task
          </Button>
        }
      />
    );
  }

  return (
    <ul className="space-y-3">
      {sorted.map((task) => {
        const done = task.status === "completed";
        return (
          <motion.li
            key={task.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("rounded-xl border border-border bg-card p-3", done && "opacity-60")}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                checked={done}
                onCheckedChange={() => onToggle(task)}
                className="mt-0.5"
                aria-label={done ? "Mark as not done" : "Mark as done"}
              />
              <div className="min-w-0 flex-1">
                <p className={cn("truncate text-sm font-semibold", done && "line-through")}>
                  {task.title}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {task.dueDate ? formatShortDate(task.dueDate) : "No date"}
                  {task.dueTime ? ` · ${formatTime12(task.dueTime)}` : ""}
                  {task.description ? ` · ${task.description}` : ""}
                </p>
              </div>
              <PriorityBadge priority={task.priority} />
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-lg"
                  onClick={() => onEdit(task)}
                  aria-label="Edit task"
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-lg text-destructive hover:text-destructive"
                  onClick={() => onDelete(task.id)}
                  disabled={deletingId === task.id}
                  aria-label="Delete task"
                >
                  {deletingId === task.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                </Button>
              </div>
            </div>
          </motion.li>
        );
      })}
    </ul>
  );
}

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = [0, 15, 30, 45];

function parseTimeValue(value: string) {
  const [h, m] = value.split(":").map(Number);
  return {
    hour: h % 12 === 0 ? 12 : h % 12,
    minute: m,
    period: (h >= 12 ? "PM" : "AM") as "AM" | "PM",
  };
}

function defaultDraft() {
  return { hour: 12, minute: 0, period: "AM" as const };
}

function TimePickerField({
  id,
  value,
  onChange,
}: {
  id?: string;
  value: string | null | undefined;
  onChange: (value: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => (value ? parseTimeValue(value) : defaultDraft()));

  const lastValue = useRef(value);
  useEffect(() => {
    if (value !== lastValue.current) {
      lastValue.current = value;
      setDraft(value ? parseTimeValue(value) : defaultDraft());
    }
  }, [value]);

  const commit = (next: typeof draft) => {
    setDraft(next);
    const hours24 = next.period === "AM" ? next.hour % 12 : (next.hour % 12) + 12;
    onChange(`${String(hours24).padStart(2, "0")}:${String(next.minute).padStart(2, "0")}`);
  };

  const previewHours24 = draft.period === "AM" ? draft.hour % 12 : (draft.hour % 12) + 12;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <PickerTrigger
          id={id}
          aria-label={value ? `Due time, ${formatTime12(value)}` : "No due time"}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClear={value ? () => onChange(null) : undefined}
        >
          <Clock className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          {value ? (
            <span className="truncate">{formatTime12(value)}</span>
          ) : (
            <span className="truncate text-muted-foreground">No time selected</span>
          )}
        </PickerTrigger>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-[264px] rounded-xl border-border bg-popover p-3 shadow-md"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Time
            </p>
            <p className="text-sm font-semibold tabular-nums">
              {formatTime12(
                `${String(previewHours24).padStart(2, "0")}:${String(draft.minute).padStart(2, "0")}`,
              )}
            </p>
          </div>

          <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-muted-foreground">Hour</p>
            <div className="grid grid-cols-4 gap-1.5">
              {HOURS.map((hour) => (
                <button
                  key={hour}
                  type="button"
                  onClick={() => commit({ ...draft, hour })}
                  aria-label={`Set hour to ${hour}`}
                  className={cn(
                    "h-9 cursor-pointer rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    draft.hour === hour
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {hour}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-muted-foreground">Minute</p>
            <div className="grid grid-cols-4 gap-1.5">
              {MINUTES.map((minute) => (
                <button
                  key={minute}
                  type="button"
                  onClick={() => commit({ ...draft, minute })}
                  aria-label={`Set minute to ${minute}`}
                  className={cn(
                    "h-9 cursor-pointer rounded-lg text-sm font-medium tabular-nums transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    draft.minute === minute
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {String(minute).padStart(2, "0")}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-muted-foreground">Period</p>
            <div className="grid grid-cols-2 gap-1.5">
              {(["AM", "PM"] as const).map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => commit({ ...draft, period })}
                  aria-pressed={draft.period === period}
                  className={cn(
                    "h-9 cursor-pointer rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    draft.period === period
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function RecommendationIcon({ type }: { type: string }) {
  switch (type) {
    case "quiz":
      return <BookOpen className="size-4" />;
    case "flashcards":
      return <Layers className="size-4" />;
    case "class":
      return <GraduationCap className="size-4" />;
    case "process":
    case "material":
      return <FileText className="size-4" />;
    default:
      return <Sparkles className="size-4" />;
  }
}

function StudyActivitiesPanel({
  activities,
}: {
  activities: {
    quizzes: PlannerQuiz[];
    flashcards: PlannerFlashcard[];
    notes: PlannerResource[];
    summaries: PlannerResource[];
  };
}) {
  const hasAnything =
    activities.quizzes.length ||
    activities.flashcards.length ||
    activities.notes.length ||
    activities.summaries.length;

  if (!hasAnything) {
    return (
      <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
        No active quizzes, flashcards or study materials yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {activities.quizzes.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Quizzes to complete
          </p>
          <ul className="space-y-2">
            {activities.quizzes.map((q) => (
              <li
                key={`quiz-${q.id}`}
                className="flex items-center gap-3 rounded-xl border border-border p-2.5"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-warning/20 text-warning-foreground">
                  <NotebookPen className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{q.title}</p>
                  <p className="text-[11px] text-muted-foreground">Not completed yet</p>
                </div>
                <Button asChild variant="ghost" size="sm" className="rounded-lg">
                  <Link to="/studio">Open</Link>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {activities.flashcards.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Flashcards to review
          </p>
          <ul className="space-y-2">
            {activities.flashcards.map((f) => (
              <li
                key={`flash-${f.id}`}
                className="flex items-center gap-3 rounded-xl border border-border p-2.5"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                  <Layers className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{f.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {f.total - f.learned} of {f.total} to learn
                  </p>
                </div>
                <Button asChild variant="ghost" size="sm" className="rounded-lg">
                  <Link to="/studio">Open</Link>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(activities.notes.length > 0 || activities.summaries.length > 0) && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Review from Studio
          </p>
          <ul className="space-y-2">
            {activities.summaries.map((s) => (
              <li
                key={`sum-${s.id}`}
                className="flex items-center gap-3 rounded-xl border border-border p-2.5"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent/40 text-accent-foreground">
                  <FileText className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{s.title}</p>
                  <p className="text-[11px] text-muted-foreground">Summary</p>
                </div>
                <Button asChild variant="ghost" size="sm" className="rounded-lg">
                  <Link to="/studio">Open</Link>
                </Button>
              </li>
            ))}
            {activities.notes.map((n) => (
              <li
                key={`note-${n.id}`}
                className="flex items-center gap-3 rounded-xl border border-border p-2.5"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent/40 text-accent-foreground">
                  <NotebookPen className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{n.title}</p>
                  <p className="text-[11px] text-muted-foreground">Smart notes</p>
                </div>
                <Button asChild variant="ghost" size="sm" className="rounded-lg">
                  <Link to="/studio">Open</Link>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
