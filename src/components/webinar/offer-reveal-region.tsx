import type { ReactNode } from "react";

/**
 * Região reservada para a futura oferta.
 * Enquanto `offerUnlocked` for false, nada é renderizado (sem placeholder visível).
 */
export function OfferRevealRegion({
  offerUnlocked = false,
  children,
}: {
  offerUnlocked?: boolean;
  children?: ReactNode;
}) {
  if (!offerUnlocked) return null;
  return <section id="oferta">{children}</section>;
}
