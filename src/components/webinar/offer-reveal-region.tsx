import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Região reservada para a futura oferta.
 * Enquanto `offerUnlocked` for false, nada é renderizado (sem placeholder visível).
 */
export function OfferRevealRegion({
  offerUnlocked = false,
  className,
  children,
}: {
  offerUnlocked?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  if (!offerUnlocked) return null;
  return (
    <section
      id="oferta"
      className={cn(
        "mt-8 animate-in fade-in slide-in-from-bottom-3 duration-700 motion-reduce:animate-none",
        "rounded-xl border border-primary/25 bg-card/50 px-6 py-8 text-center",
        className,
      )}
    >
      {children ?? (
        <>
          <p className="font-display text-xl text-foreground sm:text-2xl">
            Conteúdo da formação liberado.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Continue abaixo para conhecer os detalhes.
          </p>
        </>
      )}
    </section>
  );
}
