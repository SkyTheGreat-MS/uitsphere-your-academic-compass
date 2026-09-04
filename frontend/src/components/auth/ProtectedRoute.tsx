import { useEffect, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { AuthLoadingScreen } from "./AuthLoadingScreen";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status, student } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (status === "unauthenticated") {
      navigate({
        to: "/login",
        search: pathname !== "/" && pathname !== "/dashboard" ? ({ redirect: pathname } as any) : undefined,
        replace: true,
      });
    }
  }, [status, navigate, pathname]);

  if (status === "loading" || !student) {
    return <AuthLoadingScreen message="Checking your session..." />;
  }

  if (status === "unauthenticated") {
    return <AuthLoadingScreen message="Redirecting to sign in..." />;
  }

  return <>{children}</>;
}
