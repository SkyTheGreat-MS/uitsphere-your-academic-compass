import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { CalendarDays, Download, MapPin, Clock3 } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { subjects, timetable } from "@/data/academic";
import { toast } from "sonner";

export const Route = createFileRoute("/timetable")({
  head: () => ({
    meta: [
      { title: "Weekly timetable — Ma-Haw-Tha-Dar" },
      { name: "description", content: "See your weekly university timetable with subject colours, rooms and lecture times." },
      { property: "og:title", content: "Weekly timetable — Ma-Haw-Tha-Dar" },
      { property: "og:description", content: "A calm weekly calendar of lectures, labs, seminars and tutorials." },
    ],
  }),
  component: TimetablePage,
});

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;
const hours = ["08:30", "09:40", "10:50", "11:50", "12:40", "13:50", "15:00", "16:00"];

const toMinutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
const DAY_START = toMinutes("08:30");
const DAY_END = toMinutes("16:10");
const PX_PER_MIN = 1.1;

function TimetablePage() {
  return (
    <AppShell>
      <PageHeader
        title="Timetable"
        description="Second Year (Section A) · Semester IV · 28 scheduled sessions"
        actions={
          <>
            <Button variant="outline" className="rounded-xl" onClick={() => toast("Timetable exported", { description: "An .ics file would be downloaded here." })}>
              <Download className="size-4" /> Export
            </Button>
            <Button className="rounded-xl">
              <CalendarDays className="size-4" /> Add session
            </Button>
          </>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {subjects.map((s) => (
          <span key={s.id} className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: `var(--color-${s.colorToken})` }} />
            {s.code} · {s.name}
          </span>
        ))}
      </div>

      <Card className="overflow-x-auto rounded-2xl border-border p-4 shadow-soft">
        <div className="min-w-[860px]">
          <div className="grid grid-cols-[64px_repeat(5,minmax(0,1fr))] gap-3">
            <div />
            {days.map((d) => (
              <div key={d} className="pb-3 text-center">
                <p className="text-sm font-semibold">{d}</p>
                <p className="text-[11px] text-muted-foreground">{timetable.filter((c) => c.day === d).length} sessions</p>
              </div>
            ))}
          </div>

          <div className="relative grid grid-cols-[64px_repeat(5,minmax(0,1fr))] gap-3">
            <div className="relative" style={{ height: (DAY_END - DAY_START) * PX_PER_MIN }}>
              {hours.map((h) => (
                <div
                  key={h}
                  className="absolute -translate-y-1/2 text-[11px] text-muted-foreground"
                  style={{ top: (toMinutes(h) - DAY_START) * PX_PER_MIN }}
                >
                  {h}
                </div>
              ))}
            </div>

            {days.map((d) => (
              <div
                key={d}
                className="relative rounded-xl bg-muted/40"
                style={{ height: (DAY_END - DAY_START) * PX_PER_MIN }}
              >
                {hours.map((h) => (
                  <div
                    key={h}
                    className="absolute inset-x-0 border-t border-border/70"
                    style={{ top: (toMinutes(h) - DAY_START) * PX_PER_MIN }}
                  />
                ))}
                {timetable
                  .filter((c) => c.day === d)
                  .map((c, idx) => {
                    const s = subjects.find((x) => x.id === c.subjectId)!;
                    const top = (toMinutes(c.start) - DAY_START) * PX_PER_MIN;
                    const height = (toMinutes(c.end) - toMinutes(c.start)) * PX_PER_MIN;
                    return (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.04, duration: 0.3 }}
                        className="hover-lift absolute inset-x-1.5 overflow-hidden rounded-xl border border-border bg-card p-2.5 shadow-soft"
                        style={{ top, height }}
                      >
                        <span
                          className="absolute inset-y-0 left-0 w-1.5"
                          style={{ backgroundColor: `var(--color-${s.colorToken})` }}
                        />
                        <div className="pl-2">
                          <p className="truncate text-xs font-semibold">{s.name}</p>
                          <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                            <Clock3 className="size-3 shrink-0" />
                            {c.start}–{c.end}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                            <MapPin className="size-3 shrink-0" />
                            {c.room}
                          </p>
                          <Badge variant="secondary" className="mt-1.5 rounded-full text-[10px]">
                            {c.type}
                          </Badge>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </AppShell>
  );
}
