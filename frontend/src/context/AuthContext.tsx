import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
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
};

type AuthContextValue = {
  student: Student | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  updateStudent: (updates: Partial<Student>) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [student, setStudent] = useState<Student | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = () => {
    setStudent(null);
    setToken(null);
    localStorage.removeItem("student");
    localStorage.removeItem("token");
    queryClient.clear();
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("token");

    if (!savedToken) {
      setIsLoading(false);
      return;
    }

    setToken(savedToken);
    getStudent()
      .then((currentStudent) => {
        setStudent(currentStudent);
        localStorage.setItem("student", JSON.stringify(currentStudent));
      })
      .catch(() => {
        clearSession();
        toast.error("Session expired", {
          description: "Please sign in again to continue.",
        });
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "token") {
        const savedToken = localStorage.getItem("token");
        if (savedToken !== token) {
          queryClient.clear();
          if (!savedToken) {
            setStudent(null);
            setToken(null);
            localStorage.removeItem("student");
          } else {
            setToken(savedToken);
            getStudent()
              .then((currentStudent) => {
                setStudent(currentStudent);
                localStorage.setItem("student", JSON.stringify(currentStudent));
              })
              .catch(() => clearSession());
          }
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    const handleUnauthorized = () => {
      clearSession();
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [token, queryClient]);

  const login = async (nextToken: string) => {
    setIsLoading(true);
    queryClient.clear();
    setToken(nextToken);
    localStorage.setItem("token", nextToken);

    try {
      const currentStudent = await getStudent();
      setStudent(currentStudent);
      localStorage.setItem("student", JSON.stringify(currentStudent));
    } catch (error) {
      clearSession();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearSession();
  };

  const updateStudent = async (updates: Partial<Student>) => {
    const currentStudent = { ...student, ...updates };
    setStudent(currentStudent);
    localStorage.setItem("student", JSON.stringify(currentStudent));
  };

  return (
    <AuthContext.Provider value={{ student, token, isLoading, login, logout, updateStudent }}>
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
