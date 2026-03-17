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

const USERNAME_MIN = 2;
const USERNAME_MAX = 20;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 20;

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

function validateUsername(username: string): string | null {
  if (!username) return "Username is required.";
  if (username.length < USERNAME_MIN)
    return `Username must be at least ${USERNAME_MIN} characters.`;
  if (username.length > USERNAME_MAX)
    return `Username must not exceed ${USERNAME_MAX} characters.`;
  return null;
}

function validatePassword(password: string): string | null {
  if (!password) return "Password is required.";
  if (password.length < PASSWORD_MIN)
    return `Password must be at least ${PASSWORD_MIN} characters.`;
  if (password.length > PASSWORD_MAX)
    return `Password must not exceed ${PASSWORD_MAX} characters.`;
  return null;
}

function validateConfirm(password: string, confirm: string): string | null {
  if (!confirm) return "Please re-enter your password.";
  if (password !== confirm) return "Passwords do not match.";
  return null;
}

export default function RegisterPage() {
  const router = useRouter();
  const baseId = useId();

  const [username, setUsername] = useState("");
  const password = useMaskedPassword();
  const confirm = useMaskedPassword();

  // Client-side validation errors (shown after first blur or submit attempt)
  const [touchedUsername, setTouchedUsername] = useState(false);
  const [touchedPassword, setTouchedPassword] = useState(false);
  const [touchedConfirm, setTouchedConfirm] = useState(false);

  // Server-returned errors — cleared when the user clicks Register
  const [serverUsernameError, setServerUsernameError] = useState<string | null>(null);
  const [serverPasswordError, setServerPasswordError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const usernameError = touchedUsername ? validateUsername(username) : null;
  const passwordError = touchedPassword ? validatePassword(password.value) : null;
  const confirmError = touchedConfirm
    ? validateConfirm(password.value, confirm.value)
    : null;

  const allValid =
    validateUsername(username) === null &&
    validatePassword(password.value) === null &&
    validateConfirm(password.value, confirm.value) === null;

  const handleSubmit = useCallback(async () => {
    // Touch all fields to surface any remaining errors
    setTouchedUsername(true);
    setTouchedPassword(true);
    setTouchedConfirm(true);

    if (!allValid) return;

    // Clear previous server errors on each new attempt
    setServerUsernameError(null);
    setServerPasswordError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password: password.value }),
      });

      if (res.status === 201) {
        router.push("/sign-in");
        return;
      }

      const body = await res.json().catch(() => ({}));
      const serverMessage: string =
        body?.message ??
        (Array.isArray(body?.message) ? body.message[0] : null) ??
        "Something went wrong. Please try again.";

      if (res.status === 409) {
        // Username conflict
        setServerUsernameError(serverMessage);
      } else {
        // Treat any other error as a password-level issue
        setServerPasswordError(serverMessage);
      }
    } catch {
      setServerPasswordError("Unable to reach the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [allValid, username, password.value, router]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSubmit();
    },
    [handleSubmit]
  );

  const displayUsernameError = serverUsernameError ?? usernameError;
  const displayPasswordError = serverPasswordError ?? passwordError;

  return (
    <AuthCard>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Create an account
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Join to start taking notes.
        </p>
      </header>

      <form
        noValidate
        aria-label="Registration form"
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
            maxLength={USERNAME_MAX}
            aria-required="true"
            aria-invalid={!!displayUsernameError}
            aria-describedby={`${baseId}-username-error`}
            onChange={(e) => {
              setUsername(e.target.value);
              // Clear server error as soon as user starts editing
              if (serverUsernameError) setServerUsernameError(null);
            }}
            onBlur={() => setTouchedUsername(true)}
            onKeyDown={handleKeyDown}
          />
          <FieldError
            id={`${baseId}-username-error`}
            message={displayUsernameError}
          />
        </div>

        {/* Password */}
        <div className="space-y-1">
          <Label htmlFor={`${baseId}-password`}>Password</Label>
          <MaskedPasswordInput
            id={`${baseId}-password`}
            autoComplete="new-password"
            placeholder="••••••••"
            displayValue={password.display}
            error={!!displayPasswordError}
            aria-required="true"
            aria-invalid={!!displayPasswordError}
            aria-describedby={`${baseId}-password-error`}
            {...password.inputProps}
            onBlur={() => {
              password.inputProps.onBlur();
              setTouchedPassword(true);
            }}
            onKeyDown={handleKeyDown}
          />
          <FieldError
            id={`${baseId}-password-error`}
            message={displayPasswordError}
          />
        </div>

        {/* Confirm password */}
        <div className="space-y-1">
          <Label htmlFor={`${baseId}-confirm`}>Re-enter password</Label>
          <MaskedPasswordInput
            id={`${baseId}-confirm`}
            autoComplete="new-password"
            placeholder="••••••••"
            displayValue={confirm.display}
            error={!!confirmError}
            aria-required="true"
            aria-invalid={!!confirmError}
            aria-describedby={`${baseId}-confirm-error`}
            {...confirm.inputProps}
            onBlur={() => {
              confirm.inputProps.onBlur();
              setTouchedConfirm(true);
            }}
            onKeyDown={handleKeyDown}
          />
          <FieldError
            id={`${baseId}-confirm-error`}
            message={confirmError}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full mt-2"
          disabled={!allValid || isSubmitting}
          aria-disabled={!allValid || isSubmitting}
        >
          {isSubmitting ? "Creating account…" : "Register"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="text-zinc-300 underline underline-offset-4 hover:text-white transition-colors"
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
