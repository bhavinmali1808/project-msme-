"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";
import api from "@/lib/api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "participant" | "university" | "mentor" | "admin" | "company";
  universityId?: string;
  college?: string;
  category?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedToken = Cookies.get("hackathon_token") || localStorage.getItem("hackathon_token");
      const savedUser = Cookies.get("hackathon_user") || localStorage.getItem("hackathon_user");
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Ensure cookies are set if they were only in localStorage (migration)
        if (!Cookies.get("hackathon_token")) {
          Cookies.set("hackathon_token", savedToken, { expires: 7, path: '/' });
          Cookies.set("hackathon_user", savedUser, { expires: 7, path: '/' });
        }
      }
    } catch (_) {}
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const { data } = await api.post("/auth/login", { email, password });
    
    // Set proper cookies
    Cookies.set("hackathon_token", data.token, { expires: 7, path: '/' });
    Cookies.set("hackathon_user", JSON.stringify(data.user), { expires: 7, path: '/' });
    
    // Keep localStorage as fallback for existing client components
    localStorage.setItem("hackathon_token", data.token);
    localStorage.setItem("hackathon_user", JSON.stringify(data.user));
    
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    Cookies.remove("hackathon_token", { path: '/' });
    Cookies.remove("hackathon_user", { path: '/' });
    localStorage.removeItem("hackathon_token");
    localStorage.removeItem("hackathon_user");
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
