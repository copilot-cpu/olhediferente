import { createFileRoute } from "@tanstack/react-router";

import { AdminShell } from "@/components/admin/admin-shell";
import { EmptyState } from "@/components/ds/feedback";

export const Route = createFileRoute("/_authenticated/admin/oferta")({
  head: () => ({ meta: [{ title: "Oferta — Painel OLHE DIFERENTE" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminShell title="Oferta" description="Conteúdo da oferta">
      <EmptyState title="Editor de oferta" description="Será implementado na próxima etapa." />
    </AdminShell>
  ),
});
