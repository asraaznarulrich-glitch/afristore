import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("h-9 w-9 shrink-0", className)} aria-hidden="true">
      <rect width="64" height="64" rx="15" className="fill-primary" />
      <path d="M17 50 L32 13 L47 50" fill="none" stroke="#fff" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 34 H43" className="stroke-accent" strokeWidth="6" strokeLinecap="round" />
      <path d="M25.5 37.5 H38.5 L32 46 Z" className="fill-accent stroke-accent" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

/** variant "dark" = dark text for light backgrounds; "light" = white text for dark backgrounds */
export function Logo({ variant = "dark", className }: { variant?: "dark" | "light"; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span
        className={cn(
          "font-display text-xl font-extrabold tracking-tight",
          variant === "dark" ? "text-foreground" : "text-primary-foreground",
        )}
      >
        Afri<span className={variant === "dark" ? "text-primary" : "text-accent"}>store</span>
      </span>
    </span>
  );
}
