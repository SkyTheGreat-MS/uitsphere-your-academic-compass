import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Pin, Megaphone } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/common/Primitives";
import { announcementCategories, announcements } from "@/data/campus";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/announcements")({
  head: () => ({
    meta: [
      { title: "Campus announcements — Ma-Haw-Tha-Dar" },
      { name: "description", content: "Exam notices, coursework changes, events and campus updates in one filterable feed." },
      { property: "og:title", content: "Campus announcements — Ma-Haw-Tha-Dar" },
      { property: "og:description", content: "Stay on top of exams, deadlines and campus events." },
    ],
  }),
  component: AnnouncementsPage,
});

function AnnouncementsPage() {
  const [category, setCategory] = useState("All");
  const list = announcements.filter((a) => category === "All" || a.category === category);
  const pinned = list.filter((a) => a.pinned);
  const rest = list.filter((a) => !a.pinned);

  return (
    <AppShell>
      <PageHeader
        title="Announcements"
        description={`${announcements.length} updates · ${announcements.filter((a) => a.pinned).length} pinned`}
        actions={
          <Button variant="outline" className="rounded-xl" onClick={() => toast.success("All announcements marked as read")}>
            Mark all read
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {announcementCategories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              category === c
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="Nothing here yet"
          description="No announcements in this category right now. Check back after the next faculty update."
        />
      ) : (
        <div className="space-y-6">
          {pinned.length > 0 && (
            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pinned</h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {pinned.map((a, i) => (
                  <AnnouncementCard key={a.id} a={a} index={i} highlighted />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Latest</h2>
            <div className="grid gap-4 lg:grid-cols-2">
              {rest.map((a, i) => (
                <AnnouncementCard key={a.id} a={a} index={i} />
              ))}
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}

function AnnouncementCard({
  a,
  index,
  highlighted,
}: {
  a: (typeof announcements)[number];
  index: number;
  highlighted?: boolean;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05, duration: 0.3 }}>
      <Card
        className={cn(
          "hover-lift h-full gap-0 rounded-2xl border-border p-5 shadow-soft",
          highlighted && "border-primary/25 bg-primary-soft/40",
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full text-[11px]">
            {a.category}
          </Badge>
          {a.pinned && (
            <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
              <Pin className="size-3" /> Pinned
            </span>
          )}
          <span className="ml-auto text-[11px] text-muted-foreground">{a.date}</span>
        </div>
        <h3 className="mt-3 text-base font-semibold">{a.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.description}</p>
        <p className="mt-4 text-xs font-medium text-muted-foreground">{a.author}</p>
      </Card>
    </motion.div>
  );
}
