"use client";

import { useState, useId, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/ui/auth-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { MaskedPasswordInput } from "@/components/ui/masked-password-input";
import { useMaskedPassword } from "@/hooks/use-masked-password";
import { useAuth } from "@/context/auth-context";
import * as api from "@/lib/api";

export default function SignInPage() {
  const baseId = useId();
  const router = useRouter();
  const auth = useAuth();

  const [username, setUsername] = useState("");
  const password = useMaskedPassword();

  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!username || !password.value) return;

    setServerError(null);
    setIsSubmitting(true);

    try {
      const { accessToken } = await api.signIn(username, password.value);
      auth.signIn(accessToken);
      router.push("/notes");
    } catch (err) {
      setServerError(
        err instanceof api.ApiError
          ? err.message
          : "Unable to reach the server. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [username, password.value, auth, router]);

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
        <p className="mt-1 text-sm text-zinc-400">Sign in to your account.</p>
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
          <FieldError id={`${baseId}-password-error`} message={serverError} />
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
