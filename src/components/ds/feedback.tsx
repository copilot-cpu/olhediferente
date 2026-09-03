import type { ReactNode } from "react";
import { Loader2, AlertTriangle, Inbox, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingState({ label = "Carregando", className }: { label?: string; className?: string }) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-center justify-center gap-3 rounded-md border border-border/60 bg-card/40 px-6 py-10 text-sm text-muted-foreground",
        className,
      )}
    >
      <Loader2 className="size-4 animate-spin text-primary" />
      {label}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-md border border-dashed border-border bg-card/30 px-6 py-12 text-center",
        className,
      )}
    >
      <Inbox className="size-5 text-primary/70" />
      <h3 className="text-heading text-foreground">{title}</h3>
      {description ? <p className="max-w-md text-sm text-muted-foreground">{description}</p> : null}
      {action}
    </div>
  );
}

export function ErrorState({
  title = "Algo não carregou",
  description,
  action,
  className,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center gap-3 rounded-md border border-destructive/40 bg-destructive/10 px-6 py-10 text-center",
        className,
      )}
    >
      <AlertTriangle className="size-5 text-destructive" />
      <h3 className="text-heading text-foreground">{title}</h3>
      {description ? <p className="max-w-md text-sm text-muted-foreground">{description}</p> : null}
      {action}
    </div>
  );
}

export function SuccessState({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-md border border-primary/40 bg-primary/10 px-6 py-10 text-center",
        className,
      )}
    >
      <CheckCircle2 className="size-5 text-primary" />
      <h3 className="text-heading text-foreground">{title}</h3>
      {description ? <p className="max-w-md text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}
