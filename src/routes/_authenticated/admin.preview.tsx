import { createFileRoute } from "@tanstack/react-router";

import { AdminShell } from "@/components/admin/admin-shell";
import { OfferSection } from "@/components/offer/offer-section";
import { PreviewLink } from "@/components/admin/ui";

export const Route = createFileRoute("/_authenticated/admin/preview")({
  head: () => ({
    meta: [
      { title: "Pré-visualização da oferta — Painel OLHE DIFERENTE" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminOfferPreviewPage,
});

/**
 * Pré-visualização interna da oferta.
 * Usa exatamente os mesmos componentes da aula, mas vive dentro do admin
 * protegido: não existe parâmetro público de desbloqueio.
 */
function AdminOfferPreviewPage() {
  return (
    <AdminShell
      title="Pré-visualização da oferta"
      description="Visível apenas para administradores. O público continua vendo a oferta somente após o momento configurado na aula."
    >
      <div className="mb-6 flex flex-wrap gap-2">
        <PreviewLink to="/aula" label="ABRIR AULA" />
      </div>
      <div className="overflow-hidden rounded-lg border border-border/60 bg-background">
        <OfferSection />
      </div>
    </AdminShell>
  );
}
