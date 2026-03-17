import * as React from "react";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div
        className={cn(
          "w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl",
          className
        )}
      >
        {children}
      </div>
    </main>
  );
}
