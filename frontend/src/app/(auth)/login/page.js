"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthContext();

  const [step, setStep] = useState("login"); // login, forgot, otp, reset
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setIsLoading(true);
      const data = await authService.login(email, password);
      login({ _id: data._id, email: data.email, role: data.role }, data.token);
      router.replace("/");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    try {
      setIsLoading(true);
      await authService.forgotPassword(email);
      setSuccess("OTP sent to your email.");
      setStep("otp");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error sending OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }

    try {
      setIsLoading(true);
      await authService.verifyOTP(email, otp);
      setSuccess("OTP verified. Please set a new password.");
      setStep("reset");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Invalid or expired OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!passwordRegex.test(password)) {
      setError("Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character.");
      return;
    }

    try {
      setIsLoading(true);
      await authService.resetPassword(email, otp, password, confirmPassword);
      setSuccess("Password updated successfully. You can now login.");
      setStep("login");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error resetting password");
    } finally {
      setIsLoading(false);
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
        
        {step === "login" && (
          <>
            <h1 className="text-2xl font-bold text-foreground mb-1">Admin Login</h1>
            <p className="text-muted text-sm mb-6">Sign in to access the dashboard</p>
          </>
        )}

        {step === "forgot" && (
          <>
            <h1 className="text-2xl font-bold text-foreground mb-1">Forgot Password</h1>
            <p className="text-muted text-sm mb-6">Enter your email to receive an OTP</p>
          </>
        )}

        {step === "otp" && (
          <>
            <h1 className="text-2xl font-bold text-foreground mb-1">Verify OTP</h1>
            <p className="text-muted text-sm mb-6">Enter the 6-digit code sent to your email</p>
          </>
        )}

        {step === "reset" && (
          <>
            <h1 className="text-2xl font-bold text-foreground mb-1">Reset Password</h1>
            <p className="text-muted text-sm mb-6">Set a strong new password for your account</p>
          </>
        )}

        {/* Status Messages */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-danger/10 border border-danger/20 rounded-lg">
            <p className="text-sm text-danger font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 px-4 py-3 bg-success/10 border border-success/20 rounded-lg">
            <p className="text-sm text-success font-medium">{success}</p>
          </div>
        )}

        {step === "login" && (
          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="propertiesAdmin@gmail.com"
              required
            />
            <div className="flex flex-col gap-1">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                iconRight={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />
              <button 
                type="button"
                onClick={() => { setStep("forgot"); setError(""); setSuccess(""); setShowPassword(false); }}
                className="text-xs text-primary font-medium hover:underline self-end"
              >
                Forgot Password?
              </button>
            </div>
            <Button
              type="submit"
              isLoading={isLoading}
              fullWidth
              className="mt-2"
            >
              Sign In
            </Button>
          </form>
        )}

        {step === "forgot" && (
          <form className="flex flex-col gap-4" onSubmit={handleForgotPassword}>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              required
            />
            <Button
              type="submit"
              isLoading={isLoading}
              fullWidth
              className="mt-2"
            >
              Send OTP
            </Button>
            <button 
              type="button"
              onClick={() => { setStep("login"); setError(""); setSuccess(""); setShowPassword(false); setShowConfirmPassword(false); }}
              className="text-sm text-muted hover:text-foreground transition-colors font-medium"
            >
              Back to Login
            </button>
          </form>
        )}

        {step === "otp" && (
          <form className="flex flex-col gap-4" onSubmit={handleVerifyOTP}>
            <Input
              label="OTP Code"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              required
            />
            <Button
              type="submit"
              isLoading={isLoading}
              fullWidth
              className="mt-2"
            >
              Verify OTP
            </Button>
            <div className="flex justify-between items-center">
              <button 
                type="button"
                onClick={() => { setStep("forgot"); setError(""); setSuccess(""); }}
                className="text-sm text-muted hover:text-foreground transition-colors font-medium"
              >
                Resend OTP
              </button>
              <button 
                type="button"
                onClick={() => { setStep("login"); setError(""); setSuccess(""); setShowPassword(false); setShowConfirmPassword(false); }}
                className="text-sm text-muted hover:text-foreground transition-colors font-medium"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}

        {step === "reset" && (
          <form className="flex flex-col gap-4" onSubmit={handleResetPassword}>
            <Input
              label="New Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              iconRight={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />
            <Input
              label="Confirm New Password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              required
              iconRight={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Password must have 8+ characters, one uppercase, one lowercase, one number, and one special character.
            </p>
            <Button
              type="submit"
              isLoading={isLoading}
              fullWidth
              className="mt-2"
            >
              Update Password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

