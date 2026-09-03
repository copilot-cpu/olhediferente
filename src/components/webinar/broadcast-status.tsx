import { cn } from "@/lib/utils";

/** Indicador discreto do estado da transmissão. Texto vem de `webinar_settings`. */
export function BroadcastStatus({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5",
        "font-sans text-[0.68rem] uppercase tracking-[0.22em] text-primary",
        className,
      )}
    >
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-2 animate-ping rounded-full bg-primary/60 motion-reduce:hidden" />
        <span className="relative inline-flex size-2 rounded-full bg-primary" />
      </span>
      {label}
    </span>
  );
}
