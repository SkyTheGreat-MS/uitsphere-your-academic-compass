import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { loginStudent } from "@/api/authApi";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Ma-Haw-Tha-Dar Student Companion" },
      {
        name: "description",
        content:
          "Sign in to Ma-Haw-Tha-Dar to access your timetable, AI Learning Studio and study planner.",
      },
      { property: "og:title", content: "Sign in — Ma-Haw-Tha-Dar" },
      {
        property: "og:description",
        content: "Access your university dashboard, AI study tools and campus updates.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in with your university account to continue studying."
      footer={
        <>
          New to Ma-Haw-Tha-Dar?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form
        className="space-y-5"
        onSubmit={async (e) => {
          e.preventDefault();

          try {
            const data = await loginStudent(email, password);

            if (data.success && data.token) {
              await login(data.token);

              toast.success("Signed in", {
                description: `Welcome back, ${data.student?.name}.`,
              });

              navigate({ to: "/" });
            } else {
              toast.error("Login failed", {
                description: data.message,
              });
            }
          } catch (error) {
            toast.error("Login failed", {
              description: "Invalid email or password.",
            });
          }
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="email">University email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-xl pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-xl pl-9"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox defaultChecked /> Remember me
          </label>
          <button type="button" className="text-sm font-medium text-primary hover:underline">
            Forgot password?
          </button>
        </div>

        <Button type="submit" size="lg" className="h-11 w-full rounded-xl">
          Sign in <ArrowRight className="size-4" />
        </Button>

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>

        <Button type="button" variant="outline" size="lg" className="h-11 w-full rounded-xl">
          Continue with university SSO
        </Button>
      </form>
    </AuthLayout>
  );
}
