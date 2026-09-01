import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Upload, MapPin, Clock3 } from "lucide-react";
import { motion } from "motion/react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getTimetable, importTimetable, type TimetableEntry } from "@/api/timetableApi";
import { formatTime12, formatTimeRange12 } from "@/lib/date";
import { toast } from "sonner";

export const Route = createFileRoute("/timetable")({ component: TimetablePage });
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;
const hours = ["08:30", "09:40", "10:50", "11:50", "12:40", "13:50", "15:00", "16:00"];
const toMinutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
const DAY_START = toMinutes("08:30");
const DAY_END = toMinutes("16:10");
const PX_PER_MIN = 1.1;

const CSV_HEADERS = [
  "day",
  "subjectCode",
  "subjectName",
  "lecturer",
  "startTime",
  "endTime",
  "room",
  "type",
];

function parseCsv(text: string): TimetableEntry[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const splitRow = (line: string) => line.split(",").map((cell) => cell.trim());

  const rows = lines.map(splitRow);
  const headerIndex: Record<string, number> = {};
  rows[0]?.forEach((cell, cellIndex) => {
    headerIndex[cell.toLowerCase().replace(/[^a-z0-9]/g, "")] = cellIndex;
  });
  const hasHeader = CSV_HEADERS.some(
    (header) => headerIndex[header.replace(/[^a-z0-9]/g, "")] != null,
  );

  const dataRows = hasHeader ? rows.slice(1) : rows;
  const pick = (row: string[], key: string) => {
    if (hasHeader) return row[headerIndex[key.replace(/[^a-z0-9]/g, "")]] ?? "";
    const position = CSV_HEADERS.indexOf(key);
    return row[position] ?? "";
  };

  const entries: TimetableEntry[] = [];
  for (const row of dataRows) {
    if (row.length < 4) continue;
    const [day, subjectCode, startTime, endTime] = [
      pick(row, "day"),
      pick(row, "subjectCode"),
      pick(row, "startTime"),
      pick(row, "endTime"),
    ];
    if (!day || !subjectCode || !startTime || !endTime) continue;
    entries.push({
      day,
      subjectCode,
      subjectName: pick(row, "subjectName"),
      lecturer: pick(row, "lecturer"),
      startTime,
      endTime,
      room: pick(row, "room"),
      type: pick(row, "type") || "Lecture",
    });
  }
  return entries;
}

function TimetablePage() {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refresh = () =>
    getTimetable()
      .then(setTimetable)
      .catch(() => setTimetable([]));

  useEffect(() => {
    refresh();
  }, []);

  const subjects = Array.from(
    new Map(timetable.map((entry) => [entry.subjectCode, entry])).values(),
  );

  const handleImport = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Invalid file", { description: "Please choose a .csv file." });
      return;
    }
    setImporting(true);
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (rows.length === 0) {
        toast.error("No timetable rows", {
          description: "The CSV needs day, subjectCode, startTime and endTime columns.",
        });
        return;
      }
      const result = await importTimetable(rows);
      await refresh();
      toast.success("Timetable imported", {
        description:
          result.skipped > 0
            ? `${result.imported} sessions added · ${result.skipped} skipped as duplicates or invalid.`
            : `${result.imported} sessions imported.`,
      });
    } catch (error) {
      toast.error("Import failed", { description: "Please check the CSV format and try again." });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Timetable"
        description="Second Year (Section A) · Semester IV · 28 scheduled sessions"
        actions={
          <>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleImport(file);
              }}
            />
            <Button
              className="rounded-xl"
              disabled={importing}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-4" /> {importing ? "Importing..." : "Import timetable (CSV)"}
            </Button>
          </>
        }
      />
      <div className="mb-5 flex flex-wrap gap-2">
        {subjects.map((s) => (
          <span
            key={s.subjectCode}
            className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium"
          >
            <span className="size-2.5 rounded-full bg-chart-1" />
            {s.subjectCode} · {s.subjectName}
          </span>
        ))}
      </div>
      <Card className="overflow-x-auto rounded-2xl border-border p-4 shadow-soft">
        <div className="min-w-[860px]">
          <div className="grid grid-cols-[64px_repeat(5,minmax(0,1fr))] gap-3">
            <div />
            {days.map((day) => (
              <div key={day} className="pb-3 text-center">
                <p className="text-sm font-semibold">{day}</p>
                <p className="text-[11px] text-muted-foreground">
                  {timetable.filter((entry) => entry.day === day).length} sessions
                </p>
              </div>
            ))}
          </div>
          <div className="relative grid grid-cols-[64px_repeat(5,minmax(0,1fr))] gap-3">
            <div className="relative" style={{ height: (DAY_END - DAY_START) * PX_PER_MIN }}>
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="absolute -translate-y-1/2 text-[11px] text-muted-foreground whitespace-nowrap"
                  style={{ top: (toMinutes(hour) - DAY_START) * PX_PER_MIN }}
                >
                  {formatTime12(hour)}
                </div>
              ))}
            </div>
            {days.map((day) => (
              <div
                key={day}
                className="relative rounded-xl bg-muted/40"
                style={{ height: (DAY_END - DAY_START) * PX_PER_MIN }}
              >
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="absolute inset-x-0 border-t border-border/70"
                    style={{ top: (toMinutes(hour) - DAY_START) * PX_PER_MIN }}
                  />
                ))}
                {timetable
                  .filter((entry) => entry.day === day)
                  .map((entry, index) => {
                    const top = (toMinutes(entry.startTime) - DAY_START) * PX_PER_MIN;
                    const height =
                      (toMinutes(entry.endTime) - toMinutes(entry.startTime)) * PX_PER_MIN;
                    return (
                      <motion.div
                        key={`${entry.day}-${entry.startTime}-${entry.subjectCode}`}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.04, duration: 0.3 }}
                        className="hover-lift absolute inset-x-1.5 overflow-hidden rounded-xl border border-border bg-card p-2.5 shadow-soft"
                        style={{ top, height }}
                      >
                        <span className="absolute inset-y-0 left-0 w-1.5 bg-chart-1" />
                        <div className="pl-2">
                          <p className="truncate text-xs font-semibold">{entry.subjectCode}</p>
                          <p className="truncate text-[11px] text-muted-foreground">
                            {entry.subjectName}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                            <Clock3 className="size-3 shrink-0" />
                            {formatTimeRange12(entry.startTime, entry.endTime)}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                            <MapPin className="size-3 shrink-0" />
                            Room {entry.room}
                          </p>
                          <Badge variant="secondary" className="mt-1.5 rounded-full text-[10px]">
                            {entry.type}
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
