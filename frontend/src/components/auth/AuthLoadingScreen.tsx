import { Loader2 } from "lucide-react";

export function AuthLoadingScreen({
  message = "Checking your session...",
}: {
  message?: string;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <img
          src="/UIT-Logo-big.png"
          alt="University of Information Technology"
          className="size-20 object-contain animate-pulse"
        />
        <div>
          <h2 className="font-display text-lg font-bold tracking-tight">Ma-Haw-Tha-Dar</h2>
          <p className="text-xs text-muted-foreground">Student Companion</p>
        </div>
        <div className="mt-2 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground shadow-sm">
          <Loader2 className="size-3.5 animate-spin text-primary" />
          <span>{message}</span>
        </div>
      </div>
    </div>
  );
}
