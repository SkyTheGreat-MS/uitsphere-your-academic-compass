import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowRight, UserRound } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth, type Student } from "@/context/AuthContext";
import { updateStudent as saveStudent } from "@/api/studentApi";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Student profile setup — Ma-Haw-Tha-Dar" }] }),
  component: OnboardingPage,
});

const departments = ["Software Engineering", "Knowledge Engineering", "High Performance Computing", "Cybersecurity", "Electrical Engineering", "Business Information Systems"];
const years = [{ value: "1", label: "First Year" }, { value: "2", label: "Second Year" }, { value: "3", label: "Third Year" }, { value: "4", label: "Fourth Year" }];
const batches = ["9", "10", "11", "12", "13"];

function OnboardingPage() {
  const navigate = useNavigate();
  const { student, isLoading, updateStudent } = useAuth();
  const [form, setForm] = useState<Student>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (student) setForm(student);
  }, [student]);

  if (isLoading || !student) return <AuthLayout title="Loading your profile" subtitle="Getting your account ready."><div className="py-8 text-center text-sm text-muted-foreground">Loading student information...</div></AuthLayout>;

  const set = (updates: Partial<Student>) => setForm((current) => ({ ...current, ...updates }));
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const saved = await saveStudent({ name: form.name, department: form.department, year: form.year, batch: form.batch, bio: form.bio });
      await updateStudent(saved);
      toast.success("Profile ready", { description: "Your dashboard has been personalised." });
      navigate({ to: "/" });
    } catch {
      toast.error("Unable to save profile", { description: "Please try again." });
    } finally { setIsSaving(false); }
  };

  return <AuthLayout title="Set up your student profile" subtitle="Review your details and add an optional bio before entering your dashboard.">
    <form className="space-y-5" onSubmit={save}>
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/40 p-4">
        <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary"><UserRound className="size-5" /></span>
        <div><p className="text-sm font-semibold">Welcome, {student.name}</p><p className="text-xs text-muted-foreground">Your account details are ready to review.</p></div>
      </div>
      <div className="space-y-2"><Label htmlFor="o-name">Full name</Label><Input id="o-name" value={form.name ?? ""} onChange={(e) => set({ name: e.target.value })} className="h-11 rounded-xl" required /></div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2"><Label>Department</Label><Select value={form.department ?? ""} onValueChange={(department) => set({ department })}><SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select department" /></SelectTrigger><SelectContent>{departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-2"><Label>Academic year</Label><Select value={form.year ? String(form.year) : ""} onValueChange={(year) => set({ year: Number(year) })}><SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select year" /></SelectTrigger><SelectContent>{years.map((y) => <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>)}</SelectContent></Select></div>
      </div>
      <div className="space-y-2"><Label>Batch</Label><Select value={form.batch ?? ""} onValueChange={(batch) => set({ batch })}><SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select batch" /></SelectTrigger><SelectContent>{batches.map((b) => <SelectItem key={b} value={b}>Batch {b}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-2"><Label htmlFor="o-bio">Bio <span className="font-normal text-muted-foreground">(optional)</span></Label><Textarea id="o-bio" rows={4} value={form.bio ?? ""} onChange={(e) => set({ bio: e.target.value })} className="rounded-xl" placeholder="Tell us a little about your study interests..." /></div>
      <Button type="submit" size="lg" className="h-11 w-full rounded-xl" disabled={isSaving}>{isSaving ? "Saving profile..." : "Finish setup"} {!isSaving && <ArrowRight className="size-4" />}</Button>
    </form>
  </AuthLayout>;
}
