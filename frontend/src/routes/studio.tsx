import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
  MessageSquarePlus,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { formatDateTime12, formatTime12 } from "@/lib/date";
import { getLectureTitle } from "@/lib/studio";
import {
  createChatSession,
  deleteChatSession,
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
import { deleteSummary, generateSummary, getSummaries, type GeneratedSummary } from "@/api/summaryApi";
import { deleteSmartNote, generateSmartNotes, getSmartNotes, type GeneratedSmartNote } from "@/api/smartNotesApi";
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
import { useAuth } from "@/context/AuthContext";
import { MarkdownContent } from "@/components/common/MarkdownContent";
import { cn } from "@/lib/utils";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "AI Learning Studio — Ma-Haw-Tha-Dar" },
      {
        name: "description",
        content:
          "Turn lecture materials into AI tutoring, summaries, smart notes, flashcards and quizzes.",
      },
      { property: "og:title", content: "AI Learning Studio — Ma-Haw-Tha-Dar" },
      {
        property: "og:description",
        content: "Your AI-powered study workspace for university lectures and revision.",
      },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <StudioPage />
    </ProtectedRoute>
  ),
});

function axiosErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ error?: string; message?: string }>(error)) {
    return error.response?.data?.error ?? error.response?.data?.message ?? error.message;
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
  return formatTime12(date);
}

function StudioPage() {
  const { student, token } = useAuth();
  return <StudioContent key={student?.email || token || "guest"} />;
}

