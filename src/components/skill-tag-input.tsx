import { useId, useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface Props {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}

export function SkillTagInput({ label, value, onChange, placeholder }: Props) {
  const id = useId();
  const liveId = `${id}-live`;
  const [draft, setDraft] = useState("");

  const add = (raw: string) => {
    const v = raw.trim();
    if (!v) return;
    if (value.includes(v)) return;
    onChange([...value, v]);
    setDraft("");
  };

  const remove = (t: string) => onChange(value.filter((v) => v !== t));

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(draft);
    } else if (e.key === "Backspace" && !draft && value.length) {
      remove(value[value.length - 1]);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="rounded-md border border-input bg-card p-2 focus-within:border-primary">
        {value.length > 0 && (
          <ul className="mb-2 flex flex-wrap gap-1.5" aria-label={`${label} adicionadas`}>
            {value.map((t) => (
              <li key={t}>
                <Badge className="gap-1 pr-1 font-normal">
                  <span>{t}</span>
                  <button
                    type="button"
                    aria-label={`Remover ${t}`}
                    onClick={() => remove(t)}
                    className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded hover:bg-primary-foreground/20"
                  >
                    <X className="h-3 w-3" aria-hidden />
                  </button>
                </Badge>
              </li>
            ))}
          </ul>
        )}
        <Input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          onBlur={() => add(draft)}
          placeholder={placeholder ?? "Digite e pressione Enter"}
          aria-describedby={liveId}
          className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
      <span id={liveId} aria-live="polite" className="sr-only">
        {value.length} {label.toLowerCase()} adicionadas
      </span>
    </div>
  );
}
