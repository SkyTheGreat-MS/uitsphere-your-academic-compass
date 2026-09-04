import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { AuthLoadingScreen } from "@/components/auth/AuthLoadingScreen";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — Ma-Haw-Tha-Dar" }],
  }),
  component: DashboardRedirectPage,
});

function DashboardRedirectPage() {
  const { status } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "authenticated") {
      navigate({ to: "/", replace: true });
    } else if (status === "unauthenticated") {
      navigate({ to: "/login", replace: true });
    }
  }, [status, navigate]);

  return <AuthLoadingScreen message="Checking your session..." />;
}
