"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }) {
  const { user, token, isInitializing } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    // If we've finished initializing and there's no user/token, they aren't logged in!
    if (!isInitializing && (!user || !token)) {
      router.replace("/login");
    }
  }, [user, token, isInitializing, router]);

  // While initializing, or if unauthorized (waiting for redirect), render nothing (or a loader)
  if (isInitializing || !user || !token) {
    return <div className="flex h-screen items-center justify-center bg-background"><span className="text-muted text-sm">Loading admin dashboard...</span></div>;
  }

  // If authenticated, render the dashboard content safely
  return children;
}
