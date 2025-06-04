"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuthModal } from "@/components/auth/AuthModalContext";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { openModal } = useAuthModal();
  const error = searchParams.get("error");
  const message = searchParams.get("message");

  useEffect(() => {
    if (error === "OAuthAccountNotLinked") {
      openModal("login");
    }
  }, [error, openModal]);

  const errorMessages: Record<string, string> = {
    OAuthAccountNotLinked: "This email is already registered with another method. Please sign in with your original method.",
    CredentialsSignin: "Invalid credentials. Please try again.",
    Default: "An authentication error occurred. Please try again."
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
        <p className="mb-6 text-gray-600">
          {error ? (errorMessages[error] || message) : errorMessages.Default}
        </p>
        
        <div className="space-y-3">
          <Button
            onClick={() => router.push("/")}
            className="w-full"
            variant="outline"
          >
            Go to Homepage
          </Button>
          <Button
            onClick={() => openModal("login")}
            className="w-full"
          >
            Try Again
          </Button>
          {error === "OAuthAccountNotLinked" && (
            <Button
              onClick={() => router.push("/auth/reset-password")}
              className="w-full"
              variant="link"
            >
              Forgot Password?
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}