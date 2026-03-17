"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface MaskedPasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value"> {
  /** The display string produced by useMaskedPassword */
  displayValue: string;
  error?: boolean;
}

/**
 * A text input styled as a password field.
 * Receives the pre-computed display string from useMaskedPassword and
 * forwards all remaining handlers (onChange, onFocus, onBlur) to the hook.
 */
const MaskedPasswordInput = React.forwardRef<
  HTMLInputElement,
  MaskedPasswordInputProps
>(({ displayValue, error, className, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      // Use type="text" so we can control exactly what the user sees.
      // autocomplete is still set to "current-password" / "new-password"
      // by the caller via the autoComplete prop.
      type="text"
      inputMode="text"
      value={displayValue}
      spellCheck={false}
      autoCorrect="off"
      autoCapitalize="off"
      className={cn(
        "font-mono tracking-widest",
        error && "border-red-500 focus:ring-red-500",
        className
      )}
      {...props}
    />
  );
});
MaskedPasswordInput.displayName = "MaskedPasswordInput";

export { MaskedPasswordInput };
