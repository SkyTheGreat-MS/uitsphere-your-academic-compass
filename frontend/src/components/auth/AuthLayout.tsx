import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { GraduationCap, Sparkles, CalendarCheck, BrainCircuit } from "lucide-react";

const highlights = [
  { icon: BrainCircuit, title: "AI Learning Studio", body: "Turn any lecture into summaries, notes, flashcards and quizzes." },
  { icon: CalendarCheck, title: "One calm timetable", body: "Classes, deadlines and study goals in a single weekly view." },
  { icon: Sparkles, title: "Built for students", body: "Streaks, analytics and campus tools that keep momentum going." },
];

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden gradient-brand p-12 lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-primary-foreground/10 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-16 size-96 rounded-full bg-primary-foreground/10 blur-3xl"
        />

        <Link to="/" className="relative flex items-center gap-3 text-primary-foreground">
          <span className="grid size-11 place-items-center rounded-xl bg-primary-foreground/15">
            <GraduationCap className="size-6" />
          </span>
          <span className="font-display text-xl font-bold">Ma-Haw-Tha-Dar</span>
        </Link>

        <div className="relative max-w-md">
          <h2 className="font-display text-4xl font-bold leading-tight text-primary-foreground">
            Your whole degree, organised and understood.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-primary-foreground/80">
            Ma-Haw-Tha-Dar brings your lectures, deadlines and AI study tools together so you can spend less time managing
            university and more time actually learning.
          </p>

          <div className="mt-10 space-y-4">
            {highlights.map((h, i) => (
              <motion.div
                key={h.title}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 * i, duration: 0.4 }}
                className="flex items-start gap-3 rounded-2xl bg-primary-foreground/10 p-4 backdrop-blur-sm"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-foreground/15 text-primary-foreground">
                  <h.icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary-foreground">{h.title}</p>
                  <p className="text-xs text-primary-foreground/75">{h.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-primary-foreground/70">
          University of Innovation & Technology · Student Companion Platform
        </p>
      </div>

      <div className="flex items-center justify-center px-5 py-12 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="grid size-9 place-items-center rounded-xl gradient-brand text-primary-foreground">
              <GraduationCap className="size-5" />
            </span>
            <span className="font-display text-lg font-bold">Ma-Haw-Tha-Dar</span>
          </Link>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
        </motion.div>
      </div>
    </div>
  );
}
