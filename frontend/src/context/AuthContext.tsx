import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getStudent } from "@/api/studentApi";

export type Student = {
  name?: string;
  email?: string;
  universityId?: string;
  department?: string;
  year?: number;
  batch?: string;
  section?: string;
  bio?: string;
  avatarUrl?: string;
  avatarInitials?: string;
};

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  student: Student | null;
  token: string | null;
  status: AuthStatus;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, rememberMe?: boolean) => Promise<void>;
  updateStudent: (updates: Partial<Student>) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [student, setStudent] = useState<Student | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const clearSession = useCallback(() => {
    setStudent(null);
    setToken(null);
    setStatus("unauthenticated");
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("student");
      sessionStorage.removeItem("token");
      localStorage.removeItem("student");
      localStorage.removeItem("token");
    }
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const sessionToken = sessionStorage.getItem("token");
    const localToken = localStorage.getItem("token");
    const savedToken = sessionToken || localToken;

    if (!savedToken || savedToken.trim() === "" || savedToken === "null" || savedToken === "undefined") {
      clearSession();
      return;
    }

    setToken(savedToken);
    setStatus("loading");

    getStudent()
      .then((currentStudent) => {
        if (!currentStudent || !currentStudent.email) {
          throw new Error("Invalid student data received");
        }
        setStudent(currentStudent);
        setStatus("authenticated");
        sessionStorage.setItem("student", JSON.stringify(currentStudent));
        if (localToken) {
          localStorage.setItem("student", JSON.stringify(currentStudent));
        }
      })
      .catch(() => {
        clearSession();
        toast.error("Session expired", {
          description: "Please sign in again to continue.",
        });
      });
  }, [clearSession]);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearSession();
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [clearSession]);

  const login = async (nextToken: string, rememberMe: boolean = true) => {
    setStatus("loading");
    queryClient.clear();

    if (typeof window !== "undefined") {
      sessionStorage.setItem("token", nextToken);
      if (rememberMe) {
        localStorage.setItem("token", nextToken);
      } else {
        localStorage.removeItem("token");
      }
    }
    setToken(nextToken);

    try {
      const currentStudent = await getStudent();
      if (!currentStudent || !currentStudent.email) {
        throw new Error("Unable to load student profile.");
      }
      setStudent(currentStudent);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("student", JSON.stringify(currentStudent));
        if (rememberMe) {
          localStorage.setItem("student", JSON.stringify(currentStudent));
        } else {
          localStorage.removeItem("student");
        }
      }
      setStatus("authenticated");
    } catch (error) {
      clearSession();
      throw error;
    }
  };

  const logout = () => {
    clearSession();
  };

  const updateStudent = async (updates: Partial<Student>) => {
    const currentStudent = { ...student, ...updates };
    setStudent(currentStudent);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("student", JSON.stringify(currentStudent));
      if (localStorage.getItem("token")) {
        localStorage.setItem("student", JSON.stringify(currentStudent));
      }
    }
  };

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated" && Boolean(student) && Boolean(token);

  return (
    <AuthContext.Provider
      value={{
        student,
        token,
        status,
        isLoading,
        isAuthenticated,
        login,
        logout,
        updateStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
