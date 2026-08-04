import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  Flame,
  Trophy,
  Target,
  NotebookPen,
  Sunrise,
  Heart,
  Bell,
  Moon,
  ShieldCheck,
  Download,
  Clock3,
  Layers,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarAngleAxis,
  PolarGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { SectionCard, StatCard } from "@/components/common/Primitives";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { studyStats, subjectMastery } from "@/data/academic";
import { achievements, profileActivity } from "@/data/campus";
import { useAuth, type Student } from "@/context/AuthContext";
import { updateStudent as saveStudent } from "@/api/studentApi";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Student profile — Ma-Haw-Tha-Dar" },
      {
        name: "description",
        content:
          "Manage your student details, view achievements, study statistics and recent learning activity.",
      },
      { property: "og:title", content: "Student profile — Ma-Haw-Tha-Dar" },
      {
        property: "og:description",
        content: "Achievements, study stats and settings for your Ma-Haw-Tha-Dar account.",
      },
    ],
  }),
  component: ProfilePage,
});

const iconMap = {
  flame: Flame,
  trophy: Trophy,
  target: Target,
  notebook: NotebookPen,
  sunrise: Sunrise,
  heart: Heart,
};

function ProfilePage() {
  const { student, isLoading, updateStudent } = useAuth();
  const [form, setForm] = useState<Student>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (student) setForm(student);
  }, [student]);

  if (isLoading || !student) {
    return (
      <AppShell>
        <div className="flex min-h-[240px] items-center justify-center text-sm text-muted-foreground">
          Loading student information...
        </div>
      </AppShell>
    );
  }
  const initials =
    student.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "ST";
  const set = (updates: Partial<typeof form>) => setForm((current) => ({ ...current, ...updates }));
  return (
    <AppShell>
      <PageHeader title="Profile Settings" description="Manage your Ma-Haw-Tha-Dar student account" />

      <Card className="relative gap-0 overflow-hidden rounded-3xl border-border p-0 shadow-soft">
        <div className="h-28 gradient-brand" />
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 px-6 pb-6 sm:flex sm:flex-wrap sm:justify-between">
          <div className="flex min-w-0 items-end gap-4">
            <Avatar className="-mt-10 size-20 shrink-0 ring-4 ring-card">
              <AvatarFallback className="gradient-brand text-xl font-bold text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 pb-1">
              <h2 className="truncate text-xl font-bold">{student.name}</h2>
              <p className="truncate text-sm text-muted-foreground">
                {student.department} · {student.year ? `Year ${student.year}` : student.batch}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="secondary" className="rounded-full text-[11px]">
                  {student.universityId}
                </Badge>
                <Badge variant="outline" className="rounded-full text-[11px]">
                  {student.batch || "Student"}
                </Badge>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            className="shrink-0 rounded-xl"
            onClick={() =>
              toast("Export requested", { description: "Your study data would be downloaded." })
            }
          >
            <Download className="size-4" /> Export data
          </Button>
        </div>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Flame}
          label="Learning streak"
          value={`${studyStats.streakDays} days`}
          hint="Longest run: 24 days"
        />
        <StatCard
          icon={Clock3}
          label="Total hours"
          value="248h"
          tone="accent"
          hint="Since September"
        />
        <StatCard
          icon={Target}
          label="Quiz average"
          value={`${studyStats.quizAverage}%`}
          tone="warning"
          hint="Top 12% of your cohort"
        />
        <StatCard
          icon={Layers}
          label="Materials processed"
          value={`${studyStats.materialsProcessed}`}
          tone="muted"
          hint="Across 7 Semester IV subjects"
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <SectionCard
          title="Editable information"
          description="Your authenticated student information"
          className="xl:col-span-2"
        >
          <form
            className="grid gap-5 sm:grid-cols-2"
            onSubmit={async (e) => {
              e.preventDefault();
              setIsSaving(true);
              try {
                const saved = await saveStudent({ name: form.name, department: form.department, year: form.year, batch: form.batch, bio: form.bio });
                await updateStudent(saved);
                setForm(saved);
                toast.success("Profile updated");
              } catch { toast.error("Unable to update profile"); }
              finally { setIsSaving(false); }
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="p-name">Full name</Label>
              <Input id="p-name" value={form.name ?? ""} onChange={(e) => set({ name: e.target.value })} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-email">University email</Label>
              <Input id="p-email" value={student.email ?? ""} readOnly className="h-11 rounded-xl bg-muted/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-id">University ID</Label>
              <Input
                id="p-id"
                value={student.universityId ?? ""}
                readOnly
                className="h-11 rounded-xl bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-dept">Department</Label>
              <Select value={form.department ?? ""} onValueChange={(department) => set({ department })}><SelectTrigger id="p-dept" className="h-11 rounded-xl"><SelectValue placeholder="Select department" /></SelectTrigger><SelectContent>{["Software Engineering", "Knowledge Engineering", "High Performance Computing", "Cybersecurity", "Electrical Engineering", "Business Information Systems"].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="space-y-2"><Label>Academic year</Label><Select value={form.year ? String(form.year) : ""} onValueChange={(year) => set({ year: Number(year) })}><SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select year" /></SelectTrigger><SelectContent>{[1, 2, 3, 4].map((year) => <SelectItem key={year} value={String(year)}>Year {year}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Batch</Label><Select value={form.batch ?? ""} onValueChange={(batch) => set({ batch })}><SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select batch" /></SelectTrigger><SelectContent>{["9", "10", "11", "12", "13"].map((batch) => <SelectItem key={batch} value={batch}>Batch {batch}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="p-bio">Bio</Label>
              <Textarea
                id="p-bio"
                rows={3}
                value={form.bio ?? ""}
                onChange={(e) => set({ bio: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" className="rounded-xl">
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </SectionCard>

        <SectionCard title="Subject mastery" description="AI-estimated confidence">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={subjectMastery} outerRadius="72%">
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-card)",
                    fontSize: 12,
                  }}
                />
                <Radar
                  dataKey="score"
                  stroke="var(--color-primary)"
                  fill="var(--color-primary)"
                  fillOpacity={0.25}
                  animationDuration={900}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <SectionCard title="Achievements" description="6 of 18 unlocked" className="xl:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.map((a, i) => {
              const Icon = iconMap[a.icon as keyof typeof iconMap];
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="hover-lift rounded-xl border border-border p-4 text-center"
                >
                  <span className="mx-auto grid size-11 place-items-center rounded-xl bg-primary-soft text-primary">
                    <Icon className="size-5" />
                  </span>
                  <p className="mt-3 text-sm font-semibold">{a.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{a.description}</p>
                </motion.div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Recent activity">
          <ul className="space-y-3">
            {profileActivity.map((p) => (
              <li key={p.id} className="rounded-xl border border-border p-3">
                <p className="text-sm font-medium">{p.label}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {p.when} · {p.detail}
                </p>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {[
          {
            icon: Bell,
            title: "Notifications",
            desc: "Deadline reminders and match alerts",
            on: true,
          },
          {
            icon: Moon,
            title: "Focus mode",
            desc: "Mute non-urgent alerts while studying",
            on: false,
          },
          {
            icon: ShieldCheck,
            title: "Public profile",
            desc: "Let classmates find you on campus",
            on: true,
          },
        ].map((s) => (
          <Card
            key={s.title}
            className="hover-lift gap-0 rounded-2xl border-border p-5 shadow-soft"
          >
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
                <s.icon className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{s.title}</p>
                <p className="truncate text-xs text-muted-foreground">{s.desc}</p>
              </div>
              <Switch
                defaultChecked={s.on}
                onCheckedChange={(v) => toast(`${s.title} ${v ? "enabled" : "disabled"}`)}
              />
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
