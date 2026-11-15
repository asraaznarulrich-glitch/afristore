import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({ value, size = 14, onChange }: { value: number; size?: number; onChange?: (v: number) => void }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(i)}
          aria-label={`${i}`}
          className={cn(!onChange && "cursor-default", onChange && "p-1")}
        >
          <Star style={{ width: size, height: size }} className={cn(i <= Math.round(value) ? "fill-star text-star" : "text-border")} />
        </button>
      ))}
    </span>
  );
}
