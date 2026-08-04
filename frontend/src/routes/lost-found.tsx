import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { toast } from "sonner";
import { MapPin, CalendarDays, Plus, Sparkles, Search } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/common/Primitives";
import {
  foundItems,
  lostFoundCategories,
  lostItems,
  matchSuggestions,
  type LostFoundItem,
} from "@/data/campus";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/lost-found")({
  head: () => ({
    meta: [
      { title: "Campus Lost & Found — Ma-Haw-Tha-Dar" },
      { name: "description", content: "Report and browse lost or found items across campus, with smart matching suggestions." },
      { property: "og:title", content: "Campus Lost & Found — Ma-Haw-Tha-Dar" },
      { property: "og:description", content: "A modern lost and found board for university students." },
    ],
  }),
  component: LostFoundPage,
});

function ItemCard({ item, index }: { item: LostFoundItem; index: number }) {
  const statusTone =
    item.status === "Lost"
      ? "bg-destructive/10 text-destructive"
      : item.status === "Found"
        ? "bg-primary-soft text-primary"
        : "bg-success/15 text-success";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card className="hover-lift group gap-0 overflow-hidden rounded-2xl border-border p-0 shadow-soft">
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <img
            src={item.image}
            alt={item.title}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className={cn("absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur", statusTone)}>
            {item.status}
          </span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
            <h3 className="truncate text-sm font-semibold">{item.title}</h3>
            <Badge variant="secondary" className="shrink-0 rounded-full text-[10px]">
              {item.category}
            </Badge>
          </div>
          <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
          <div className="mt-3 space-y-1 text-xs text-muted-foreground">
            <p className="flex items-center gap-1.5 truncate">
              <MapPin className="size-3.5 shrink-0" /> {item.location}
            </p>
            <p className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5 shrink-0" /> {item.date} · {item.reporter}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 w-full rounded-xl"
            onClick={() => toast.success("Request sent", { description: `The reporter of “${item.title}” has been notified.` })}
          >
            {item.status === "Lost" ? "I found this" : "This is mine"}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

function LostFoundPage() {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  const filter = (list: LostFoundItem[]) =>
    list.filter(
      (i) =>
        (category === "All" || i.category === category) &&
        (i.title + i.description).toLowerCase().includes(query.toLowerCase()),
    );

  return (
    <AppShell>
      <PageHeader
        title="Lost & Found"
        description={`${lostItems.length} lost · ${foundItems.length} found · ${matchSuggestions.length} possible matches`}
      />

      <Card className="mb-5 gap-0 rounded-2xl border-primary/20 bg-primary-soft/50 p-5 shadow-soft">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <h2 className="text-sm font-semibold">Matching suggestions</h2>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {matchSuggestions.map((m) => (
            <div key={m.id} className="rounded-xl border border-border bg-card p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                <p className="truncate text-sm font-semibold">{m.lostTitle}</p>
                <Badge className="shrink-0 rounded-full">{m.confidence}% match</Badge>
              </div>
              <p className="mt-1 truncate text-xs text-muted-foreground">matched with “{m.foundTitle}”</p>
              <p className="mt-2 text-xs text-muted-foreground">{m.reason}</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" className="rounded-lg" onClick={() => toast.success("Claim submitted for review")}>
                  Claim
                </Button>
                <Button size="sm" variant="ghost" className="rounded-lg" onClick={() => toast("Suggestion dismissed")}>
                  Not mine
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Tabs defaultValue="lost">
        <div className="grid gap-3 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center">
          <TabsList className="rounded-xl">
            <TabsTrigger value="lost" className="rounded-lg">Lost items</TabsTrigger>
            <TabsTrigger value="found" className="rounded-lg">Found items</TabsTrigger>
            <TabsTrigger value="report" className="rounded-lg">Report item</TabsTrigger>
          </TabsList>
          <div className="relative lg:max-w-xs lg:justify-self-end">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search items…"
              className="h-10 rounded-xl bg-card pl-9"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {lostFoundCategories.map((c) => (
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

        <TabsContent value="lost" className="mt-5">
          {filter(lostItems).length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {filter(lostItems).map((i, idx) => (
                <ItemCard key={i.id} item={i} index={idx} />
              ))}
            </div>
          ) : (
            <EmptyState icon={Search} title="No lost items match" description="Try a different category or clear your search." />
          )}
        </TabsContent>

        <TabsContent value="found" className="mt-5">
          {filter(foundItems).length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {filter(foundItems).map((i, idx) => (
                <ItemCard key={i.id} item={i} index={idx} />
              ))}
            </div>
          ) : (
            <EmptyState icon={Search} title="No found items match" description="Try a different category or clear your search." />
          )}
        </TabsContent>

        <TabsContent value="report" className="mt-5">
          <Card className="mx-auto max-w-2xl gap-0 rounded-2xl border-border p-6 shadow-soft">
            <h2 className="text-lg font-semibold">Report an item</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add as much detail as you can — it dramatically improves matching.
            </p>
            <form
              className="mt-6 space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Report submitted", { description: "We'll notify you if a match appears." });
              }}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Report type</Label>
                  <Select defaultValue="Lost">
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lost">I lost something</SelectItem>
                      <SelectItem value="Found">I found something</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select defaultValue="Electronics">
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {lostFoundCategories.slice(1).map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lf-title">Item title</Label>
                <Input id="lf-title" placeholder="Black laptop sleeve" className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lf-desc">Description</Label>
                <Textarea id="lf-desc" rows={4} placeholder="Distinguishing marks, contents, colour…" className="rounded-xl" />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="lf-loc">Location</Label>
                  <Input id="lf-loc" placeholder="Library, Level 3" className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lf-date">Date</Label>
                  <Input id="lf-date" type="date" className="h-11 rounded-xl" />
                </div>
              </div>
              <div className="rounded-xl border border-dashed border-border bg-muted/40 p-6 text-center">
                <p className="text-sm font-medium">Drop a photo here</p>
                <p className="mt-1 text-xs text-muted-foreground">PNG or JPG up to 5 MB (prototype placeholder)</p>
              </div>
              <Button type="submit" size="lg" className="h-11 w-full rounded-xl">
                <Plus className="size-4" /> Submit report
              </Button>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
