"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  // Important: We need a loading state while we check localStorage on mount
  const [isInitializing, setIsInitializing] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const initializeAuth = () => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
        
        if (pathname === "/login") {
          router.replace("/");
        }
      } catch (err) {
        console.error("Failed to parse user from localStorage", err);
      }
    }
    setIsInitializing(false);
  };

  useEffect(() => {
    // Defer execution by one microtask to avoid "synchronous cascading render" warnings from strict linters
    Promise.resolve().then(() => {
      initializeAuth();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const login = (userData, jwt) => {
    // 1. Update React State
    setUser(userData);
    setToken(jwt);
    // 2. Persist in LocalStorage
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", jwt);
  };

  const logout = () => {
    // 1. Clear React State
    setUser(null);
    setToken(null);
    // 2. Clear Storage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    // 3. Redirect explicitly to Login
    router.replace("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, isInitializing, login, logout }}>
      {/* We could show a splash screen here if isInitializing is true, but normally it's fast */}
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to consume auth context anywhere
export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside AuthProvider");
  return ctx;
}
