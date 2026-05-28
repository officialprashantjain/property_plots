// useAuth - Custom hook for authentication state
// Will handle: login, logout, token validation, and redirect logic

"use client";

import { useState } from "react";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    // TODO: Call backend POST /api/auth/login
    setLoading(true);
    console.log("Login called with:", email);
    setLoading(false);
  };

  const logout = () => {
    // TODO: Clear token and redirect to /login
    setUser(null);
  };

  return { user, loading, login, logout };
}
