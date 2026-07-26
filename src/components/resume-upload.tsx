import { useId, useRef, useState } from "react";
import { FileText, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onChange: (file: File | null) => void;
}

// Simulated upload widget: exposes the picked File to the parent, which will
// eventually POST it via the service layer once the backend contract exists.
export function ResumeUpload({ onChange }: Props) {
  const id = useId();
  const ref = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  const set = (f: File | null) => {
    setFile(f);
    onChange(f);
  };

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-foreground"
      >
        Currículo (PDF ou DOCX)
      </label>
      <input
        ref={ref}
        id={id}
        type="file"
        accept=".pdf,.doc,.docx"
        className="sr-only"
        onChange={(e) => set(e.target.files?.[0] ?? null)}
      />
      {!file ? (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="flex w-full min-h-32 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-input bg-card p-6 text-center text-muted-foreground transition hover:border-primary hover:text-foreground focus-visible:border-primary"
        >
          <Upload className="h-6 w-6" aria-hidden />
          <span className="text-sm font-medium">Toque para selecionar</span>
          <span className="text-xs">até 10 MB</span>
        </button>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
          <FileText
            className="h-5 w-5 shrink-0 text-primary"
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {file.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024).toFixed(0)} KB
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Remover currículo"
            onClick={() => set(null)}
          >
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      )}
    </div>
  );
}
