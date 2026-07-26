import { cn } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function tone(score: number) {
  if (score >= 80)
    return { bg: "bg-score-good", fg: "text-score-good-foreground", label: "Alto" };
  if (score >= 60)
    return { bg: "bg-score-warn", fg: "text-score-warn-foreground", label: "Médio" };
  return { bg: "bg-score-bad", fg: "text-score-bad-foreground", label: "Baixo" };
}

// AI Score in absolute visual prominence. Circle with the number and a screen-reader label.
export function ScoreRing({ score, size = "md", className }: ScoreRingProps) {
  const t = tone(score);
  const dim =
    size === "lg" ? "h-24 w-24 text-3xl" : size === "sm" ? "h-14 w-14 text-lg" : "h-18 w-18 text-2xl";
  return (
    <div
      role="img"
      aria-label={`AI Score ${score} de 100, faixa ${t.label}`}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold tabular-nums shadow-sm ring-2 ring-background",
        t.bg,
        t.fg,
        dim,
        className,
      )}
      style={size === "md" ? { width: 72, height: 72 } : undefined}
    >
      {Math.round(score)}
    </div>
  );
}
