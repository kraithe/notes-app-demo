"use client";

import { useState, useId, useCallback } from "react";
import Link from "next/link";
import { AuthCard } from "@/components/ui/auth-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { MaskedPasswordInput } from "@/components/ui/masked-password-input";
import { useMaskedPassword } from "@/hooks/use-masked-password";

export default function SignInPage() {
  const baseId = useId();

  const [username, setUsername] = useState("");
  const password = useMaskedPassword();

  // Server-returned invalid-credentials message
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!username || !password.value) return;

    // Clear the previous server error on each new attempt
    setServerError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("http://localhost:3000/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password: password.value }),
      });

      if (res.ok) {
        const body = await res.json();
        // TODO: store token (e.g. in httpOnly cookie / context) and redirect
        console.log("Signed in. Access token:", body.accessToken);
        return;
      }

      const body = await res.json().catch(() => ({}));
      setServerError(
        body?.message ?? "Username or password is incorrect."
      );
    } catch {
      setServerError("Unable to reach the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [username, password.value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSubmit();
    },
    [handleSubmit]
  );

  const canSubmit = !!username && !!password.value && !isSubmitting;

  return (
    <AuthCard>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Sign in to your account.
        </p>
      </header>

      <form
        noValidate
        aria-label="Sign-in form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="space-y-5"
      >
        {/* Username */}
        <div className="space-y-1">
          <Label htmlFor={`${baseId}-username`}>Username</Label>
          <Input
            id={`${baseId}-username`}
            type="text"
            autoComplete="username"
            placeholder="your_username"
            value={username}
            aria-required="true"
            onChange={(e) => {
              setUsername(e.target.value);
              if (serverError) setServerError(null);
            }}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Password */}
        <div className="space-y-1">
          <Label htmlFor={`${baseId}-password`}>Password</Label>
          <MaskedPasswordInput
            id={`${baseId}-password`}
            autoComplete="current-password"
            placeholder="••••••••"
            displayValue={password.display}
            error={!!serverError}
            aria-required="true"
            aria-invalid={!!serverError}
            aria-describedby={`${baseId}-password-error`}
            {...password.inputProps}
            onChange={(e) => {
              password.inputProps.onChange(e);
              if (serverError) setServerError(null);
            }}
            onKeyDown={handleKeyDown}
          />
          <FieldError
            id={`${baseId}-password-error`}
            message={serverError}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full mt-2"
          disabled={!canSubmit}
          aria-disabled={!canSubmit}
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-zinc-300 underline underline-offset-4 hover:text-white transition-colors"
        >
          Register
        </Link>
      </p>
    </AuthCard>
  );
}