function StudioContent() {
  const { student, token } = useAuth();
  const [activeTab, setActiveTab] = useState("tutor");
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<number[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const refreshDashboard = () => void queryClient.invalidateQueries({ queryKey: ["dashboard"] });

  useEffect(() => {
    if (!token) {
      setMaterials([]);
      setMaterialsLoading(false);
      return;
    }
    setMaterialsLoading(true);
    getMaterials()
      .then(setMaterials)
      .catch(() =>
        toast.error("Could not load learning materials", { description: "Please try again." }),
      )
      .finally(() => setMaterialsLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token) {
      setSessions([]);
      setSelectedSessionId(null);
      setSessionsLoading(false);
      return;
    }
    setSessionsLoading(true);
    getChatSessions() 
      .then((loadedSessions) => {
        setSessions(loadedSessions);
        setSelectedSessionId(loadedSessions[0]?.id ?? null);
      })
      .catch(() => toast.error("Could not load chat history", { description: "Please try again." }))
      .finally(() => setSessionsLoading(false));
  }, [token]);

  useEffect(() => {
    setSelectedMaterialIds([]);
  }, [token]);

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const material = await uploadMaterial(file);
      setMaterials((current) => [material, ...current]);
      toast.success("Material uploaded", { description: file.name });
      refreshDashboard();
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

  const handleDeleteSession = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await deleteChatSession(id);
      setSessions((current) => current.filter((s) => s.id !== id));
      if (selectedSessionId === id) {
        setSelectedSessionId(sessions.find((s) => s.id !== id)?.id ?? null);
      }
      toast.success("Chat deleted");
    } catch (error) {
      toast.error("Could not delete chat", { description: axiosErrorMessage(error) });
    }
  };

  const selectedSession = sessions.find((session) => session.id === selectedSessionId) ?? null;

  useEffect(() => {
    if (selectedSession) setSelectedMaterialIds(selectedSession.materialIds);
  }, [selectedSession]);

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
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Learning materials
              </h2>
              {selectedMaterialIds.length > 0 && (
                <Badge variant="secondary" className="text-[10px] font-semibold">
                  {selectedMaterialIds.length} selected
                </Badge>
              )}
            </div>
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
              <div className="max-h-[260px] overflow-y-auto pr-1">
                <ul className="space-y-2">
                  {materials.map((material) => {
                    const isSelected = selectedMaterialIds.includes(material.id);
                    const isReady = material.status === "READY";
                    return (
                      <li
                        key={material.id}
                        className={cn(
                          "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 rounded-xl border p-1 transition-colors",
                          isSelected
                            ? "border-primary/40 bg-primary-soft"
                            : "border-border",
                          !isReady && "opacity-60",
                        )}
                      >
                        <button
                          type="button"
                          className={cn(
                            "min-w-0 rounded-lg p-2 text-left hover:bg-muted/60",
                            !isReady && "cursor-not-allowed",
                          )}
                          disabled={!isReady}
                          onClick={() =>
                            setSelectedMaterialIds((current) =>
                              current.includes(material.id)
                                ? current.filter((id) => id !== material.id)
                                : [...current, material.id],
                            )
                          }
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            <p className="truncate text-xs font-semibold">{material.fileName}</p>
                            {isSelected && (
                              <CheckCircle2 className="size-3.5 shrink-0 text-primary" />
                            )}
                          </div>
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
                    );
                  })}
                </ul>
              </div>
            )}
          </Card>

          {activeTab === "tutor" && (
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
              {sessionsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full rounded-xl" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              ) : sessions.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                  No chat history yet.
                </p>
              ) : (
                <div className="max-h-[300px] overflow-y-auto pr-1">
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
                            "group flex cursor-pointer items-start justify-between gap-2 rounded-xl p-2.5 transition-colors",
                            selectedSessionId === session.id
                              ? "bg-primary-soft border border-primary/30"
                              : "hover:bg-muted/60",
                          )}
                        >
                          <div className="flex min-w-0 items-start gap-2.5">
                            <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-accent/40 text-accent-foreground">
                              <Clock3 className="size-3.5" />
                            </span>

                            <div className="min-w-0">
                              <p className="truncate text-xs font-medium">{session.title}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {s.tool} · {s.when}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            aria-label={`Delete chat ${session.title}`}
                            className="rounded-lg p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                            onClick={(e) => handleDeleteSession(e, session.id)}
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </Card>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="min-w-0">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-xl p-1">
            {[
              { v: "tutor", l: "AI Tutor", i: Sparkles },
              { v: "summary", l: "Summary", i: FileText },
              { v: "notes", l: "Smart Notes", i: NotebookPen },
              { v: "flashcards", l: "Flashcards", i: Layers },
              { v: "quiz", l: "Quiz Generator", i: ListChecks },
            ].map((t) => (
              <TabsTrigger key={t.v} value={t.v} className="rounded-lg text-xs sm:text-sm">
                <t.i className="size-4" /> {t.l}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="tutor" className="mt-4">
            <TutorTab
              key={student?.email ?? "guest"}
              selectedMaterialIds={selectedMaterialIds}
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
            <SummaryTab
              key={student?.email ?? "guest"}
              materials={materials}
              selectedMaterialIds={selectedMaterialIds}
              onSelectMaterials={setSelectedMaterialIds}
            />
          </TabsContent>
          <TabsContent value="notes" className="mt-4">
            <NotesTab
              key={student?.email ?? "guest"}
              materials={materials}
              selectedMaterialIds={selectedMaterialIds}
              onSelectMaterials={setSelectedMaterialIds}
            />
          </TabsContent>
          <TabsContent value="flashcards" className="mt-4">
            <FlashcardsTab
              key={student?.email ?? "guest"}
              materials={materials}
              selectedMaterialIds={selectedMaterialIds}
              onSelectMaterials={setSelectedMaterialIds}
            />
          </TabsContent>
          <TabsContent value="quiz" className="mt-4">
            <QuizTab
              key={student?.email ?? "guest"}
              materials={materials}
              selectedMaterialIds={selectedMaterialIds}
              onSelectMaterials={setSelectedMaterialIds}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

/* ---------------------------------- Tutor --------------------------------- */

function TutorTab({
  selectedMaterialIds,
  session,
  onEnsureSession,
}: {
  selectedMaterialIds: number[];
  session: ChatSession | null;
  onEnsureSession: () => Promise<number>;
}) {
  const { student } = useAuth();
  const userInitials = student?.avatarInitials ?? (student?.name ? student.name.slice(0, 2).toUpperCase() : "ME");
  const [messages, setMessages] = useState<ChatHistoryMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const activeSessionId = session?.id;

  useEffect(() => {
    if (!activeSessionId) {
      setMessages([]);
      return;
    }
    setHistoryLoading(true);
    getChatMessages(activeSessionId)
      .then(setMessages)
      .catch(() => toast.error("Could not load conversation", { description: "Please try again." }))
      .finally(() => setHistoryLoading(false));
  }, [activeSessionId]);

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
                    {m.role === "ASSISTANT" ? "AI" : userInitials}
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
                    {m.role === "ASSISTANT" ? (
                      <MarkdownContent content={m.content} />
                    ) : (
                      m.content
                    )}
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
            disabled={typing || !input.trim()}
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
  const { token } = useAuth();
  const [summaries, setSummaries] = useState<GeneratedSummary[]>([]);
  const [activeSummary, setActiveSummary] = useState<GeneratedSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) {
      setSummaries([]);
      setActiveSummary(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    getSummaries()
      .then((loaded) => {
        setSummaries(loaded);
        setActiveSummary(loaded[0] ?? null);
      })
      .catch((error) => toast.error("Could not load summaries", { description: axiosErrorMessage(error) }))
      .finally(() => setLoading(false));
  }, [token]);

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
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    } catch (error) {
      toast.error("Could not generate summary", { description: axiosErrorMessage(error) });
    } finally { setGenerating(false); }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await deleteSummary(id);
      setSummaries((current) => {
        const next = current.filter((s) => s.id !== id);
        if (activeSummary?.id === id) {
          setActiveSummary(next[0] ?? null);
        }
        return next;
      });
      toast.success("Summary deleted");
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    } catch (error) {
      toast.error("Could not delete summary", { description: axiosErrorMessage(error) });
    }
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
        <div className="mt-4 grid max-h-[280px] gap-3 overflow-y-auto pr-1 md:grid-cols-2">
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
        <Card className="rounded-2xl border-border p-3 shadow-soft">
          <p className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Previous summaries</p>
          <div className="space-y-1">
            {summaries.map((summary) => {
              const title = getLectureTitle(summary.materialIds, materials, summary.title);
              return (
                <div
                  key={summary.id}
                  className={cn(
                    "group flex items-center justify-between gap-1 rounded-xl pr-1 text-sm transition",
                    activeSummary?.id === summary.id ? "bg-primary-soft font-semibold text-primary" : "hover:bg-muted",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setActiveSummary(summary)}
                    className="min-w-0 flex-1 p-3 text-left"
                  >
                    <span className="block truncate text-sm font-semibold">{title}</span>
                    <span className="mt-1 block text-xs font-normal text-muted-foreground">
                      Summary · {formatDateTime12(summary.createdAt)}
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${title}`}
                    onClick={(e) => handleDelete(e, summary.id)}
                    className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </Card>
        {activeSummary && (
          <Card className="rounded-2xl border-border p-5 shadow-soft">
            <h2 className="text-lg font-semibold">
              {getLectureTitle(activeSummary.materialIds, materials, activeSummary.title)}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Summary · {activeSummary.materialIds.length} lecture(s) · {formatDateTime12(activeSummary.createdAt)}
            </p>
            <div className="mt-5 text-sm leading-7 text-foreground">
              <MarkdownContent content={activeSummary.content} />
            </div>
          </Card>
        )}
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
  const { token } = useAuth();
  const [notes, setNotes] = useState<GeneratedSmartNote[]>([]);
  const [activeNote, setActiveNote] = useState<GeneratedSmartNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) {
      setNotes([]);
      setActiveNote(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    getSmartNotes()
      .then((loaded) => {
        setNotes(loaded);
        setActiveNote(loaded[0] ?? null);
      })
      .catch((error) => toast.error("Could not load smart notes", { description: axiosErrorMessage(error) }))
      .finally(() => setLoading(false));
  }, [token]);

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
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    } catch (error) {
      toast.error("Could not generate smart notes", { description: axiosErrorMessage(error) });
    } finally { setGenerating(false); }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await deleteSmartNote(id);
      setNotes((current) => {
        const next = current.filter((n) => n.id !== id);
        if (activeNote?.id === id) {
          setActiveNote(next[0] ?? null);
        }
        return next;
      });
      toast.success("Smart note deleted");
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    } catch (error) {
      toast.error("Could not delete smart note", { description: axiosErrorMessage(error) });
    }
  };

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border-border p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="font-semibold">Lecture materials</h2><p className="text-sm text-muted-foreground">Choose one or more ready lectures for concise revision notes.</p></div>
          <Button onClick={handleGenerate} disabled={generating || !selectedMaterialIds.length}>
            {generating ? <Loader2 className="size-4 animate-spin" /> : <NotebookPen className="size-4" />}
            {generating ? "Generating..." : "Generate Notes"}
          </Button>
        </div>
        <div className="mt-4 grid max-h-[280px] gap-3 overflow-y-auto pr-1 md:grid-cols-2">
          {materials.length === 0 ? <p className="text-sm text-muted-foreground">Upload a lecture to begin.</p> : materials.map((material) => {
            const selected = selectedMaterialIds.includes(material.id); const ready = material.status === "READY";
            return <button type="button" key={material.id} disabled={!ready} onClick={() => toggleMaterial(material.id)} className={cn("flex items-start gap-3 rounded-xl border p-4 text-left transition", selected ? "border-primary bg-primary-soft/60" : "border-border bg-white hover:border-primary/50", !ready && "cursor-not-allowed opacity-50")}><FileText className="mt-0.5 size-5 shrink-0 text-primary" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{material.fileName}</span><span className="mt-1 block text-xs text-muted-foreground">{material.fileType} · Uploaded {formatUploadDate(material.uploadedAt)} · {formatMaterialStatus(material.status)}</span></span>{selected && <CheckCircle2 className="size-5 shrink-0 text-primary" />}</button>;
          })}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Selected: {selectedMaterialIds.length} lecture(s)</p>
      </Card>
      {loading ? <Skeleton className="h-48 rounded-2xl" /> : !notes.length ? (
        <Card className="rounded-2xl border-dashed p-10 text-center shadow-soft"><NotebookPen className="mx-auto size-8 text-primary" /><h3 className="mt-3 font-semibold">No smart notes yet</h3><p className="mt-1 text-sm text-muted-foreground">Select lecture materials and generate your first revision notes.</p></Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
          <Card className="rounded-2xl border-border p-3 shadow-soft">
            <p className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Previous notes</p>
            <div className="space-y-1">
              {notes.map((note) => {
                const title = getLectureTitle(note.materialIds, materials, note.title);
                return (
                  <div
                    key={note.id}
                    className={cn(
                      "group flex items-center justify-between gap-1 rounded-xl pr-1 text-sm transition",
                      activeNote?.id === note.id ? "bg-primary-soft font-semibold text-primary" : "hover:bg-muted",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveNote(note)}
                      className="min-w-0 flex-1 p-3 text-left"
                    >
                      <span className="block truncate text-sm font-semibold">{title}</span>
                      <span className="mt-1 block text-xs font-normal text-muted-foreground">
                        Smart Notes · {formatDateTime12(note.createdAt)}
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${title}`}
                      onClick={(e) => handleDelete(e, note.id)}
                      className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>
          {activeNote && (
            <Card className="rounded-2xl border-border p-5 shadow-soft">
              <h2 className="text-lg font-semibold">
                {getLectureTitle(activeNote.materialIds, materials, activeNote.title)}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Smart Notes · {activeNote.materialIds.length} lecture(s) · {formatDateTime12(activeNote.createdAt)}
              </p>
              <div className="mt-5 text-sm leading-7 text-foreground">
                <MarkdownContent content={activeNote.content} />
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

/* --------------------------------- Flashcards ------------------------------ */

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
  const { token } = useAuth();
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [activeDeck, setActiveDeck] = useState<FlashcardDeckDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const refreshDashboard = () => void queryClient.invalidateQueries({ queryKey: ["dashboard"] });

  useEffect(() => {
    if (!token) {
      setDecks([]);
      setActiveDeck(null);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
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
  }, [token]);

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
      refreshDashboard();
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
      refreshDashboard();
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
        <div className="mt-4 grid max-h-[280px] gap-3 overflow-y-auto pr-1 md:grid-cols-2">
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
              {decks.map((deck) => {
                const title = getLectureTitle(deck.materialIds, materials, deck.title);
                return (
                  <div
                    key={deck.id}
                    className={cn(
                      "group flex items-start gap-1 rounded-xl p-1.5 transition-colors",
                      activeDeck?.deck.id === deck.id ? "bg-primary-soft font-semibold text-primary" : "hover:bg-muted",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => openDeck(deck.id)}
                      className="min-w-0 flex-1 rounded-lg p-1.5 text-left"
                    >
                      <span className="block truncate text-sm font-semibold">{title}</span>
                      <span className="mt-1 block truncate text-xs font-normal text-muted-foreground">
                        Flashcards · {deck.cardCount} cards · {formatDateTime12(deck.createdAt)}
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${title}`}
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
                );
              })}
            </div>
          </Card>

          {activeDeck && currentCard ? (
            <Card className="gap-0 rounded-2xl border-border p-6 shadow-soft">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {getLectureTitle(activeDeck.deck.materialIds, materials, activeDeck.deck.title)}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    Flashcards · {activeDeck.cards.length} cards · {formatDateTime12(activeDeck.deck.createdAt)}
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
  const { token } = useAuth();
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
  const queryClient = useQueryClient();

  const refreshDashboard = () => void queryClient.invalidateQueries({ queryKey: ["dashboard"] });

  useEffect(() => {
    if (!token) {
      setQuizzes([]);
      setActiveQuiz(null);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
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
  }, [token]);

  const toggleMaterial = (id: number) =>
    onSelectMaterials(
      selectedMaterialIds.includes(id)
        ? selectedMaterialIds.filter((selectedId) => selectedId !== id)
        : [...selectedMaterialIds, id],
    );

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
        refreshDashboard();
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
        <div className="mt-4 grid max-h-[280px] gap-3 overflow-y-auto pr-1 md:grid-cols-2">
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
              {quizzes.map((quiz) => {
                const title = getLectureTitle(quiz.materialIds, materials, quiz.title);
                return (
                  <div
                    key={quiz.id}
                    className={cn(
                      "group flex items-start gap-1 rounded-xl p-1.5 transition-colors",
                      activeQuiz?.quiz.id === quiz.id ? "bg-primary-soft font-semibold text-primary" : "hover:bg-muted",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => openQuiz(quiz.id)}
                      className="min-w-0 flex-1 rounded-lg p-1.5 text-left"
                    >
                      <span className="block truncate text-sm font-semibold">{title}</span>
                      <span className="mt-1 block truncate text-xs font-normal text-muted-foreground">
                        Quiz · {quiz.questionCount} questions · {formatDateTime12(quiz.createdAt)}
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${title}`}
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
                );
              })}
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
                      <div className="mt-1.5 text-sm text-muted-foreground">
                        <MarkdownContent content={currentQuestion.explanation} />
                      </div>
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
                    <div className="mt-2 text-xs text-muted-foreground"><MarkdownContent content={item.explanation} /></div>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card className="gap-0 rounded-2xl border-border p-6 shadow-soft">
              <h2 className="text-lg font-semibold">
                {getLectureTitle(activeQuiz.quiz.materialIds, materials, activeQuiz.quiz.title)}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Quiz · {activeQuiz.questions.length} questions · {formatDateTime12(activeQuiz.quiz.createdAt)}
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

