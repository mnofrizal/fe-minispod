"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Try to parse the error as JSON to check for validation errors
        try {
          const errorData = JSON.parse(result.error);

          if (errorData.code === "VALIDATION_ERROR" && errorData.errors) {
            // Handle validation errors - map them to field errors
            const newFieldErrors = {};
            errorData.errors.forEach((err) => {
              newFieldErrors[err.field] = err.message;
            });
            setFieldErrors(newFieldErrors);
          } else {
            // Handle other structured errors
            setError(errorData.message || result.error);
          }
        } catch (parseError) {
          // If error is not JSON, treat as regular error message
          setError(result.error);
        }
      } else {
        // Get the session to ensure it's properly set
        const session = await getSession();
        if (session) {
          router.push("/dashboard");
          router.refresh();
        }
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-black mb-6">MinisPod</h1>
          <p className=" text-xl leading-relaxed">
            We'll sign you in, or create a new account
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 text-lg text-center">
              {error}
            </div>
          )}

          {/* Google Sign In Button */}
          <Button
            type="button"
            onClick={() => signIn("google")}
            className="w-full h-16 bg-zinc-100 hover:bg-zinc-200 text-black text-xl font-medium rounded-none transition-colors duration-200 mb-4 flex items-center justify-center gap-3"
          >
            <svg className="w-8 h-8" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="tracking-tight">Continue with Google</span>
          </Button>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full h-16 px-6 text-3xl border rounded-none focus:ring-0 focus:outline-none placeholder:text-gray-400 ${
                  fieldErrors.email
                    ? "border-red-300 focus:border-red-400"
                    : "border-gray-300 focus:border-gray-400"
                }`}
                style={{ fontSize: "1.375rem" }}
              />
              {fieldErrors.email && (
                <div className="mt-2 text-red-600 text-base">
                  {fieldErrors.email}
                </div>
              )}
            </div>

            <div>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full h-16 px-6 text-3xl border rounded-none focus:ring-0 focus:outline-none placeholder:text-gray-400 ${
                  fieldErrors.password
                    ? "border-red-300 focus:border-red-400"
                    : "border-gray-300 focus:border-gray-400"
                }`}
                style={{ fontSize: "1.375rem" }}
              />
              {fieldErrors.password && (
                <div className="mt-2 text-red-600 text-base">
                  {fieldErrors.password}
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-16 bg-purple-500 hover:bg-purple-600 text-white text-xl font-medium rounded-none transition-colors duration-200"
            >
              {isLoading ? "Signing in..." : "Continue with email"}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center text-base text-gray-500 mt-8">
            By clicking "Continue", you agree to the{" "}
            <Link href="#" className="text-blue-500 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-blue-500 hover:underline">
              Privacy policy
            </Link>
            .
          </div>

          <div className="text-center mt-6"></div>
        </div>
      </div>
    </div>
  );
}
