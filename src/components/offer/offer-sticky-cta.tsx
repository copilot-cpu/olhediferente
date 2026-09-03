import { cn } from "@/lib/utils";

/**
 * CTA fixo apenas no mobile. Só é renderizado depois que a oferta é revelada
 * E que o usuário já entrou na área da oferta (sentinela em `offer-section`),
 * ficando abaixo do PurchaseToast na pilha (z-30 vs. z-40).
 */
export function OfferStickyCta({
  visible,
  title,
  price,
  cta,
  checkoutUrl,
}: {
  visible: boolean;
  title: string;
  price: string;
  cta: string;
  checkoutUrl: string;
}) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t border-primary/20 bg-forest-deep/95 backdrop-blur md:hidden",
        "pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 transition-transform duration-300 motion-reduce:transition-none",
        visible ? "translate-y-0" : "pointer-events-none translate-y-full",
      )}
      aria-hidden={!visible}
    >
      <div className="mx-auto flex w-full max-w-lg items-center gap-3 px-4">
        <div className="min-w-0 flex-1">
          <p className="truncate font-sans text-[0.7rem] leading-tight text-muted-foreground">
            {title}
          </p>
          {price ? (
            <p className="font-display text-base leading-tight text-primary">{price}</p>
          ) : null}
        </div>
        {checkoutUrl ? (
          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-md bg-primary px-4 py-3 font-sans text-[0.68rem] font-medium uppercase tracking-[0.12em] text-primary-foreground"
            tabIndex={visible ? 0 : -1}
          >
            {cta}
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="shrink-0 cursor-not-allowed rounded-md border border-primary/30 bg-primary/10 px-4 py-3 font-sans text-[0.68rem] font-medium uppercase tracking-[0.12em] text-primary/70"
          >
            CHECKOUT A CONFIGURAR
          </button>
        )}
      </div>
    </div>
  );
}
