import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  MapPin,
  CalendarDays,
  Plus,
  Search,
  Loader2,
  Pencil,
  Trash2,
  Send,
  CheckCircle2,
  XCircle,
  ImagePlus,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { DatePickerField } from "@/components/common/DatePicker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/common/Primitives";
import {
  acceptClaim,
  browseLostFound,
  createLostFoundReport,
  deleteLostFoundReport,
  getClaim,
  getClaimMessages,
  getClaimsForPost,
  getMyClaims,
  getMyReports,
  markReturned,
  rejectClaim,
  sendClaimMessage,
  submitClaim,
  updateLostFoundReport,
  type ClaimMessage,
  type LostFoundClaim,
  type LostFoundPost,
} from "@/api/lostFoundApi";
import { formatDateTime12, formatTime12 } from "@/lib/date";
import { cn } from "@/lib/utils";

export type LostFoundSearch = {
  tab?: "lost" | "found" | "report" | "activity";
  claimId?: number;
  postId?: number;
};

export const Route = createFileRoute("/lost-found")({
  validateSearch: (search: Record<string, unknown>): LostFoundSearch => {
    return {
      tab:
        search.tab === "lost" ||
        search.tab === "found" ||
        search.tab === "report" ||
        search.tab === "activity"
          ? (search.tab as LostFoundSearch["tab"])
          : undefined,
      claimId:
        typeof search.claimId === "number"
          ? search.claimId
          : typeof search.claimId === "string" && !Number.isNaN(Number(search.claimId))
            ? Number(search.claimId)
            : undefined,
      postId:
        typeof search.postId === "number"
          ? search.postId
          : typeof search.postId === "string" && !Number.isNaN(Number(search.postId))
            ? Number(search.postId)
            : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Campus Lost & Found — Ma-Haw-Tha-Dar" },
      {
        name: "description",
        content:
          "Report and browse lost or found items across campus, with real claims and conversations.",
      },
      { property: "og:title", content: "Campus Lost & Found — Ma-Haw-Tha-Dar" },
      {
        property: "og:description",
        content: "A modern lost and found board for university students.",
      },
    ],
  }),
  component: LostFoundPage,
});

const lostFoundCategories = ["All", "Electronics", "Documents", "Academic", "Personal", "Clothing"];

const assetUrl = (path: string | null) => (path ? `http://localhost:8080${path}` : undefined);

