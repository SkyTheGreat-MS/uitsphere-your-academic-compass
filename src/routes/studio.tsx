import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import {
  Sparkles,
  FileText,
  NotebookPen,
  Layers,
  ListChecks,
  GraduationCap,
  Send,
  Upload,
  Clock3,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  RotateCcw,
  Timer,
  BookOpen,
  Lightbulb,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { subjects } from "@/data/academic";
import {
  exampleQuestions,
  flashcards,
  learningMaterials,
  mockExam,
  quizQuestions,
  recentSessions,
  smartNotes,
  suggestedPrompts,
  summaries,
  tutorConversation,
  examPerformance,
  type ChatMessage,
} from "@/data/studio";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "AI Learning Studio — Ma-Haw-Tha-Dar" },
      {
        name: "description",
        content:
          "Turn lecture materials into AI tutoring, summaries, smart notes, flashcards, quizzes and full mock exams.",
      },
      { property: "og:title", content: "AI Learning Studio — Ma-Haw-Tha-Dar" },
      { property: "og:description", content: "Your AI-powered study workspace for university lectures and revision." },
    ],
  }),
  component: StudioPage,
});

const subjectOf = (id: string) => subjects.find((s) => s.id === id)!;

function StudioPage() {
  return (
    <AppShell>
      <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 truncate text-2xl font-bold lg:text-3xl">
            <Sparkles className="size-6 shrink-0 text-primary" /> AI Learning Studio
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Distributed Systems · Lecture 09 — Consensus &amp; Raft
          </p>
        </div>
        <Button className="shrink-0 rounded-xl" onClick={() => toast.success("Upload ready", { description: "Material would be processed here." })}>
          <Upload className="size-4" /> Upload material
        </Button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card className="gap-0 rounded-2xl border-border p-4 shadow-soft">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Learning materials
            </h2>
            <ul className="space-y-2">
              {learningMaterials.map((m, i) => (
                <li key={m.id}>
                  <button
                    className={cn(
                      "w-full rounded-xl border p-3 text-left transition-colors",
                      i === 0 ? "border-primary/40 bg-primary-soft" : "border-border hover:bg-muted",
                    )}
                  >
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                      <p className="truncate text-xs font-semibold">{m.title}</p>
                      <Badge variant="secondary" className="shrink-0 rounded-full text-[10px]">
                        {m.type}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate text-[11px] text-muted-foreground">
                      {subjectOf(m.subjectId).code} · {m.pages} pages · {m.uploadedAt}
                    </p>
                    {m.status === "processing" && <Skeleton className="mt-2 h-1.5 w-full rounded-full" />}
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="gap-0 rounded-2xl border-border p-4 shadow-soft">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Recent sessions
            </h2>
            <ul className="space-y-2">
              {recentSessions.map((s) => (
                <li key={s.id} className="flex items-start gap-2.5 rounded-xl p-2 transition-colors hover:bg-muted">
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-accent/40 text-accent-foreground">
                    <Clock3 className="size-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium">{s.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {s.tool} · {s.when}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Tabs defaultValue="tutor" className="min-w-0">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-xl p-1">
            {[
              { v: "tutor", l: "AI Tutor", i: Sparkles },
              { v: "summary", l: "Summary", i: FileText },
              { v: "notes", l: "Smart Notes", i: NotebookPen },
              { v: "flashcards", l: "Flashcards", i: Layers },
              { v: "quiz", l: "Quiz Generator", i: ListChecks },
              { v: "exam", l: "Mock Exam", i: GraduationCap },
            ].map((t) => (
              <TabsTrigger key={t.v} value={t.v} className="rounded-lg text-xs sm:text-sm">
                <t.i className="size-4" /> {t.l}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="tutor" className="mt-4"><TutorTab /></TabsContent>
          <TabsContent value="summary" className="mt-4"><SummaryTab /></TabsContent>
          <TabsContent value="notes" className="mt-4"><NotesTab /></TabsContent>
          <TabsContent value="flashcards" className="mt-4"><FlashcardsTab /></TabsContent>
          <TabsContent value="quiz" className="mt-4"><QuizTab /></TabsContent>
          <TabsContent value="exam" className="mt-4"><ExamTab /></TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

/* ---------------------------------- Tutor --------------------------------- */

const mockReply = (q: string) =>
  `Great question about “${q.slice(0, 48)}”. Here's the short version: focus on the invariant first, then the mechanism. In Raft, safety comes from majority overlap — any two quorums share at least one node, so a newly elected leader always sees every committed entry. Would you like me to turn this into flashcards or a practice question?`;

function TutorTab() {
  const [messages, setMessages] = useState<ChatMessage[]>(tutorConversation);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((m) => [...m, { id: `u${Date.now()}`, role: "student", content: text, time: now }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { id: `a${Date.now()}`, role: "ai", content: mockReply(text), time: now }]);
    }, 1400);
  };

  return (
    <Card className="flex h-[640px] flex-col gap-0 overflow-hidden rounded-2xl border-border p-0 shadow-soft">
      <ScrollArea className="flex-1">
        <div className="space-y-5 p-5">
          <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-4">
            <p className="flex items-center gap-2 text-xs font-semibold">
              <Lightbulb className="size-4 text-primary" /> Example questions
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {exampleQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={cn("flex gap-3", m.role === "student" && "flex-row-reverse")}
            >
              <Avatar className="size-8 shrink-0">
                <AvatarFallback
                  className={cn(
                    "text-[10px] font-bold",
                    m.role === "ai" ? "gradient-brand text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  {m.role === "ai" ? "AI" : "AO"}
                </AvatarFallback>
              </Avatar>
              <div className={cn("max-w-[78%] min-w-0", m.role === "student" && "text-right")}>
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    m.role === "student"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-card text-card-foreground",
                  )}
                >
                  {m.content}
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">{m.time}</p>
              </div>
            </motion.div>
          ))}

          <AnimatePresence>
            {typing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-3">
                <Avatar className="size-8">
                  <AvatarFallback className="gradient-brand text-[10px] font-bold text-primary-foreground">AI</AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1.5 rounded-2xl border border-border bg-card px-4 py-3">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="size-1.5 rounded-full bg-muted-foreground"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={endRef} />
        </div>
      </ScrollArea>

      <div className="border-t border-border p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {suggestedPrompts.map((p) => (
            <button
              key={p}
              onClick={() => send(p)}
              className="rounded-full bg-primary-soft px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
            >
              {p}
            </button>
          ))}
        </div>
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your lecture materials…"
            className="h-11 rounded-xl"
          />
          <Button type="submit" size="icon" className="size-11 shrink-0 rounded-xl" aria-label="Send message">
            <Send className="size-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}

/* --------------------------------- Summary -------------------------------- */

function SummaryTab() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {summaries.map((s, i) => (
        <motion.div key={s.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
          <Card className="hover-lift h-full gap-0 rounded-2xl border-border p-5 shadow-soft">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
              <h3 className="text-base font-semibold">{s.title}</h3>
              <Badge variant="secondary" className="shrink-0 rounded-full text-[11px]">
                <BookOpen className="mr-1 size-3" /> {s.readingTime}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{subjectOf(s.subjectId).name}</p>

            <ul className="mt-4 space-y-2">
              {s.bullets.map((b) => (
                <li key={b} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                  {b}
                </li>
              ))}
            </ul>

            <div className="mt-4 rounded-xl bg-primary-soft/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Key takeaways</p>
              <ul className="mt-2 space-y-1.5">
                {s.takeaways.map((t) => (
                  <li key={t} className="flex gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

/* ------------------------------- Smart Notes ------------------------------ */

function NotesTab() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {smartNotes.map((n, i) => (
        <motion.div key={n.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
          <Card className="hover-lift h-full gap-0 rounded-2xl border-border p-5 shadow-soft">
            <h3 className="text-base font-semibold">{n.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{subjectOf(n.subjectId).name}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {n.keyConcepts.map((k) => (
                <Badge key={k} variant="secondary" className="rounded-full text-[11px]">
                  {k}
                </Badge>
              ))}
            </div>

            <Block title="Definitions">
              <dl className="space-y-2">
                {n.definitions.map((d) => (
                  <div key={d.term}>
                    <dt className="text-sm font-semibold">{d.term}</dt>
                    <dd className="text-sm text-muted-foreground">{d.meaning}</dd>
                  </div>
                ))}
              </dl>
            </Block>

            <Block title="Important points">
              <ul className="space-y-1.5">
                {n.importantPoints.map((p) => (
                  <li key={p} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-chart-2" />
                    {p}
                  </li>
                ))}
              </ul>
            </Block>

            <div className="mt-4 rounded-xl bg-warning/15 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-warning-foreground">Exam tips</p>
              <ul className="mt-2 space-y-1.5">
                {n.examTips.map((t) => (
                  <li key={t} className="text-sm text-warning-foreground">
                    • {t}
                  </li>
                ))}
              </ul>
            </div>

            <Block title="Examples">
              <ul className="space-y-1.5">
                {n.examples.map((e) => (
                  <li key={e} className="text-sm text-muted-foreground">
                    • {e}
                  </li>
                ))}
              </ul>
            </Block>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}

/* -------------------------------- Flashcards ------------------------------ */

function FlashcardsTab() {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [learned, setLearned] = useState<string[]>([]);
  const card = flashcards[index];

  const go = (dir: number) => {
    setFlipped(false);
    setIndex((i) => (i + dir + flashcards.length) % flashcards.length);
  };

  const tone =
    card.difficulty === "Easy"
      ? "bg-success/15 text-success"
      : card.difficulty === "Medium"
        ? "bg-warning/25 text-warning-foreground"
        : "bg-destructive/10 text-destructive";

  return (
    <Card className="gap-0 rounded-2xl border-border p-6 shadow-soft">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold">
            Card {index + 1} of {flashcards.length}
          </p>
          <p className="text-xs text-muted-foreground">
            {learned.length} marked as learned · {subjectOf(card.subjectId).code}
          </p>
        </div>
        <span className={cn("shrink-0 rounded-full px-3 py-1 text-xs font-semibold", tone)}>{card.difficulty}</span>
      </div>

      <Progress value={((index + 1) / flashcards.length) * 100} className="mt-4 h-2" />

      <div className="mt-6 [perspective:1400px]">
        <button
          onClick={() => setFlipped((f) => !f)}
          className="relative block h-[280px] w-full flip-3d text-left"
          style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
          aria-label="Flip flashcard"
        >
          <div className="absolute inset-0 grid place-items-center rounded-2xl border border-border bg-card p-8 text-center shadow-soft backface-hidden">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Question</p>
              <p className="mt-3 font-display text-xl font-semibold">{card.front}</p>
              <p className="mt-6 text-xs text-muted-foreground">Click to reveal the answer</p>
            </div>
          </div>
          <div
            className="absolute inset-0 grid place-items-center rounded-2xl gradient-brand p-8 text-center text-primary-foreground shadow-soft backface-hidden"
            style={{ transform: "rotateY(180deg)" }}
          >
            <div>
              <p className="text-xs uppercase tracking-wider text-primary-foreground/70">Answer</p>
              <p className="mt-3 text-base leading-relaxed">{card.back}</p>
            </div>
          </div>
        </button>
      </div>

      <div className="mt-6 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
        <Button variant="outline" className="rounded-xl" onClick={() => go(-1)}>
          <ChevronLeft className="size-4" /> Previous
        </Button>
        <Button
          variant={learned.includes(card.id) ? "secondary" : "default"}
          className="rounded-xl"
          onClick={() => {
            setLearned((l) => (l.includes(card.id) ? l.filter((x) => x !== card.id) : [...l, card.id]));
            if (!learned.includes(card.id)) toast.success("Marked as learned");
          }}
        >
          <CheckCircle2 className="size-4" />
          {learned.includes(card.id) ? "Learned" : "Mark as learned"}
        </Button>
        <Button variant="outline" className="rounded-xl" onClick={() => go(1)}>
          Next <ChevronRight className="size-4" />
        </Button>
      </div>
    </Card>
  );
}

/* ----------------------------------- Quiz --------------------------------- */

function QuizTab() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  const q = quizQuestions[index];
  const score = answers.filter((a, i) => a === quizQuestions[i].answerIndex).length;

  if (finished) {
    return (
      <Card className="gap-0 rounded-2xl border-border p-8 text-center shadow-soft">
        <p className="text-sm text-muted-foreground">Quiz complete</p>
        <p className="mt-2 font-display text-5xl font-bold text-primary">
          {Math.round((score / quizQuestions.length) * 100)}%
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {score} of {quizQuestions.length} correct
        </p>
        <div className="mt-8 space-y-3 text-left">
          {quizQuestions.map((question, i) => {
            const correct = answers[i] === question.answerIndex;
            return (
              <div key={question.id} className="rounded-xl border border-border p-4">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                  <p className="text-sm font-semibold">{question.question}</p>
                  <Badge className={cn("shrink-0 rounded-full", correct ? "bg-success" : "bg-destructive")}>
                    {correct ? "Correct" : "Missed"}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{question.explanation}</p>
              </div>
            );
          })}
        </div>
        <Button
          className="mt-6 rounded-xl"
          onClick={() => {
            setIndex(0);
            setAnswers([]);
            setSelected(null);
            setFinished(false);
          }}
        >
          <RotateCcw className="size-4" /> Retake quiz
        </Button>
      </Card>
    );
  }

  return (
    <Card className="gap-0 rounded-2xl border-border p-6 shadow-soft">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <p className="text-sm font-semibold">
          Question {index + 1} of {quizQuestions.length}
        </p>
        <Badge variant="secondary" className="shrink-0 rounded-full">
          Auto-generated
        </Badge>
      </div>
      <Progress value={((index + 1) / quizQuestions.length) * 100} className="mt-3 h-2" />

      <h3 className="mt-6 font-display text-lg font-semibold">{q.question}</h3>

      <div className="mt-5 space-y-2.5">
        {q.options.map((o, i) => {
          const isSelected = selected === i;
          const reveal = selected !== null;
          const isAnswer = i === q.answerIndex;
          return (
            <button
              key={o}
              onClick={() => selected === null && setSelected(i)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border p-4 text-left text-sm transition-colors",
                !reveal && "border-border hover:border-primary/40 hover:bg-muted",
                reveal && isAnswer && "border-success bg-success/10",
                reveal && isSelected && !isAnswer && "border-destructive bg-destructive/10",
                reveal && !isSelected && !isAnswer && "border-border opacity-60",
              )}
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-muted text-xs font-bold">
                {String.fromCharCode(65 + i)}
              </span>
              {o}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-5 overflow-hidden"
          >
            <div className="rounded-xl bg-primary-soft/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Explanation</p>
              <p className="mt-1.5 text-sm text-muted-foreground">{q.explanation}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        className="mt-6 w-full rounded-xl"
        disabled={selected === null}
        onClick={() => {
          const next = [...answers, selected!];
          setAnswers(next);
          setSelected(null);
          if (index + 1 >= quizQuestions.length) setFinished(true);
          else setIndex(index + 1);
        }}
      >
        {index + 1 >= quizQuestions.length ? "Finish quiz" : "Next question"}
        <ChevronRight className="size-4" />
      </Button>
    </Card>
  );
}

/* --------------------------------- Mock exam ------------------------------ */

function ExamTab() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [seconds, setSeconds] = useState(45 * 60);

  useEffect(() => {
    if (submitted) return;
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [submitted]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const q = mockExam[index];
  const correct = mockExam.filter((question, i) => answers[i] === question.answerIndex).length;

  if (submitted) {
    return (
      <div className="space-y-4">
        <Card className="gap-0 rounded-2xl border-border p-8 text-center shadow-soft">
          <p className="text-sm text-muted-foreground">Mock exam submitted</p>
          <p className="mt-2 font-display text-5xl font-bold text-primary">
            {Math.round((correct / mockExam.length) * 100)}%
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {correct} of {mockExam.length} questions correct · {45 - Math.floor(seconds / 60)} min used
          </p>
          <Button
            className="mt-6 rounded-xl"
            onClick={() => {
              setSubmitted(false);
              setAnswers({});
              setIndex(0);
              setSeconds(45 * 60);
            }}
          >
            <RotateCcw className="size-4" /> Retake exam
          </Button>
        </Card>

        <Card className="gap-0 rounded-2xl border-border p-5 shadow-soft">
          <h3 className="mb-4 text-sm font-semibold">Performance analytics</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={examPerformance} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="topic" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-card)", fontSize: 12 }} />
                <Bar dataKey="score" fill="var(--color-primary)" radius={[8, 8, 0, 0]} animationDuration={900} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
      <Card className="gap-0 rounded-2xl border-border p-6 shadow-soft">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Distributed Systems — Mock Exam A</p>
            <p className="text-xs text-muted-foreground">
              Question {index + 1} of {mockExam.length} · {q.marks} marks
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 rounded-xl bg-destructive/10 px-3 py-1.5 font-mono text-sm font-semibold text-destructive">
            <Timer className="size-4" /> {mm}:{ss}
          </span>
        </div>

        <h3 className="mt-6 font-display text-lg font-semibold">{q.question}</h3>
        <div className="mt-5 space-y-2.5">
          {q.options.map((o, i) => (
            <button
              key={o}
              onClick={() => setAnswers((a) => ({ ...a, [index]: i }))}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border p-4 text-left text-sm transition-colors",
                answers[index] === i ? "border-primary bg-primary-soft" : "border-border hover:bg-muted",
              )}
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-muted text-xs font-bold">
                {String.fromCharCode(65 + i)}
              </span>
              {o}
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <Button variant="outline" className="rounded-xl" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
            <ChevronLeft className="size-4" /> Previous
          </Button>
          <Button
            variant="outline"
            className="rounded-xl"
            disabled={index === mockExam.length - 1}
            onClick={() => setIndex((i) => i + 1)}
          >
            Next <ChevronRight className="size-4" />
          </Button>
        </div>
      </Card>

      <Card className="h-fit gap-0 rounded-2xl border-border p-5 shadow-soft">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Question palette</h3>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {mockExam.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={cn(
                "grid aspect-square place-items-center rounded-lg text-xs font-semibold transition-colors",
                i === index
                  ? "bg-primary text-primary-foreground"
                  : answers[i] !== undefined
                    ? "bg-success/20 text-success"
                    : "bg-muted text-muted-foreground hover:bg-accent/40",
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          {Object.keys(answers).length} of {mockExam.length} answered
        </p>
        <Progress value={(Object.keys(answers).length / mockExam.length) * 100} className="mt-2 h-1.5" />
        <Button
          className="mt-5 w-full rounded-xl"
          onClick={() => {
            setSubmitted(true);
            toast.success("Exam submitted", { description: "Your results are ready." });
          }}
        >
          Submit exam
        </Button>
      </Card>
    </div>
  );
}
