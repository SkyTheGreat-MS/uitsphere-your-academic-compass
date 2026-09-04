import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type ChangeEvent } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Mail, Lock, User, IdCard, ArrowRight } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { loginStudent } from "@/api/authApi";
import { registerStudent } from "@/api/studentApi";
import { useAuth } from "@/context/AuthContext";

const departments = [
  "Software Engineering",
  "Knowledge Engineering",
  "High Performance Computing",
  "Cybersecurity",
  "Electrical Engineering",
  "Business Information Systems",
] as const;

const academicYears = [
  { value: 1, label: "First Year" },
  { value: 2, label: "Second Year" },
  { value: 3, label: "Third Year" },
  { value: 4, label: "Fourth Year" },
] as const;

const batches = ["9", "10", "11", "12", "13"] as const;

import { PublicOnlyRoute } from "@/components/auth/PublicOnlyRoute";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your account — Ma-Haw-Tha-Dar" },
      { name: "description", content: "Join Ma-Haw-Tha-Dar and organise lectures, deadlines and AI-powered revision in one calm workspace." },
      { property: "og:title", content: "Create your account — Ma-Haw-Tha-Dar" },
      { property: "og:description", content: "Join Ma-Haw-Tha-Dar, the AI-powered university student companion platform." },
    ],
  }),
  component: () => (
    <PublicOnlyRoute>
      <RegisterPage />
    </PublicOnlyRoute>
  ),
});

function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    universityId: "",
    password: "",
    department: "",
    year: 0,
    batch: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof typeof form) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const getErrorMessage = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.message || error.response?.data?.error || "Unable to create your account.";
    }
    return error instanceof Error ? error.message : "Unable to create your account.";
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="It takes about a minute. Add your academic details to get started."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form
        className="space-y-5"
        onSubmit={async (e) => {
          e.preventDefault();
          if (isSubmitting) return;
          if (
            !form.name.trim() ||
            !form.email.trim() ||
            !form.universityId.trim() ||
            !form.password ||
            !form.department ||
            form.year === 0 ||
            !form.batch
          ) {
            toast.error("Complete your profile", { description: "Please complete every field." });
            return;
          }
          setIsSubmitting(true);
          try {
            await registerStudent(form);
            const response = await loginStudent(form.email, form.password);
            if (!response.success || !response.token) {
              throw new Error(response.message || "Account created, but automatic login failed.");
            }
            await login(response.token);
            toast.success("Registration successful", { description: "Welcome to Ma-Haw-Tha-Dar." });
            navigate({ to: "/onboarding" });
          } catch (error) {
            toast.error("Registration failed", { description: getErrorMessage(error) });
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="name" value={form.name} onChange={updateField("name")} placeholder="Your full name" required className="h-11 rounded-xl pl-9" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">University email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" type="email" value={form.email} onChange={updateField("email")} placeholder="you@mahawthadar.edu" required className="h-11 rounded-xl pl-9" />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="uid">University ID</Label>
            <div className="relative">
              <IdCard className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="uid" value={form.universityId} onChange={updateField("universityId")} placeholder="TTNT-1234" required className="h-11 rounded-xl pl-9" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="password" type="password" value={form.password} onChange={updateField("password")} placeholder="Create a password" required minLength={6} className="h-11 rounded-xl pl-9" />
            </div>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select value={form.department} onValueChange={(department) => setForm((current) => ({ ...current, department }))}>
              <SelectTrigger id="department" className="h-11 rounded-xl"><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>
              {departments.map((department) => (
                <SelectItem key={department} value={department}>{department}</SelectItem>
              ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Academic year</Label>
            <Select value={form.year ? String(form.year) : ""} onValueChange={(year) => setForm((current) => ({ ...current, year: Number(year) }))}>
              <SelectTrigger id="year" className="h-11 rounded-xl"><SelectValue placeholder="Select year" /></SelectTrigger>
              <SelectContent>
              {academicYears.map(({ value, label }) => (
                <SelectItem key={value} value={String(value)}>{label}</SelectItem>
              ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="batch">Batch</Label>
            <Select value={form.batch} onValueChange={(batch) => setForm((current) => ({ ...current, batch }))}>
              <SelectTrigger id="batch" className="h-11 rounded-xl"><SelectValue placeholder="Select batch" /></SelectTrigger>
              <SelectContent>
              {batches.map((batch) => (
                <SelectItem key={batch} value={batch}>Batch {batch}</SelectItem>
              ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <label className="flex items-start gap-2 text-sm text-muted-foreground">
          <Checkbox defaultChecked className="mt-0.5" />
          <span>
            I agree to the university acceptable-use policy and Ma-Haw-Tha-Dar terms of service.
          </span>
        </label>

        <Button type="submit" size="lg" className="h-11 w-full rounded-xl" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"} {!isSubmitting && <ArrowRight className="size-4" />}
        </Button>
      </form>
    </AuthLayout>
  );
}
