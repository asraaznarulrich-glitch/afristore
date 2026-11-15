import { cn } from "@/lib/utils";

const tones = ["bg-primary text-primary-foreground", "bg-accent text-accent-foreground", "bg-secondary text-secondary-foreground"];

export function AppIcon({ name, url, className }: { name: string; url?: string | null; className?: string }) {
  if (url)
    return <img src={url} alt="" loading="lazy" className={cn("aspect-square rounded-2xl object-cover shadow-sm", className)} />;
  const tone = tones[name.charCodeAt(0) % tones.length];
  return (
    <div className={cn("flex aspect-square items-center justify-center rounded-2xl font-display text-2xl font-bold shadow-sm", tone, className)}>
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}
