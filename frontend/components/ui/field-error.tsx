import * as React from "react";
import { cn } from "@/lib/utils";

interface FieldErrorProps {
  id: string;
  message: string | null | undefined;
  className?: string;
}

/**
 * Renders a validation error message below a form field.
 * Always occupies vertical space (via min-height) so layout doesn't shift
 * when messages appear or disappear.
 */
export function FieldError({ id, message, className }: FieldErrorProps) {
  return (
    <p
      id={id}
      role="alert"
      aria-live="polite"
      className={cn(
        "min-h-[1.25rem] text-xs text-red-400 mt-1",
        className
      )}
    >
      {message ?? ""}
    </p>
  );
}
