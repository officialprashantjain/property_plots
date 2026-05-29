"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("1. Form submit intercepted!");
    
    setError("");

    if (!email || !password) {
      console.log("2. Validation failed: missing email or password");
      setError("Please enter both email and password.");
      return;
    }

    try {
      console.log("3. Validation passed. Setting loading state...");
      setIsLoading(true);
      
      console.log(`4. Attempting to call backend API at /auth/login with email: ${email}`);
      // Calls our standard service using Axios
      const data = await authService.login(email, password);
      console.log("5. Success! Backend responded with:", data);
      
      // Expected backend response gives us `token`, `_id`, `role`, `email`
      // Save it globally
      console.log("6. Saving to AuthContext & localStorage...");
      login(
        { _id: data._id, email: data.email, role: data.role }, 
        data.token
      );

      console.log("7. Redirecting to Dashboard...");
      // Redirect specifically to the dashboard index (which is rendered at root "/" because of route grouping)
      router.replace("/");
    } catch (err) {
      console.error("❌ Login caught an error block!", err);
      // Extract axios standard error string nicely, fall back to native error message
      const errMessage = err.response?.data?.message || err.message || "An error occurred during login";
      console.log("8. Extracted Error message to display:", errMessage);
      setError(errMessage);
    } finally {
      setIsLoading(false);
      console.log("9. Finished login flow (loading state reset)");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="bg-surface border border-border rounded-2xl shadow-lg p-8 w-full max-w-md">
        
        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="text-xl font-bold text-foreground">
            <span className="text-primary">Properties</span>
          </span>
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-1">Admin Login</h1>
        <p className="text-muted text-sm mb-6">Sign in to access the dashboard</p>

        {/* Global Error Notice */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-danger/10 border border-danger/20 rounded-lg">
            <p className="text-sm text-danger font-medium">{error}</p>
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="propertiesAdmin@gmail.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <Button
            type="submit"
            isLoading={isLoading}
            fullWidth
            className="mt-2"
          >
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
