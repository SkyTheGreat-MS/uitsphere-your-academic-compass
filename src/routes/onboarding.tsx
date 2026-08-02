import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { motion } from "motion/react";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Student profile setup — Ma-Haw-Tha-Dar" },
      { name: "description", content: "Tell Ma-Haw-Tha-Dar about your department and academic year so your dashboard and AI tools are tailored to you." },
      { property: "og:title", content: "Student profile setup — Ma-Haw-Tha-Dar" },
      { property: "og:description", content: "Personalise your Ma-Haw-Tha-Dar workspace in three quick steps." },
    ],
  }),
  component: OnboardingPage,
});

const departments = [
  "Computer Science & Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Business & Economics",
  "Life Sciences",
  "Humanities",
];

const years = ["Year 1", "Year 2", "Year 3", "Year 4", "Postgraduate"];
const steps = ["Identity", "Academics", "Preferences"];

function OnboardingPage() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  return (
    <AuthLayout title="Set up your student profile" subtitle="Three quick steps to personalise your workspace.">
      <div className="mb-8 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex min-w-0 flex-1 items-center gap-2">
            <span
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors",
                i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              {i < step ? <Check className="size-3.5" /> : i + 1}
            </span>
            <span className={cn("truncate text-xs font-medium", i <= step ? "text-foreground" : "text-muted-foreground")}>
              {s}
            </span>
          </div>
        ))}
      </div>

      <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.28 }}>
        {step === 0 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="o-name">Full name</Label>
              <Input id="o-name" defaultValue="Amara Okonkwo" className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="o-email">University email</Label>
              <Input id="o-email" type="email" defaultValue="amara.okonkwo@mahawthadar.edu" className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="o-pass">Password</Label>
              <Input id="o-pass" type="password" defaultValue="mahawthadar" className="h-11 rounded-xl" />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="o-uid">Student ID</Label>
              <Input id="o-uid" defaultValue="TNT-2361" className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select defaultValue={departments[0]}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Academic year</Label>
              <Select defaultValue="Year 3">
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="o-goal">Weekly study goal (hours)</Label>
              <Input id="o-goal" type="number" defaultValue={20} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="o-bio">Short bio</Label>
              <Textarea
                id="o-bio"
                rows={4}
                className="rounded-xl"
                defaultValue="Third-year CS student focused on distributed systems and machine learning."
              />
            </div>
          </div>
        )}
      </motion.div>

      <div className="mt-8 flex items-center gap-3">
        {step > 0 && (
          <Button variant="outline" size="lg" className="h-11 rounded-xl" onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft className="size-4" /> Back
          </Button>
        )}
        <Button
          size="lg"
          className="h-11 flex-1 rounded-xl"
          onClick={() => {
            if (step < 2) return setStep((s) => s + 1);
            toast.success("Profile ready", { description: "Your dashboard has been personalised." });
            navigate({ to: "/" });
          }}
        >
          {step < 2 ? "Continue" : "Finish setup"} <ArrowRight className="size-4" />
        </Button>
      </div>
    </AuthLayout>
  );
}
