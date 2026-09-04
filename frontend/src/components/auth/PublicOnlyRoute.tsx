import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { AuthLoadingScreen } from "./AuthLoadingScreen";

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "authenticated") {
      navigate({ to: "/", replace: true });
    }
  }, [status, navigate]);

  if (status === "loading") {
    return <AuthLoadingScreen message="Checking your session..." />;
  }

  if (status === "authenticated") {
    return <AuthLoadingScreen message="Redirecting to dashboard..." />;
  }

  return <>{children}</>;
}
