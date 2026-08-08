import { useEffect, useRef, useState } from "react";
import axios from "axios";
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
  Loader2,
  Trash2,
  Clock3,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  RotateCcw,
  X,
  Timer,
  BookOpen,
  MessageSquarePlus,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import {
  createChatSession,
  getChatMessages,
  getChatSessions,
  sendChatMessage,
  type ChatHistoryMessage,
  type ChatSession,
} from "@/api/chatApi";
import {
  deleteMaterial,
  getMaterials,
  uploadMaterial,
  type LearningMaterial,
} from "@/api/materialsApi";
import { generateSummary, getSummaries, type GeneratedSummary } from "@/api/summaryApi";
import { generateSmartNotes, getSmartNotes, type GeneratedSmartNote } from "@/api/smartNotesApi";
import {
  deleteFlashcardDeck,
  generateFlashcards,
  getFlashcardDecks,
  getFlashcardDeck,
  markFlashcardLearned,
  type Flashcard,
  type FlashcardDeck,
  type FlashcardDeckDetail,
  type FlashcardDifficulty,
} from "@/api/flashcardsApi";
import {
  completeQuizAttempt,
  deleteQuiz,
  generateQuiz,
  getQuiz,
  getQuizAttempts,
  getQuizzes,
  startQuizAttempt,
  submitAnswer,
  type Quiz,
  type QuizDetail,
  type QuizOption,
  type QuizResult,
} from "@/api/quizApi";
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
  mockExam,
  smartNotes,
  examPerformance,
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
      {
        property: "og:description",
        content: "Your AI-powered study workspace for university lectures and revision.",
      },
    ],
  }),
  component: StudioPage,
});

const subjectOf = (id: string) => subjects.find((s) => s.id === id)!;

function axiosErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    return error.response?.data?.error ?? error.message;
  }
  return error instanceof Error ? error.message : "Please try again.";
}

function formatUploadDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatMaterialStatus(status: LearningMaterial["status"]) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function formatChatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function StudioPage() {
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<number[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getMaterials()
      .then(setMaterials)
      .catch(() =>
        toast.error("Could not load learning materials", { description: "Please try again." }),
      )
      .finally(() => setMaterialsLoading(false));
  }, []);

  useEffect(() => {
    getChatSessions() 
      .then((loadedSessions) => {
        setSessions(loadedSessions);
        setSelectedSessionId(loadedSessions[0]?.id ?? null);
      })
      .catch(() => toast.error("Could not load chat history", { description: "Please try again." }))
      .finally(() => setSessionsLoading(false));
  }, []);

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const material = await uploadMaterial(file);
      setMaterials((current) => [material, ...current]);
      toast.success("Material uploaded", { description: file.name });
    } catch (error) {
      const message = axiosErrorMessage(error);
      toast.error("Upload failed", { description: message });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteMaterial(id);
      setMaterials((current) => current.filter((material) => material.id !== id));
      setSelectedMaterialIds((current) => current.filter((materialId) => materialId !== id));
      toast.success("Material deleted");
    } catch (error) {
      toast.error("Could not delete material", { description: axiosErrorMessage(error) });
    } finally {
      setDeletingId(null);
    }
  };

  const handleNewSession = async () => {
    try {
      const session = await createChatSession(selectedMaterialIds);
      setSessions((current) => [session, ...current]);
      setSelectedSessionId(session.id);
    } catch (error) {
      toast.error("Could not create chat", { description: axiosErrorMessage(error) });
    }
  };

  const selectedSession = sessions.find((session) => session.id === selectedSessionId) ?? null;

  useEffect(() => {
    if (selectedSession) setSelectedMaterialIds(selectedSession.materialIds);
  }, [selectedSession?.id]);

  return (
    <AppShell>
      <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 truncate text-2xl font-bold lg:text-3xl">
            <Sparkles className="size-6 shrink-0 text-primary" /> AI Learning Studio
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Semester IV · Enterprise Applications Development using Java
          </p>
        </div>
        <>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.ppt,.pptx,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
            onChange={handleFileSelected}
          />
          <Button
            className="shrink-0 rounded-xl"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            {uploading ? "Uploading…" : "Upload lecture materials (PDF, images)"}
          </Button>
        </>
      </div>

      <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card id="learning-materials" className="gap-0 rounded-2xl border-border p-4 shadow-soft">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Learning materials
            </h2>
            {materialsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : materials.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                No learning materials yet. Upload a lecture file to get started.
              </p>
            ) : (
              <ul className="space-y-2">
                {materials.map((material) => (
                  <li
                    key={material.id}
                    className={cn(
                      "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 rounded-xl border p-1",
                      selectedMaterialIds.includes(material.id)
                        ? "border-primary/40 bg-primary-soft"
                        : "border-border",
                    )}
                  >
                    <button
                      type="button"
                      className="min-w-0 rounded-lg p-2 text-left hover:bg-muted/60"
                      disabled={material.status !== "READY"}
                      onClick={() =>
                        setSelectedMaterialIds((current) =>
                          current.includes(material.id)
                            ? current.filter((id) => id !== material.id)
                            : [...current, material.id],
                        )
                      }
                    >
                      <p className="truncate text-xs font-semibold">{material.fileName}</p>
                      <p className="mt-1 truncate text-[11px] text-muted-foreground">
                        {material.fileType} · {formatUploadDate(material.uploadedAt)}
                      </p>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {formatMaterialStatus(material.status)}
                      </p>
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${material.fileName}`}
                      className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                      disabled={deletingId === material.id}
                      onClick={() => handleDelete(material.id)}
                    >
                      {deletingId === material.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="size-3.5" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="gap-0 rounded-2xl border-border p-4 shadow-soft">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Chat history
            </h2>
            <Button
              variant="outline"
              size="sm"
              className="mb-3 h-8 rounded-lg px-2 text-xs"
              onClick={handleNewSession}
            >
              <MessageSquarePlus className="size-3.5" /> New chat
            </Button>
            <ul className="space-y-2">
              {sessions.map((session) => {
                const s = {
                  title: session.title,
                  tool: session.materialTitle ?? "General knowledge",
                  when: formatChatTime(session.updatedAt),
                };
                return (
                  <li
                    key={session.id}
                    onClick={() => setSelectedSessionId(session.id)}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl p-3 transition-colors",
                      selectedSessionId === session.id
                        ? "bg-primary-soft border border-primary/30"
                        : "hover:bg-muted/60",
                    )}
                  >
                    <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-accent/40 text-accent-foreground">
                      <Clock3 className="size-3.5" />
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium">{session.title}</p>

                      <p className="text-[11px] text-muted-foreground">
                        {s.tool} · {s.when}
                      </p>
                    </div>
                  </li>
                );
              })}
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

          <TabsContent value="tutor" className="mt-4">
            <TutorTab
              materials={materials}
              selectedMaterialIds={selectedMaterialIds}
              onSelectMaterials={setSelectedMaterialIds}
              session={selectedSession}
              onEnsureSession={async () => {
                if (selectedSessionId !== null) return selectedSessionId;
                const created = await createChatSession(selectedMaterialIds);
                setSessions((current) => [created, ...current]);
                setSelectedSessionId(created.id);
                return created.id;
              }}
            />
          </TabsContent>
          <TabsContent value="summary" className="mt-4">
            <SummaryTab materials={materials} selectedMaterialIds={selectedMaterialIds} onSelectMaterials={setSelectedMaterialIds} />
          </TabsContent>
          <TabsContent value="notes" className="mt-4">
            <NotesTab materials={materials} selectedMaterialIds={selectedMaterialIds} onSelectMaterials={setSelectedMaterialIds} />
          </TabsContent>
          <TabsContent value="flashcards" className="mt-4">
            <FlashcardsTab
              materials={materials}
              selectedMaterialIds={selectedMaterialIds}
              onSelectMaterials={setSelectedMaterialIds}
            />
          </TabsContent>
          <TabsContent value="quiz" className="mt-4">
            <QuizTab
              materials={materials}
              selectedMaterialIds={selectedMaterialIds}
              onSelectMaterials={setSelectedMaterialIds}
            />
          </TabsContent>
          <TabsContent value="exam" className="mt-4">
            <ExamTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

/* ---------------------------------- Tutor --------------------------------- */

function TutorTab({
  materials,
  selectedMaterialIds,
  onSelectMaterials,
  session,
  onEnsureSession,
}: {
  materials: LearningMaterial[];
  selectedMaterialIds: number[];
  onSelectMaterials: (ids: number[]) => void;
  session: ChatSession | null;
  onEnsureSession: () => Promise<number>;
}) {
  const [messages, setMessages] = useState<ChatHistoryMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session) {
      setMessages([]);
      return;
    }
    setHistoryLoading(true);
    getChatMessages(session.id)
      .then(setMessages)
      .catch(() => toast.error("Could not load conversation", { description: "Please try again." }))
      .finally(() => setHistoryLoading(false));
  }, [session?.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    setInput("");
    setTyping(true);

    try {
      const sessionId = session?.id ?? (await onEnsureSession());
      await sendChatMessage(sessionId, text.trim(), selectedMaterialIds);
      setMessages(await getChatMessages(sessionId));
    } catch (error) {
      toast.error("AI service unavailable", { description: axiosErrorMessage(error) });
    } finally {
      setTyping(false);
    }
  };

  return (
    <Card className="flex h-[640px] flex-col gap-0 overflow-hidden rounded-2xl border-border p-0 shadow-soft">
      <ScrollArea className="flex-1">
        <div className="space-y-5 p-5">
          {historyLoading ? (
            <Skeleton className="h-20 w-3/4 rounded-2xl" />
          ) : selectedMaterialIds.length === 0 ? (
            <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border bg-muted/40 p-8 text-center">
              <h2 className="text-lg font-semibold">AI Learning Studio</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Choose lecture materials to start asking questions.
              </p>
              <Button
                type="button"
                className="mt-5 rounded-xl"
                onClick={() =>
                  document
                    .getElementById("learning-materials")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Select Materials
              </Button>
            </div>
          ) : messages.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Ask anything about your selected lectures.
            </p>
          ) : (
            messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={cn("flex gap-3", m.role === "USER" && "flex-row-reverse")}
              >
                <Avatar className="size-8 shrink-0">
                  <AvatarFallback
                    className={cn(
                      "text-[10px] font-bold",
                      m.role === "ASSISTANT"
                        ? "gradient-brand text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {m.role === "ASSISTANT" ? "AI" : "AO"}
                  </AvatarFallback>
                </Avatar>
                <div className={cn("max-w-[78%] min-w-0", m.role === "USER" && "text-right")}>
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      m.role === "USER"
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-card text-card-foreground",
                    )}
                  >
                    {m.content}
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {formatChatTime(m.createdAt)}
                  </p>
                </div>
              </motion.div>
            ))
          )}

          <AnimatePresence>
            {typing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex gap-3"
              >
                <Avatar className="size-8">
                  <AvatarFallback className="gradient-brand text-[10px] font-bold text-primary-foreground">
                    AI
                  </AvatarFallback>
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
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-muted-foreground">Lecture materials</p>
          <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">
            {selectedMaterialIds.length} selected
          </span>
        </div>
        <div className="mb-4 grid max-h-44 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
          {materials.map((material) => {
            const selected = selectedMaterialIds.includes(material.id);
            const ready = material.status === "READY";
            return (
              <button
                key={material.id}
                type="button"
                disabled={!ready}
                onClick={() =>
                  onSelectMaterials(
                    selected
                      ? selectedMaterialIds.filter((id) => id !== material.id)
                      : [...selectedMaterialIds, material.id],
                  )
                }
                className={cn(
                  "flex items-start gap-3 rounded-xl border bg-card p-3 text-left transition-colors",
                  selected
                    ? "border-primary bg-primary-soft"
                    : "border-border hover:border-primary/40",
                  !ready && "cursor-not-allowed opacity-60",
                )}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-primary">
                  <FileText className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold">{material.fileName}</span>
                  <span className="mt-1 block truncate text-[11px] text-muted-foreground">
                    Enterprise Applications Development using Java
                  </span>
                  <span className="mt-1 block text-[10px] text-muted-foreground">
                    {material.fileType} · Uploaded {formatUploadDate(material.uploadedAt)} ·{" "}
                    {formatMaterialStatus(material.status)}
                  </span>
                </span>
                {selected && <CheckCircle2 className="size-4 shrink-0 text-primary" />}
              </button>
            );
          })}
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
          <Button
            type="submit"
            size="icon"
            className="size-11 shrink-0 rounded-xl"
            aria-label="Send message"
          >
            <Send className="size-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}

/* --------------------------------- Summary -------------------------------- */

function SummaryTab({
  materials,
  selectedMaterialIds,
  onSelectMaterials,
}: {
  materials: LearningMaterial[];
  selectedMaterialIds: number[];
  onSelectMaterials: (ids: number[]) => void;
}) {
  const [summaries, setSummaries] = useState<GeneratedSummary[]>([]);
  const [activeSummary, setActiveSummary] = useState<GeneratedSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    getSummaries()
      .then((loaded) => { setSummaries(loaded); setActiveSummary(loaded[0] ?? null); })
      .catch((error) => toast.error("Could not load summaries", { description: axiosErrorMessage(error) }))
      .finally(() => setLoading(false));
  }, []);

  const toggleMaterial = (id: number) => onSelectMaterials(
    selectedMaterialIds.includes(id)
      ? selectedMaterialIds.filter((selectedId) => selectedId !== id)
      : [...selectedMaterialIds, id],
  );

  const handleGenerate = async () => {
    if (selectedMaterialIds.length === 0) { toast.error("Select at least one ready lecture"); return; }
    setGenerating(true);
    try {
      const summary = await generateSummary(selectedMaterialIds);
      setSummaries((current) => [summary, ...current]);
      setActiveSummary(summary);
      toast.success("Summary generated");
    } catch (error) {
      toast.error("Could not generate summary", { description: axiosErrorMessage(error) });
    } finally { setGenerating(false); }
  };

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border-border p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="font-semibold">Lecture materials</h2><p className="text-sm text-muted-foreground">Select one or more ready lectures for a structured study summary.</p></div>
          <Button onClick={handleGenerate} disabled={generating || selectedMaterialIds.length === 0}>
            {generating ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {generating ? "Generating..." : "Generate Summary"}
          </Button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {materials.length === 0 ? <p className="text-sm text-muted-foreground">Upload a lecture to begin.</p> : materials.map((material) => {
            const selected = selectedMaterialIds.includes(material.id);
            const ready = material.status === "READY";
            return <button type="button" key={material.id} disabled={!ready} onClick={() => toggleMaterial(material.id)} className={cn("flex items-start gap-3 rounded-xl border p-4 text-left transition", selected ? "border-primary bg-primary-soft/60" : "border-border bg-white hover:border-primary/50", !ready && "cursor-not-allowed opacity-50")}>
              <FileText className="mt-0.5 size-5 shrink-0 text-primary" />
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{material.fileName}</span><span className="mt-1 block text-xs text-muted-foreground">{material.fileType} · Uploaded {formatUploadDate(material.uploadedAt)} · {formatMaterialStatus(material.status)}</span></span>
              {selected && <CheckCircle2 className="size-5 shrink-0 text-primary" />}
            </button>;
          })}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Selected: {selectedMaterialIds.length} lecture(s)</p>
      </Card>
      {loading ? <Skeleton className="h-48 rounded-2xl" /> : summaries.length === 0 ? (
        <Card className="rounded-2xl border-dashed p-10 text-center shadow-soft"><Sparkles className="mx-auto size-8 text-primary" /><h3 className="mt-3 font-semibold">No summaries yet</h3><p className="mt-1 text-sm text-muted-foreground">Select lecture materials and generate your first study summary.</p></Card>
      ) : <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <Card className="rounded-2xl border-border p-3 shadow-soft"><p className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Previous summaries</p><div className="space-y-1">{summaries.map((summary) => <button type="button" key={summary.id} onClick={() => setActiveSummary(summary)} className={cn("w-full rounded-xl p-3 text-left text-sm transition", activeSummary?.id === summary.id ? "bg-primary-soft font-semibold text-primary" : "hover:bg-muted")}><span className="block truncate">{summary.title}</span><span className="mt-1 block text-xs font-normal text-muted-foreground">{formatUploadDate(summary.createdAt)}</span></button>)}</div></Card>
        {activeSummary && <Card className="rounded-2xl border-border p-5 shadow-soft"><h2 className="text-lg font-semibold">{activeSummary.title}</h2><p className="mt-1 text-xs text-muted-foreground">{activeSummary.materialIds.length} lecture(s) · {formatUploadDate(activeSummary.createdAt)}</p><div className="mt-5 whitespace-pre-wrap text-sm leading-7 text-foreground">{activeSummary.content}</div></Card>}
      </div>}
    </div>
  );
}

/* ------------------------------- Smart Notes ------------------------------ */

function NotesTab({
  materials,
  selectedMaterialIds,
  onSelectMaterials,
}: {
  materials: LearningMaterial[];
  selectedMaterialIds: number[];
  onSelectMaterials: (ids: number[]) => void;
}) {
  const [notes, setNotes] = useState<GeneratedSmartNote[]>([]);
  const [activeNote, setActiveNote] = useState<GeneratedSmartNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    getSmartNotes().then((loaded) => { setNotes(loaded); setActiveNote(loaded[0] ?? null); })
      .catch((error) => toast.error("Could not load smart notes", { description: axiosErrorMessage(error) }))
      .finally(() => setLoading(false));
  }, []);

  const toggleMaterial = (id: number) => onSelectMaterials(selectedMaterialIds.includes(id)
    ? selectedMaterialIds.filter((selectedId) => selectedId !== id)
    : [...selectedMaterialIds, id]);

  const handleGenerate = async () => {
    if (!selectedMaterialIds.length) { toast.error("Select at least one ready lecture"); return; }
    setGenerating(true);
    try {
      const note = await generateSmartNotes(selectedMaterialIds);
      setNotes((current) => [note, ...current]);
      setActiveNote(note);
      toast.success("Smart notes generated");
    } catch (error) {
      toast.error("Could not generate smart notes", { description: axiosErrorMessage(error) });
    } finally { setGenerating(false); }
  };

  return <div className="space-y-4">
    <Card className="rounded-2xl border-border p-5 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="font-semibold">Lecture materials</h2><p className="text-sm text-muted-foreground">Choose one or more ready lectures for concise revision notes.</p></div>
        <Button onClick={handleGenerate} disabled={generating || !selectedMaterialIds.length}>{generating ? <Loader2 className="size-4 animate-spin" /> : <NotebookPen className="size-4" />}{generating ? "Generating..." : "Generate Notes"}</Button>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">{materials.length === 0 ? <p className="text-sm text-muted-foreground">Upload a lecture to begin.</p> : materials.map((material) => {
        const selected = selectedMaterialIds.includes(material.id); const ready = material.status === "READY";
        return <button type="button" key={material.id} disabled={!ready} onClick={() => toggleMaterial(material.id)} className={cn("flex items-start gap-3 rounded-xl border p-4 text-left transition", selected ? "border-primary bg-primary-soft/60" : "border-border bg-white hover:border-primary/50", !ready && "cursor-not-allowed opacity-50")}><FileText className="mt-0.5 size-5 shrink-0 text-primary" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{material.fileName}</span><span className="mt-1 block text-xs text-muted-foreground">{material.fileType} · Uploaded {formatUploadDate(material.uploadedAt)} · {formatMaterialStatus(material.status)}</span></span>{selected && <CheckCircle2 className="size-5 shrink-0 text-primary" />}</button>;
      })}</div>
      <p className="mt-3 text-xs text-muted-foreground">Selected: {selectedMaterialIds.length} lecture(s)</p>
    </Card>
    {loading ? <Skeleton className="h-48 rounded-2xl" /> : !notes.length ? <Card className="rounded-2xl border-dashed p-10 text-center shadow-soft"><NotebookPen className="mx-auto size-8 text-primary" /><h3 className="mt-3 font-semibold">No smart notes yet</h3><p className="mt-1 text-sm text-muted-foreground">Select lecture materials and generate your first revision notes.</p></Card> : <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
      <Card className="rounded-2xl border-border p-3 shadow-soft"><p className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Previous notes</p>{notes.map((note) => <button type="button" key={note.id} onClick={() => setActiveNote(note)} className={cn("mt-1 w-full rounded-xl p-3 text-left text-sm transition", activeNote?.id === note.id ? "bg-primary-soft font-semibold text-primary" : "hover:bg-muted")}><span className="block truncate">{note.title}</span><span className="mt-1 block text-xs font-normal text-muted-foreground">{formatUploadDate(note.createdAt)}</span></button>)}</Card>
      {activeNote && <Card className="rounded-2xl border-border p-5 shadow-soft"><h2 className="text-lg font-semibold">{activeNote.title}</h2><p className="mt-1 text-xs text-muted-foreground">{activeNote.materialIds.length} lecture(s) · {formatUploadDate(activeNote.createdAt)}</p><div className="mt-5 whitespace-pre-wrap text-sm leading-7 text-foreground">{activeNote.content}</div></Card>}
    </div>}
  </div>;
}

function LegacyMockNotesTab() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {smartNotes.map((n, i) => (
        <motion.div
          key={n.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
        >
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
              <p className="text-xs font-semibold uppercase tracking-wide text-warning-foreground">
                Exam tips
              </p>
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
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  );
}

/* -------------------------------- Flashcards ------------------------------ */

function FlashcardsTab({
  materials,
  selectedMaterialIds,
  onSelectMaterials,
}: {
  materials: LearningMaterial[];
  selectedMaterialIds: number[];
  onSelectMaterials: (ids: number[]) => void;
}) {
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [activeDeck, setActiveDeck] = useState<FlashcardDeckDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    getFlashcardDecks()
      .then(async (loadedDecks) => {
        if (!active) return;
        setDecks(loadedDecks);
        if (loadedDecks[0]) {
          const detail = await getFlashcardDeck(loadedDecks[0].id);
          if (active) {
            setActiveDeck(detail);
            setCardIndex(0);
            setFlipped(false);
          }
        }
      })
      .catch((error) =>
        toast.error("Could not load flashcard decks", { description: axiosErrorMessage(error) }),
      )
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const toggleMaterial = (id: number) =>
    onSelectMaterials(
      selectedMaterialIds.includes(id)
        ? selectedMaterialIds.filter((selectedId) => selectedId !== id)
        : [...selectedMaterialIds, id],
    );

  const openDeck = async (deckId: number) => {
    try {
      const detail = await getFlashcardDeck(deckId);
      setActiveDeck(detail);
      setCardIndex(0);
      setFlipped(false);
    } catch (error) {
      toast.error("Could not load deck", { description: axiosErrorMessage(error) });
    }
  };

  const handleGenerate = async () => {
    if (!selectedMaterialIds.length) {
      toast.error("Select at least one ready lecture");
      return;
    }
    setGenerating(true);
    try {
      const detail = await generateFlashcards(selectedMaterialIds);
      setDecks((current) => [detail.deck, ...current.filter((d) => d.id !== detail.deck.id)]);
      setActiveDeck(detail);
      setCardIndex(0);
      setFlipped(false);
      toast.success("Flashcards generated");
    } catch (error) {
      toast.error("Could not generate flashcards", { description: axiosErrorMessage(error) });
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (deckId: number) => {
    setDeletingId(deckId);
    try {
      await deleteFlashcardDeck(deckId);
      setDecks((current) => current.filter((d) => d.id !== deckId));
      if (activeDeck?.deck.id === deckId) {
        setActiveDeck(null);
        setCardIndex(0);
        setFlipped(false);
      }
      toast.success("Deck deleted");
    } catch (error) {
      toast.error("Could not delete deck", { description: axiosErrorMessage(error) });
    } finally {
      setDeletingId(null);
    }
  };

  const toggleLearned = async (card: Flashcard) => {
    const target = !card.learned;
    setActiveDeck((current) =>
      current
        ? {
            ...current,
            cards: current.cards.map((c) => (c.id === card.id ? { ...c, learned: target } : c)),
          }
        : current,
    );
    try {
      await markFlashcardLearned(card.id, target);
      if (target) toast.success("Marked as learned");
    } catch (error) {
      setActiveDeck((current) =>
        current
          ? {
              ...current,
              cards: current.cards.map((c) => (c.id === card.id ? { ...c, learned: !target } : c)),
            }
          : current,
      );
      toast.error("Could not save progress", { description: axiosErrorMessage(error) });
    }
  };

  const cards = activeDeck?.cards ?? [];
  const currentCard = cards.length > 0 ? cards[Math.min(cardIndex, cards.length - 1)] : null;
  const learnedCount = cards.filter((c) => c.learned).length;

  const deckLectureTitles = (deck: FlashcardDeck) => {
    const names = deck.materialIds
      .map((id) => materials.find((m) => m.id === id)?.fileName)
      .filter((name): name is string => Boolean(name));
    return names.length ? names.join(", ") : `${deck.materialIds.length} lecture(s)`;
  };

  const go = (dir: number) => {
    if (!cards.length) return;
    setFlipped(false);
    setCardIndex((i) => (i + dir + cards.length) % cards.length);
  };

  const difficultyTone = (difficulty: FlashcardDifficulty) =>
    difficulty === "EASY"
      ? "bg-success/15 text-success"
      : difficulty === "MEDIUM"
        ? "bg-warning/25 text-warning-foreground"
        : "bg-destructive/10 text-destructive";

  const difficultyLabel = (difficulty: FlashcardDifficulty) =>
    difficulty === "EASY" ? "Easy" : difficulty === "MEDIUM" ? "Medium" : "Hard";

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border-border p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Lecture materials</h2>
            <p className="text-sm text-muted-foreground">
              Choose one or more ready lectures to create revision flashcards.
            </p>
          </div>
          <Button onClick={handleGenerate} disabled={generating || !selectedMaterialIds.length}>
            {generating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Layers className="size-4" />
            )}
            {generating ? "Generating..." : "Generate Flashcards"}
          </Button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {materials.length === 0 ? (
            <p className="text-sm text-muted-foreground">Upload a lecture to begin.</p>
          ) : (
            materials.map((material) => {
              const selected = selectedMaterialIds.includes(material.id);
              const ready = material.status === "READY";
              return (
                <button
                  type="button"
                  key={material.id}
                  disabled={!ready}
                  onClick={() => toggleMaterial(material.id)}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-4 text-left transition",
                    selected
                      ? "border-primary bg-primary-soft/60"
                      : "border-border bg-white hover:border-primary/50",
                    !ready && "cursor-not-allowed opacity-50",
                  )}
                >
                  <FileText className="mt-0.5 size-5 shrink-0 text-primary" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {material.fileName}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {material.fileType} · Uploaded {formatUploadDate(material.uploadedAt)} ·{" "}
                      {formatMaterialStatus(material.status)}
                    </span>
                  </span>
                  {selected && <CheckCircle2 className="size-5 shrink-0 text-primary" />}
                </button>
              );
            })
          )}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Selected: {selectedMaterialIds.length} lecture(s)
        </p>
      </Card>

      {loading ? (
        <Skeleton className="h-48 rounded-2xl" />
      ) : decks.length === 0 ? (
        <Card className="rounded-2xl border-dashed p-10 text-center shadow-soft">
          <Layers className="mx-auto size-8 text-primary" />
          <h3 className="mt-3 font-semibold">No flashcards generated yet.</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Select lecture materials and generate your first flashcard deck.
          </p>
          <Button className="mt-5 rounded-xl" onClick={handleGenerate} disabled={generating}>
            {generating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Layers className="size-4" />
            )}
            {generating ? "Generating..." : "Generate Flashcards"}
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
          <Card className="h-fit rounded-2xl border-border p-3 shadow-soft">
            <p className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Previous decks
            </p>
            <div className="space-y-1">
              {decks.map((deck) => (
                <div
                  key={deck.id}
                  className={cn(
                    "group flex items-start gap-1 rounded-xl p-1.5 transition-colors",
                    activeDeck?.deck.id === deck.id ? "bg-primary-soft" : "hover:bg-muted",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => openDeck(deck.id)}
                    className="min-w-0 flex-1 rounded-lg p-1.5 text-left"
                  >
                    <span className="block truncate text-sm font-semibold">{deck.title}</span>
                    <span className="mt-1 block truncate text-xs text-muted-foreground">
                      {deck.cardCount} cards · {formatTimestamp(deck.createdAt)}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                      {deckLectureTitles(deck)}
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${deck.title}`}
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                    disabled={deletingId === deck.id}
                    onClick={() => handleDelete(deck.id)}
                  >
                    {deletingId === deck.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {activeDeck && currentCard ? (
            <Card className="gap-0 rounded-2xl border-border p-6 shadow-soft">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{activeDeck.deck.title}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {deckLectureTitles(activeDeck.deck)}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
                    difficultyTone(currentCard.difficulty),
                  )}
                >
                  {difficultyLabel(currentCard.difficulty)}
                </span>
              </div>

              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-semibold">
                    {learnedCount} / {cards.length} Learned
                  </span>
                  <span className="text-muted-foreground">
                    {cards.length - learnedCount} remaining
                  </span>
                </div>
                <Progress
                  value={cards.length > 0 ? (learnedCount / cards.length) * 100 : 0}
                  className="h-2"
                />
              </div>

              <p className="mt-5 text-sm font-semibold">
                Card {cardIndex + 1} of {cards.length}
              </p>

              <div className="mt-4 [perspective:1400px]">
                <button
                  onClick={() => setFlipped((f) => !f)}
                  className="relative block h-[280px] w-full flip-3d text-left"
                  style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
                  aria-label="Flip flashcard"
                >
                  <div className="absolute inset-0 grid place-items-center rounded-2xl border border-border bg-card p-8 text-center shadow-soft backface-hidden">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        Question
                      </p>
                      <p className="mt-3 font-display text-xl font-semibold">
                        {currentCard.question}
                      </p>
                      <p className="mt-6 text-xs text-muted-foreground">
                        Click to reveal the answer
                      </p>
                    </div>
                  </div>
                  <div
                    className="absolute inset-0 grid place-items-center rounded-2xl gradient-brand p-8 text-center text-primary-foreground shadow-soft backface-hidden"
                    style={{ transform: "rotateY(180deg)" }}
                  >
                    <div>
                      <p className="text-xs uppercase tracking-wider text-primary-foreground/70">
                        Answer
                      </p>
                      <p className="mt-3 text-base leading-relaxed">{currentCard.answer}</p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="mt-6 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                <Button variant="outline" className="rounded-xl" onClick={() => go(-1)}>
                  <ChevronLeft className="size-4" /> Previous
                </Button>
                <Button
                  variant={currentCard.learned ? "secondary" : "default"}
                  className="rounded-xl"
                  onClick={() => toggleLearned(currentCard)}
                >
                  <CheckCircle2 className="size-4" />
                  {currentCard.learned ? "Learned" : "Mark as learned"}
                </Button>
                <Button variant="outline" className="rounded-xl" onClick={() => go(1)}>
                  Next <ChevronRight className="size-4" />
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="rounded-2xl border-dashed p-10 text-center shadow-soft">
              <p className="text-sm text-muted-foreground">Select a deck to view its flashcards.</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

/* ----------------------------------- Quiz --------------------------------- */

const QUIZ_COUNT_OPTIONS = [5, 10, 15, 20] as const;

function QuizTab({
  materials,
  selectedMaterialIds,
  onSelectMaterials,
}: {
  materials: LearningMaterial[];
  selectedMaterialIds: number[];
  onSelectMaterials: (ids: number[]) => void;
}) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<QuizDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(10);

  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [phase, setPhase] = useState<"overview" | "taking" | "result">("overview");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [chosen, setChosen] = useState<QuizOption | null>(null);
  const [lastAttempt, setLastAttempt] = useState<{ score: number; total: number } | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    let active = true;
    getQuizzes()
      .then((loaded) => {
        if (!active) return;
        setQuizzes(loaded);
      })
      .catch((error) =>
        toast.error("Could not load quizzes", { description: axiosErrorMessage(error) }),
      )
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const toggleMaterial = (id: number) =>
    onSelectMaterials(
      selectedMaterialIds.includes(id)
        ? selectedMaterialIds.filter((selectedId) => selectedId !== id)
        : [...selectedMaterialIds, id],
    );

  const quizMaterialsTitle = (quiz: Quiz) => {
    const names = quiz.materialIds
      .map((id) => materials.find((m) => m.id === id)?.fileName)
      .filter((name): name is string => Boolean(name));
    return names.length ? names.join(", ") : `${quiz.materialIds.length} lecture(s)`;
  };

  const handleGenerate = async () => {
    if (!selectedMaterialIds.length) {
      toast.error("Select at least one ready lecture");
      return;
    }
    setGenerating(true);
    try {
      const detail = await generateQuiz(selectedMaterialIds, questionCount);
      setQuizzes((current) => [detail.quiz, ...current.filter((q) => q.id !== detail.quiz.id)]);
      setActiveQuiz(detail);
      setPhase("overview");
      setCurrentIndex(0);
      setChosen(null);
      setResult(null);
      setAttemptId(null);
      setLastAttempt(null);
      toast.success("Quiz generated");
    } catch (error) {
      toast.error("Could not generate quiz", { description: axiosErrorMessage(error) });
    } finally {
      setGenerating(false);
    }
  };

  const openQuiz = async (quizId: number) => {
    try {
      const detail = await getQuiz(quizId);
      setActiveQuiz(detail);
      setPhase("overview");
      setCurrentIndex(0);
      setChosen(null);
      setResult(null);
      setAttemptId(null);
      const attempts = await getQuizAttempts(quizId);
      const completed = attempts.find((attempt) => attempt.completedAt);
      setLastAttempt(
        completed ? { score: completed.score, total: completed.totalQuestions } : null,
      );
    } catch (error) {
      toast.error("Could not load quiz", { description: axiosErrorMessage(error) });
    }
  };

  const handleDelete = async (quizId: number) => {
    setDeletingId(quizId);
    try {
      await deleteQuiz(quizId);
      setQuizzes((current) => current.filter((q) => q.id !== quizId));
      if (activeQuiz?.quiz.id === quizId) {
        setActiveQuiz(null);
        setPhase("overview");
        setResult(null);
      }
      toast.success("Quiz deleted");
    } catch (error) {
      toast.error("Could not delete quiz", { description: axiosErrorMessage(error) });
    } finally {
      setDeletingId(null);
    }
  };

  const handleStart = async () => {
    if (!activeQuiz) return;
    try {
      const started = await startQuizAttempt(activeQuiz.quiz.id);
      setAttemptId(started.attemptId);
      setCurrentIndex(0);
      setChosen(null);
      setResult(null);
      setPhase("taking");
    } catch (error) {
      toast.error("Could not start quiz", { description: axiosErrorMessage(error) });
    }
  };

  const handleChoose = async (option: QuizOption) => {
    if (!activeQuiz || attemptId === null || chosen !== null) return;
    const question = activeQuiz.questions[currentIndex];
    setChosen(option);
    try {
      await submitAnswer(attemptId, question.id, option);
    } catch (error) {
      toast.error("Could not save your answer", { description: axiosErrorMessage(error) });
    }
  };

  const handleNext = async () => {
    if (!activeQuiz) return;
    if (currentIndex + 1 >= activeQuiz.questions.length) {
      if (attemptId === null) return;
      setFinishing(true);
      try {
        const finished = await completeQuizAttempt(attemptId);
        setResult(finished);
        setLastAttempt({ score: finished.score, total: finished.totalQuestions });
        setPhase("result");
      } catch (error) {
        toast.error("Could not finish quiz", { description: axiosErrorMessage(error) });
      } finally {
        setFinishing(false);
      }
    } else {
      setCurrentIndex((i) => i + 1);
      setChosen(null);
    }
  };

  const questions = activeQuiz?.questions ?? [];
  const currentQuestion = questions[currentIndex];
  const revealed = chosen !== null;
  const isLast = currentIndex + 1 >= questions.length;

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border-border p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Lecture materials</h2>
            <p className="text-sm text-muted-foreground">
              Choose one or more ready lectures to generate a multiple-choice quiz.
            </p>
          </div>
          <Button onClick={handleGenerate} disabled={generating || !selectedMaterialIds.length}>
            {generating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ListChecks className="size-4" />
            )}
            {generating ? "Generating..." : "Generate Quiz"}
          </Button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {materials.length === 0 ? (
            <p className="text-sm text-muted-foreground">Upload a lecture to begin.</p>
          ) : (
            materials.map((material) => {
              const selected = selectedMaterialIds.includes(material.id);
              const ready = material.status === "READY";
              return (
                <button
                  type="button"
                  key={material.id}
                  disabled={!ready}
                  onClick={() => toggleMaterial(material.id)}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-4 text-left transition",
                    selected
                      ? "border-primary bg-primary-soft/60"
                      : "border-border bg-white hover:border-primary/50",
                    !ready && "cursor-not-allowed opacity-50",
                  )}
                >
                  <FileText className="mt-0.5 size-5 shrink-0 text-primary" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {material.fileName}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {material.fileType} · Uploaded {formatUploadDate(material.uploadedAt)} ·{" "}
                      {formatMaterialStatus(material.status)}
                    </span>
                  </span>
                  {selected && <CheckCircle2 className="size-5 shrink-0 text-primary" />}
                </button>
              );
            })
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Questions
          </span>
          {QUIZ_COUNT_OPTIONS.map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => setQuestionCount(count)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                questionCount === count
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-white text-muted-foreground hover:border-primary/40",
              )}
            >
              {count}
            </button>
          ))}
        </div>
      </Card>

      {loading ? (
        <Skeleton className="h-48 rounded-2xl" />
      ) : quizzes.length === 0 ? (
        <Card className="rounded-2xl border-dashed p-10 text-center shadow-soft">
          <ListChecks className="mx-auto size-8 text-primary" />
          <h3 className="mt-3 font-semibold">No quizzes generated yet.</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Select lecture materials and generate your first quiz.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
          <Card className="h-fit rounded-2xl border-border p-3 shadow-soft">
            <p className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Previous quizzes
            </p>
            <div className="space-y-1">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className={cn(
                    "group flex items-start gap-1 rounded-xl p-1.5 transition-colors",
                    activeQuiz?.quiz.id === quiz.id ? "bg-primary-soft" : "hover:bg-muted",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => openQuiz(quiz.id)}
                    className="min-w-0 flex-1 rounded-lg p-1.5 text-left"
                  >
                    <span className="block truncate text-sm font-semibold">{quiz.title}</span>
                    <span className="mt-1 block truncate text-xs text-muted-foreground">
                      {quiz.questionCount} questions · {formatTimestamp(quiz.createdAt)}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                      {quizMaterialsTitle(quiz)}
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${quiz.title}`}
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                    disabled={deletingId === quiz.id}
                    onClick={() => handleDelete(quiz.id)}
                  >
                    {deletingId === quiz.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {!activeQuiz ? (
            <Card className="rounded-2xl border-dashed p-10 text-center shadow-soft">
              <p className="text-sm text-muted-foreground">
                Select a quiz to take it, or generate a new one above.
              </p>
            </Card>
          ) : phase === "taking" && currentQuestion ? (
            <Card className="gap-0 rounded-2xl border-border p-6 shadow-soft">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <p className="text-sm font-semibold">
                  Question {currentIndex + 1} of {questions.length}
                </p>
                <Badge variant="secondary" className="shrink-0 rounded-full">
                  {questions.length - (currentIndex + 1)} remaining
                </Badge>
              </div>
              <Progress
                value={((currentIndex + 1) / questions.length) * 100}
                className="mt-3 h-2"
              />

              <h3 className="mt-6 font-display text-lg font-semibold">
                {currentQuestion.question}
              </h3>

              <div className="mt-5 space-y-2.5">
                {currentQuestion.options.map((option, i) => {
                  const label = String.fromCharCode(65 + i) as QuizOption;
                  const isChosen = chosen === label;
                  const isCorrectOption = label === currentQuestion.correctOption;
                  return (
                    <button
                      key={label}
                      type="button"
                      disabled={revealed}
                      onClick={() => handleChoose(label)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border p-4 text-left text-sm transition-colors",
                        !revealed && "border-border hover:border-primary/40 hover:bg-muted",
                        revealed && isCorrectOption && "border-success bg-success/10",
                        revealed &&
                          isChosen &&
                          !isCorrectOption &&
                          "border-destructive bg-destructive/10",
                        revealed && !isChosen && !isCorrectOption && "border-border opacity-60",
                      )}
                    >
                      <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-muted text-xs font-bold">
                        {label}
                      </span>
                      {option}
                      {revealed && isCorrectOption && (
                        <CheckCircle2 className="ml-auto size-4 shrink-0 text-success" />
                      )}
                      {revealed && isChosen && !isCorrectOption && (
                        <X className="ml-auto size-4 shrink-0 text-destructive" />
                      )}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {revealed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-5 overflow-hidden"
                  >
                    <div className="rounded-xl bg-primary-soft/60 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                        Explanation
                      </p>
                      <p className="mt-1.5 text-sm text-muted-foreground">
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {revealed && (
                <Button
                  className="mt-6 w-full rounded-xl"
                  onClick={handleNext}
                  disabled={finishing}
                >
                  {finishing && <Loader2 className="size-4 animate-spin" />}
                  {isLast ? (finishing ? "Finishing..." : "Finish Quiz") : "Next Question"}
                  {!finishing && <ChevronRight className="size-4" />}
                </Button>
              )}
            </Card>
          ) : phase === "result" && result ? (
            <Card className="gap-0 rounded-2xl border-border p-6 shadow-soft">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Quiz complete</p>
                <p className="mt-2 font-display text-5xl font-bold text-primary">
                  {result.totalQuestions > 0
                    ? Math.round((result.score / result.totalQuestions) * 100)
                    : 0}
                  %
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {result.score} of {result.totalQuestions} correct
                </p>
                <div className="mt-4 grid max-w-xs grid-cols-2 gap-3 mx-auto">
                  <div className="rounded-xl border border-success/40 bg-success/10 p-3">
                    <p className="text-2xl font-bold text-success">{result.correctCount}</p>
                    <p className="text-xs text-muted-foreground">Correct</p>
                  </div>
                  <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3">
                    <p className="text-2xl font-bold text-destructive">{result.incorrectCount}</p>
                    <p className="text-xs text-muted-foreground">Incorrect</p>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setPhase("overview")}
                  >
                    <RotateCcw className="size-4" /> Retake Quiz
                  </Button>
                  <Button
                    className="rounded-xl"
                    onClick={() => {
                      setActiveQuiz(null);
                      setResult(null);
                      setPhase("overview");
                    }}
                  >
                    Back to Quizzes
                  </Button>
                </div>
              </div>

              <div className="mt-8 space-y-3 text-left">
                {result.review.map((item) => (
                  <div key={item.questionId} className="rounded-xl border border-border p-4">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                      <p className="text-sm font-semibold">{item.question}</p>
                      <Badge
                        className={cn(
                          "shrink-0 rounded-full",
                          item.correct ? "bg-success" : "bg-destructive",
                        )}
                      >
                        {item.correct ? "Correct" : "Missed"}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Your answer: {item.selectedOption ?? "Not answered"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Correct answer: {item.correctOption}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">{item.explanation}</p>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card className="gap-0 rounded-2xl border-border p-6 shadow-soft">
              <h2 className="text-lg font-semibold">{activeQuiz.quiz.title}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {activeQuiz.quiz.questionCount} questions · {quizMaterialsTitle(activeQuiz.quiz)} ·
                Created {formatTimestamp(activeQuiz.quiz.createdAt)}
              </p>
              {lastAttempt && (
                <div className="mt-4 rounded-xl bg-primary-soft/60 p-4 text-sm">
                  Last attempt:{" "}
                  <span className="font-semibold text-primary">
                    {lastAttempt.score} / {lastAttempt.total}
                  </span>
                </div>
              )}
              <Button className="mt-6 w-full rounded-xl" onClick={handleStart}>
                <ListChecks className="size-4" /> Start Quiz
              </Button>
            </Card>
          )}
        </div>
      )}
    </div>
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
            {correct} of {mockExam.length} questions correct · {45 - Math.floor(seconds / 60)} min
            used
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
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="topic"
                  tick={{ fontSize: 11 }}
                  stroke="var(--color-muted-foreground)"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="var(--color-muted-foreground)"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-card)",
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="score"
                  fill="var(--color-primary)"
                  radius={[8, 8, 0, 0]}
                  animationDuration={900}
                />
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
            <p className="truncate text-sm font-semibold">Semester IV — Mock Exam A</p>
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
                answers[index] === i
                  ? "border-primary bg-primary-soft"
                  : "border-border hover:bg-muted",
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
          <Button
            variant="outline"
            className="rounded-xl"
            disabled={index === 0}
            onClick={() => setIndex((i) => i - 1)}
          >
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
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Question palette
        </h3>
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
        <Progress
          value={(Object.keys(answers).length / mockExam.length) * 100}
          className="mt-2 h-1.5"
        />
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
