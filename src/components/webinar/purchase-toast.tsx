import { cn } from "@/lib/utils";
import type { QueuedToast } from "@/hooks/use-webinar-engine";

/**
 * Aviso discreto exibido durante a aula. Um por vez (fila controlada pela engine),
 * ancorado no canto inferior esquerdo no desktop e acima da área segura no mobile,
 * nunca sobre os controles do player.
 */
export function PurchaseToast({ toast, className }: { toast: QueuedToast | null; className?: string }) {
  return (
    <div
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed inset-x-3 bottom-4 z-40 flex justify-center sm:inset-x-auto sm:bottom-6 sm:left-6 sm:justify-start",
        className,
      )}
    >
      {toast ? (
        <div
          key={toast.key}
          className={cn(
            "animate-in fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none",
            "flex max-w-sm items-center gap-3 rounded-lg border border-primary/25 bg-card/95 px-4 py-3",
            "shadow-[0_20px_50px_-30px_oklch(0.76_0.115_82_/_0.6)] backdrop-blur",
          )}
        >
          <span className="size-1.5 shrink-0 rounded-full bg-primary" />
          <p className="text-sm leading-snug text-foreground/90">
            <span className="font-medium text-primary">{toast.name}</span>{" "}
            <span className="text-muted-foreground">{toast.message}</span>
          </p>
        </div>
      ) : null}
    </div>
  );
}
