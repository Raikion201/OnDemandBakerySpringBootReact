"use client";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";

export function GoogleLoginButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  return (
    <Button
      variant="outline"
      type="button"
      className="w-full flex items-center justify-center gap-2"
      onClick={handleGoogleLogin}
      disabled={isLoading}
    >
      {isLoading ? (
        <span>Redirecting...</span>
      ) : (
        <>
          {/* Call the icon as a function instead of using as JSX */}
          <FcGoogle />
          <span>Sign in with Google</span>
        </>
      )}
    </Button>
  );
}