function formatDate(value: string | null) {
  if (!value) return "Date unknown";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function TypeBadge({ type }: { type: "LOST" | "FOUND" }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur",
        type === "LOST" ? "bg-destructive/10 text-destructive" : "bg-primary-soft text-primary",
      )}
    >
      {type === "LOST" ? "Lost" : "Found"}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "ACTIVE"
      ? "bg-success/15 text-success"
      : status === "CLAIMED"
        ? "bg-warning/25 text-warning-foreground"
        : "bg-muted text-muted-foreground";
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", tone)}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function ReporterAvatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const initials =
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "ST";
  return (
    <Avatar className="size-5">
      {avatarUrl && <AvatarImage src={assetUrl(avatarUrl)} alt={`${name} profile`} />}
      <AvatarFallback className="gradient-brand text-[9px] font-bold text-primary-foreground">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

function ItemCard({
  item,
  index,
  onClaim,
  onEdit,
  onDelete,
  onMarkReturned,
}: {
  item: LostFoundPost;
  index: number;
  onClaim: (item: LostFoundPost) => void;
  onEdit: (item: LostFoundPost) => void;
  onDelete: (item: LostFoundPost) => void;
  onMarkReturned: (item: LostFoundPost) => void;
}) {
  const canClaim = !item.isOwner && item.status === "ACTIVE";
  const canManage = item.isOwner;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card className="hover-lift group gap-0 overflow-hidden rounded-2xl border-border p-0 shadow-soft">
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {item.imageUrl ? (
            <img
              src={assetUrl(item.imageUrl)}
              alt={item.title}
              loading="lazy"
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <ImagePlus className="size-8" />
            </div>
          )}
          <span className="absolute left-3 top-3">
            <TypeBadge type={item.type} />
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
              <CalendarDays className="size-3.5 shrink-0" /> {formatDate(item.dateOccurred)}
            </p>
            <p className="flex items-center gap-1.5 truncate">
              <ReporterAvatar name={item.reporterName} avatarUrl={item.reporterAvatarUrl} />
              <span className="truncate">{item.reporterName}</span>
              <span className="ml-auto">
                <StatusBadge status={item.status} />
              </span>
            </p>
          </div>
          {canClaim ? (
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full rounded-xl"
              onClick={() => onClaim(item)}
            >
              {item.type === "LOST" ? "I found this" : "This is mine"}
            </Button>
          ) : canManage ? (
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => onEdit(item)}
              >
                <Pencil className="size-3.5" /> Edit
              </Button>
              {(item.status === "ACTIVE" || item.status === "CLAIMED") && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => onMarkReturned(item)}
                >
                  <CheckCircle2 className="size-3.5" /> Returned
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl text-destructive hover:text-destructive"
                onClick={() => onDelete(item)}
              >
                <Trash2 className="size-3.5" /> Delete
              </Button>
            </div>
          ) : (
            <div className="mt-4 flex items-center justify-center">
              <StatusBadge status={item.status} />
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

function ClaimModal({
  post,
  onClose,
  onSubmitted,
}: {
  post: LostFoundPost;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [message, setMessage] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!message.trim()) {
      toast.error("Describe how to identify the item", {
        description: "Help the reporter verify your claim.",
      });
      return;
    }
    setSubmitting(true);
    try {
      await submitClaim(post.id, message.trim(), details.trim() || undefined);
      toast.success("Claim submitted", {
        description: `The reporter of “${post.title}” has been notified.`,
      });
      onSubmitted();
      onClose();
    } catch {
      toast.error("Unable to submit claim", {
        description: "The item may no longer be claimable.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>Claim “{post.title}”</DialogTitle>
          <DialogDescription>
            Tell the reporter how to verify the item belongs to you. Your claim stays pending until
            they respond.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="claim-message">Identifying message</Label>
            <Textarea
              id="claim-message"
              rows={3}
              placeholder="e.g. My phone case has a scratch on the left corner and my initials inside."
              className="rounded-xl"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="claim-details">Additional details (optional)</Label>
            <Textarea
              id="claim-details"
              rows={2}
              placeholder="Serial number, contents, purchase date…"
              className="rounded-xl"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => void submit()} disabled={submitting}>
            {submitting ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Submit claim
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ConversationDialog({ claim, onClose }: { claim: LostFoundClaim; onClose: () => void }) {
  const { data: messages = [], refetch } = useQuery({
    queryKey: ["lost-found", "messages", claim.id],
    queryFn: () => getClaimMessages(claim.id),
    refetchInterval: 10_000,
  });
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await sendClaimMessage(claim.id, text.trim());
      setText("");
      await refetch();
    } catch {
      toast.error("Unable to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl rounded-2xl">
        <DialogHeader>
          <DialogTitle>Conversation · {claim.postTitle}</DialogTitle>
          <DialogDescription>
            Messages with the other party. They are stored and persist across refreshes.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[50vh] space-y-3 overflow-y-auto rounded-xl border border-border bg-muted/40 p-4">
          {messages.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              No messages yet. Say hello!
            </p>
          ) : (
            messages.map((message: ClaimMessage) => (
              <div key={message.id} className="flex items-start gap-2">
                <ReporterAvatar name={message.senderName} avatarUrl={message.senderAvatarUrl} />
                <div className="min-w-0 rounded-xl bg-card px-3 py-2 shadow-soft">
                  <p className="text-[11px] font-semibold text-primary">
                    {message.senderName} · {formatDateTime12(message.createdAt)}
                  </p>
                  <p className="mt-0.5 whitespace-pre-wrap text-sm">{message.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            placeholder="Write a message…"
            className="h-10 rounded-xl"
          />
          <Button
            size="icon"
            className="size-10 shrink-0 rounded-xl"
            onClick={() => void send()}
            disabled={sending || !text.trim()}
          >
            {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ClaimsDialog({
  post,
  onClose,
  onChanged,
}: {
  post: LostFoundPost;
  onClose: () => void;
  onChanged: () => void;
}) {
  const {
    data: claims = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["lost-found", "claims", post.id],
    queryFn: () => getClaimsForPost(post.id),
  });
  const [conversation, setConversation] = useState<LostFoundClaim | null>(null);

  const respond = async (claimId: number, action: "accept" | "reject") => {
    try {
      if (action === "accept") await acceptClaim(claimId);
      else await rejectClaim(claimId);
      toast.success(action === "accept" ? "Claim accepted" : "Claim rejected");
      await refetch();
      onChanged();
    } catch {
      toast.error("Unable to update the claim");
    }
  };

  return (
    <>
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Claims · {post.title}</DialogTitle>
            <DialogDescription>
              Review claims on your report. Accepting one opens a conversation.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[50vh] space-y-3 overflow-y-auto">
            {isLoading ? (
              <p className="py-8 text-center text-xs text-muted-foreground">Loading claims…</p>
            ) : claims.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">No claims yet.</p>
            ) : (
              claims.map((claim) => (
                <div key={claim.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2">
                    <ReporterAvatar name={claim.claimantName} avatarUrl={claim.claimantAvatarUrl} />
                    <p className="text-sm font-semibold">{claim.claimantName}</p>
                    <span className="ml-auto">
                      <StatusBadge status={claim.status} />
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">
                    {claim.message}
                  </p>
                  {claim.details && (
                    <p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground/80">
                      {claim.details}
                    </p>
                  )}
                  {claim.status === "PENDING" ? (
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        className="rounded-lg"
                        onClick={() => void respond(claim.id, "accept")}
                      >
                        <CheckCircle2 className="size-3.5" /> Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg text-destructive hover:text-destructive"
                        onClick={() => void respond(claim.id, "reject")}
                      >
                        <XCircle className="size-3.5" /> Reject
                      </Button>
                    </div>
                  ) : claim.status === "ACCEPTED" ? (
                    <div className="mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg"
                        onClick={() => setConversation(claim)}
                      >
                        <Send className="size-3.5" /> Open conversation
                      </Button>
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
      {conversation && (
        <ConversationDialog claim={conversation} onClose={() => setConversation(null)} />
      )}
    </>
  );
}

function ReportForm({
  editing,
  form,
  setForm,
  photoPreview,
  onPickPhoto,
  onClearPhoto,
  submitting,
  onSubmit,
}: {
  editing: LostFoundPost | null;
  form: {
    type: "LOST" | "FOUND";
    category: string;
    title: string;
    description: string;
    location: string;
    date: string;
  };
  setForm: (updates: Partial<typeof form>) => void;
  photoPreview: string | null;
  onPickPhoto: (file?: File) => void;
  onClearPhoto: () => void;
  submitting: boolean;
  onSubmit: () => void;
}) {
  return (
    <Card className="mx-auto max-w-2xl gap-0 rounded-2xl border-border p-6 shadow-soft">
      <h2 className="text-lg font-semibold">{editing ? "Edit report" : "Report an item"}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {editing
          ? "Update the details of your report."
          : "Add as much detail as you can — it dramatically improves matching."}
      </p>
      <form
        className="mt-6 space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Report type</Label>
            <Select
              value={form.type}
              onValueChange={(value) => setForm({ type: value as "LOST" | "FOUND" })}
            >
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOST">I lost something</SelectItem>
                <SelectItem value="FOUND">I found something</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(value) => setForm({ category: value })}>
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
          <Input
            id="lf-title"
            placeholder="Black laptop sleeve"
            className="h-11 rounded-xl"
            value={form.title}
            onChange={(e) => setForm({ title: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lf-desc">Description</Label>
          <Textarea
            id="lf-desc"
            rows={4}
            placeholder="Distinguishing marks, contents, colour…"
            className="rounded-xl"
            value={form.description}
            onChange={(e) => setForm({ description: e.target.value })}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="lf-loc">Location</Label>
            <Input
              id="lf-loc"
              placeholder="Library, Level 3"
              className="h-11 rounded-xl"
              value={form.location}
              onChange={(e) => setForm({ location: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lf-date">Date</Label>
            <DatePickerField
              id="lf-date"
              value={form.date}
              onChange={(date) => setForm({ date: date ?? "" })}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Photo</Label>
          {photoPreview ? (
            <div className="relative overflow-hidden rounded-xl border border-border">
              <img src={photoPreview} alt="Preview" className="h-44 w-full object-cover" />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="absolute right-2 top-2 rounded-lg bg-background/90"
                onClick={onClearPhoto}
              >
                Remove photo
              </Button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 px-6 py-8 text-center transition-colors hover:border-primary/40">
              <ImagePlus className="size-6 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium">Drop a photo here</p>
              <p className="mt-1 text-xs text-muted-foreground">PNG, JPG or WEBP up to 5 MB</p>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => onPickPhoto(e.target.files?.[0])}
              />
            </label>
          )}
        </div>
        <Button type="submit" size="lg" className="h-11 w-full rounded-xl" disabled={submitting}>
          {submitting ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          {editing ? "Update report" : "Submit report"}
        </Button>
      </form>
    </Card>
  );
}

function LostFoundPage() {
  const search = Route.useSearch();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState(() => search.tab || (search.claimId || search.postId ? "activity" : "lost"));
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [claimTarget, setClaimTarget] = useState<LostFoundPost | null>(null);
  const [claimsPost, setClaimsPost] = useState<LostFoundPost | null>(null);
  const [conversationClaim, setConversationClaim] = useState<LostFoundClaim | null>(null);
  const [editing, setEditing] = useState<LostFoundPost | null>(null);
  const [deleting, setDeleting] = useState<LostFoundPost | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    type: "LOST" as "LOST" | "FOUND",
    category: "Electronics",
    title: "",
    description: "",
    location: "",
    date: "",
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const handledClaimRef = useRef<number | null>(null);
  const handledPostRef = useRef<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Sync tab from search params when navigated
  useEffect(() => {
    if (search.tab) {
      setTab(search.tab);
    } else if (search.claimId || search.postId) {
      setTab("activity");
    }
  }, [search.tab, search.claimId, search.postId]);

  const browseType = tab === "lost" ? "LOST" : tab === "found" ? "FOUND" : undefined;
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["lost-found", "browse", browseType, category, debouncedQuery],
    queryFn: () =>
      browseLostFound({
        type: browseType,
        q: debouncedQuery || undefined,
        category: category === "All" ? undefined : category,
      }),
    enabled: browseType !== undefined,
  });

  const { data: myReports = [] } = useQuery({
    queryKey: ["lost-found", "mine"],
    queryFn: getMyReports,
  });

  const { data: myClaims = [] } = useQuery({
    queryKey: ["lost-found", "claims", "mine"],
    queryFn: getMyClaims,
  });

  // Handle direct navigation to a specific claim / conversation
  useEffect(() => {
    if (!search.claimId || handledClaimRef.current === search.claimId) return;
    handledClaimRef.current = search.claimId;
    setTab("activity");

    let isMounted = true;
    void getClaim(search.claimId)
      .then((claim) => {
        if (isMounted) {
          if (claim.status === "ACCEPTED") {
            setConversationClaim(claim);
          } else {
            toast.info(`Claim on "${claim.postTitle}" is ${claim.status.toLowerCase()}`, {
              description: "Conversations open once a claim is accepted.",
            });
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          toast.error("Conversation not found", {
            description: "The claim or report may have been deleted or resolved.",
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [search.claimId]);

  // Handle direct navigation to claims for a specific report
  useEffect(() => {
    if (!search.postId || handledPostRef.current === search.postId) return;
    if (!myReports.length) return;
    handledPostRef.current = search.postId;
    setTab("activity");

    const target = myReports.find((r) => r.id === search.postId);
    if (target) {
      setClaimsPost(target);
    }
  }, [search.postId, myReports]);

  const refreshAll = () => {
    void queryClient.invalidateQueries({ queryKey: ["lost-found"] });
    void queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const startEdit = (item: LostFoundPost) => {
    setEditing(item);
    setForm({
      type: item.type,
      category: item.category,
      title: item.title,
      description: item.description ?? "",
      location: item.location,
      date: item.dateOccurred ?? "",
    });
    setPhotoFile(null);
    setPhotoPreview(assetUrl(item.imageUrl) ?? null);
    setTab("report");
  };

  const handlePickPhoto = (file?: File) => {
    if (!file) return;
    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Unsupported image", { description: "Upload a PNG, JPG, JPEG, or WEBP image." });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image is too large", { description: "Photos must be 5 MB or smaller." });
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error("Item title is required");
      return;
    }
    if (!form.location.trim()) {
      toast.error("Location is required");
      return;
    }
    setSubmitting(true);
    try {
      const input = {
        type: form.type,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        category: form.category,
        location: form.location.trim(),
        dateOccurred: form.date || undefined,
      };
      if (editing) {
        await updateLostFoundReport(editing.id, input, photoFile ?? undefined);
        toast.success("Report updated");
      } else {
        await createLostFoundReport(input, photoFile ?? undefined);
        toast.success("Report submitted", { description: "It is now visible to other students." });
      }
      setForm({
        type: "LOST",
        category: "Electronics",
        title: "",
        description: "",
        location: "",
        date: "",
      });
      setPhotoFile(null);
      setPhotoPreview(null);
      setEditing(null);
      refreshAll();
      setTab(form.type === "LOST" ? "lost" : "found");
    } catch {
      toast.error(editing ? "Unable to update the report" : "Unable to submit the report");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteLostFoundReport(deleting.id);
      toast.success("Report deleted");
      setDeleting(null);
      refreshAll();
    } catch {
      toast.error("Unable to delete the report");
    }
  };

  const handleMarkReturned = async (item: LostFoundPost) => {
    try {
      await markReturned(item.id);
      toast.success("Item marked as returned");
      refreshAll();
    } catch {
      toast.error("Unable to mark the item as returned");
    }
  };

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Helping students reunite with their belongings.
        </p>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            className="rounded-xl"
            onClick={() => {
              setForm((current) => ({ ...current, type: "LOST" }));
              setTab("report");
            }}
          >
            <Plus className="size-4" /> Report Lost
          </Button>
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => {
              setForm((current) => ({ ...current, type: "FOUND" }));
              setTab("report");
            }}
          >
            <Plus className="size-4" /> Report Found
          </Button>
        </div>
      </div>

      {(tab === "lost" || tab === "found") && (
        <div className="relative mb-6">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items…"
            className="h-11 w-full rounded-xl bg-card pl-10"
          />
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="rounded-xl">
          <TabsTrigger value="lost" className="rounded-lg">
            Lost items
          </TabsTrigger>
          <TabsTrigger value="found" className="rounded-lg">
            Found items
          </TabsTrigger>
          <TabsTrigger value="report" className="rounded-lg">
            Report item
          </TabsTrigger>
          <TabsTrigger value="activity" className="rounded-lg">
            My activity
          </TabsTrigger>
        </TabsList>

        {(tab === "lost" || tab === "found") && (
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
        )}

        <TabsContent value="lost" className="mt-5">
          {isLoading ? (
            <p className="py-16 text-center text-sm text-muted-foreground">Loading lost items…</p>
          ) : posts.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {posts.map((item, idx) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  index={idx}
                  onClaim={setClaimTarget}
                  onEdit={startEdit}
                  onDelete={setDeleting}
                  onMarkReturned={(i) => void handleMarkReturned(i)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Search}
              title={query || category !== "All" ? "No lost items match" : "No lost items reported"}
              description={
                query || category !== "All"
                  ? "Try a different category or clear your search."
                  : "When students report lost items they will appear here."
              }
            />
          )}
        </TabsContent>

        <TabsContent value="found" className="mt-5">
          {isLoading ? (
            <p className="py-16 text-center text-sm text-muted-foreground">Loading found items…</p>
          ) : posts.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {posts.map((item, idx) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  index={idx}
                  onClaim={setClaimTarget}
                  onEdit={startEdit}
                  onDelete={setDeleting}
                  onMarkReturned={(i) => void handleMarkReturned(i)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Search}
              title={
                query || category !== "All" ? "No found items match" : "No found items reported"
              }
              description={
                query || category !== "All"
                  ? "Try a different category or clear your search."
                  : "When students report found items they will appear here."
              }
            />
          )}
        </TabsContent>

        <TabsContent value="report" className="mt-5">
          <ReportForm
            editing={editing}
            form={form}
            setForm={(updates) => setForm((current) => ({ ...current, ...updates }))}
            photoPreview={photoPreview}
            onPickPhoto={handlePickPhoto}
            onClearPhoto={() => {
              setPhotoFile(null);
              setPhotoPreview(null);
            }}
            submitting={submitting}
            onSubmit={() => void handleSubmit()}
          />
        </TabsContent>

        <TabsContent value="activity" className="mt-5">
          <div className="space-y-8">
            <section>
              <h2 className="text-base font-semibold">My Reports</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Items you reported — lost and found.
              </p>
              <div className="mt-4">
                {myReports.length ? (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {myReports.map((item) => (
                      <Card
                        key={item.id}
                        className="gap-0 rounded-2xl border-border p-4 shadow-soft"
                      >
                        <div className="flex items-center gap-3">
                          {item.imageUrl ? (
                            <img
                              src={assetUrl(item.imageUrl)}
                              alt={item.title}
                              className="size-12 shrink-0 rounded-xl object-cover"
                            />
                          ) : (
                            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
                              <ImagePlus className="size-5" />
                            </span>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <TypeBadge type={item.type} />
                              <StatusBadge status={item.status} />
                            </div>
                            <h3 className="mt-1 truncate text-sm font-semibold">{item.title}</h3>
                            <p className="truncate text-xs text-muted-foreground">
                              {item.location} · {formatDate(item.dateOccurred)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-lg"
                            onClick={() => setClaimsPost(item)}
                          >
                            Claims
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-lg"
                            onClick={() => startEdit(item)}
                          >
                            <Pencil className="size-3.5" /> Edit
                          </Button>
                          {(item.status === "ACTIVE" || item.status === "CLAIMED") && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-lg"
                              onClick={() => void handleMarkReturned(item)}
                            >
                              <CheckCircle2 className="size-3.5" /> Returned
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-lg text-destructive hover:text-destructive"
                            onClick={() => setDeleting(item)}
                          >
                            <Trash2 className="size-3.5" /> Delete
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Search}
                    title="You haven't reported any items yet"
                    description="Use the Report item tab to tell the campus community about a lost or found item."
                  />
                )}
              </div>
            </section>

            <section>
              <h2 className="text-base font-semibold">My Claims</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Claims you made on other students' items.
              </p>
              <div className="mt-4">
                {myClaims.length ? (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {myClaims.map((claim) => (
                      <Card
                        key={claim.id}
                        className="gap-0 rounded-2xl border-border p-4 shadow-soft"
                      >
                        <div className="flex items-center gap-2">
                          <TypeBadge type={claim.postType} />
                          <StatusBadge status={claim.status} />
                        </div>
                        <h3 className="mt-2 truncate text-sm font-semibold">{claim.postTitle}</h3>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {claim.message}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground/80">
                          Claimed {formatWhen(claim.createdAt)}
                        </p>
                        {claim.status === "ACCEPTED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-3 w-full rounded-lg"
                            onClick={() => setConversationClaim(claim)}
                          >
                            <Send className="size-3.5" /> Open conversation
                          </Button>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Search}
                    title="You haven't claimed any items yet"
                    description='When you click "This is mine" or "I found this" on an item, your claim appears here.'
                  />
                )}
              </div>
            </section>
          </div>
        </TabsContent>
      </Tabs>

      {claimTarget && (
        <ClaimModal
          post={claimTarget}
          onClose={() => setClaimTarget(null)}
          onSubmitted={refreshAll}
        />
      )}
      {claimsPost && (
        <ClaimsDialog
          post={claimsPost}
          onClose={() => setClaimsPost(null)}
          onChanged={refreshAll}
        />
      )}
      {conversationClaim && (
        <ConversationDialog claim={conversationClaim} onClose={() => setConversationClaim(null)} />
      )}

      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this report?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes “{deleting?.title}” and any claims or messages attached to
              it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction className="rounded-xl" onClick={() => void handleDelete()}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
