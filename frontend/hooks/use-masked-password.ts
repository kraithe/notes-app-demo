"use client";

import { useState, useCallback, useRef } from "react";

const BULLET = "•";

/**
 * Manages display and real value for a custom password masking field.
 *
 * Because the input is type="text" with a controlled value (bullets + last
 * char), `e.target.value` from onChange reflects what the browser produced
 * from editing the *displayed* bullet string — not the real password.
 *
 * Strategy: we compare the new displayed length against the previous real
 * password length to detect insertions vs deletions, then reconstruct the
 * real password accordingly.
 *
 * - Typing a character: new display is longer by 1; the last char of the
 *   new display is the newly typed character; prepend bullets for all
 *   existing chars.
 * - Deletion (backspace/delete/selection): new display is shorter; just
 *   truncate the real password to the new length. This correctly handles
 *   single-char and selection-range deletions.
 * - Pasting: treat paste as multiple insertions — the browser inserts the
 *   pasted text into the display string. We read the non-bullet characters
 *   from the new display value as the pasted payload and append to the
 *   real password.
 */
export function useMaskedPassword() {
  const [value, setValue] = useState("");
  const [display, setDisplay] = useState("");

  const maskTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Keep a ref to the current real value so the timer closure sees it.
  const valueRef = useRef("");

  const clearMaskTimer = useCallback(() => {
    if (maskTimer.current !== null) {
      clearTimeout(maskTimer.current);
      maskTimer.current = null;
    }
  }, []);

  const masked = (n: number) => BULLET.repeat(n);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDisplay = e.target.value;
      const prevReal = valueRef.current;

      clearMaskTimer();

      if (newDisplay.length === 0) {
        valueRef.current = "";
        setValue("");
        setDisplay("");
        return;
      }

      let newReal: string;

      if (newDisplay.length <= prevReal.length) {
        // Deletion or replacement — truncate real password to new length.
        newReal = prevReal.slice(0, newDisplay.length);
      } else {
        // Insertion — extract the non-bullet portion that was added.
        // The new characters are those in newDisplay that aren't bullets.
        // They can appear anywhere (e.g. cursor was mid-string) but because
        // we always re-render as bullets+lastChar the only plain text is
        // at the insertion position.
        const addedChars = newDisplay
          .split("")
          .filter((ch) => ch !== BULLET)
          .join("");

        if (addedChars.length > 0) {
          // Append the inserted characters to the real password.
          // For mid-cursor inserts: newDisplay length tells us the new
          // total length; the added chars are the delta.
          const delta = newDisplay.length - prevReal.length;
          const inserted = addedChars.slice(-delta); // take the last `delta` real chars
          newReal = prevReal + inserted;
        } else {
          // Shouldn't normally happen but fall back gracefully.
          newReal = prevReal;
        }
      }

      valueRef.current = newReal;
      setValue(newReal);

      if (newReal.length === 0) {
        setDisplay("");
        return;
      }

      // Reveal the last character, mask the rest.
      setDisplay(masked(newReal.length - 1) + newReal[newReal.length - 1]);

      maskTimer.current = setTimeout(() => {
        setDisplay(masked(valueRef.current.length));
      }, 800);
    },
    [clearMaskTimer]
  );

  const handleFocus = useCallback(() => {
    // nothing extra needed on focus
  }, []);

  const handleBlur = useCallback(() => {
    clearMaskTimer();
    setDisplay(masked(valueRef.current.length));
  }, [clearMaskTimer]);

  const reset = useCallback(() => {
    clearMaskTimer();
    valueRef.current = "";
    setValue("");
    setDisplay("");
  }, [clearMaskTimer]);

  return {
    value,
    display,
    reset,
    inputProps: {
      value: display,
      onChange: handleChange,
      onFocus: handleFocus,
      onBlur: handleBlur,
    },
  };
}
