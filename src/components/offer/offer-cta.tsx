import { cn } from "@/lib/utils";

/**
 * CTA da oferta. Sem `checkout_url` configurada, o botão fica desabilitado
 * (nunca aponta para "#" nem quebra a navegação pública).
 */
export function OfferCta({
  label,
  checkoutUrl,
  className,
  size = "default",
}: {
  label: string;
  checkoutUrl: string;
  className?: string;
  size?: "default" | "compact";
}) {
  const base = cn(
    "inline-flex w-full items-center justify-center rounded-md text-center font-sans font-medium uppercase tracking-[0.14em] transition",
    size === "compact" ? "px-4 py-3 text-[0.7rem]" : "px-6 py-4 text-xs sm:text-sm",
    className,
  );

  if (!checkoutUrl) {
    return (
      <button
        type="button"
        disabled
        className={cn(base, "cursor-not-allowed border border-primary/30 bg-primary/10 text-primary/70")}
      >
        CHECKOUT A CONFIGURAR
      </button>
    );
  }

  return (
    <a
      href={checkoutUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        base,
        "bg-primary text-primary-foreground shadow-[0_18px_45px_-24px_oklch(0.76_0.115_82_/_0.9)] hover:bg-gold-soft",
      )}
    >
      {label}
    </a>
  );
}
