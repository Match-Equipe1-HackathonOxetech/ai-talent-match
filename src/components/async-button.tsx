import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AsyncButtonProps extends ButtonProps {
  loading?: boolean;
  loadingLabel?: string;
}

// Standard action button: disables immediately + shows a spinner while pending.
export const AsyncButton = forwardRef<HTMLButtonElement, AsyncButtonProps>(
  (
    { loading = false, loadingLabel, disabled, children, className, ...rest },
    ref,
  ) => {
    return (
      <Button
        ref={ref}
        aria-busy={loading || undefined}
        disabled={loading || disabled}
        className={cn("min-h-11", className)}
        {...rest}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            <span>{loadingLabel ?? "Processando..."}</span>
          </>
        ) : (
          children
        )}
      </Button>
    );
  },
);
AsyncButton.displayName = "AsyncButton";
