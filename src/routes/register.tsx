import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Mail, Lock, User, IdCard, ArrowRight } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your account — Ma-Haw-Tha-Dar" },
      { name: "description", content: "Join Ma-Haw-Tha-Dar and organise lectures, deadlines and AI-powered revision in one calm workspace." },
      { property: "og:title", content: "Create your account — Ma-Haw-Tha-Dar" },
      { property: "og:description", content: "Join Ma-Haw-Tha-Dar, the AI-powered university student companion platform." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();

  return (
    <AuthLayout
      title="Create your account"
      subtitle="It takes about a minute. You can finish your profile next."
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
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Account created", { description: "Let's set up your student profile." });
          navigate({ to: "/onboarding" });
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="name" placeholder="Amara Okonkwo" className="h-11 rounded-xl pl-9" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">University email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" type="email" placeholder="you@mahawthadar.edu" className="h-11 rounded-xl pl-9" />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="uid">University ID</Label>
            <div className="relative">
              <IdCard className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="uid" placeholder="UIT-2025-00000" className="h-11 rounded-xl pl-9" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="password" type="password" placeholder="••••••••" className="h-11 rounded-xl pl-9" />
            </div>
          </div>
        </div>

        <label className="flex items-start gap-2 text-sm text-muted-foreground">
          <Checkbox defaultChecked className="mt-0.5" />
          <span>
            I agree to the university acceptable-use policy and Ma-Haw-Tha-Dar terms of service.
          </span>
        </label>

        <Button type="submit" size="lg" className="h-11 w-full rounded-xl">
          Create account <ArrowRight className="size-4" />
        </Button>
      </form>
    </AuthLayout>
  );
}
