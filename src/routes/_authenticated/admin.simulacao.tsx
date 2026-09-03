import { createFileRoute } from "@tanstack/react-router";

import { AdminShell } from "@/components/admin/admin-shell";
import { EmptyState } from "@/components/ds/feedback";

export const Route = createFileRoute("/_authenticated/admin/simulacao")({
  head: () => ({ meta: [{ title: "Simulação — Painel OLHE DIFERENTE" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminShell title="Simulação" description="Eventos simulados da aula">
      <EmptyState title="Simulação" description="Nenhum evento configurado nesta etapa." />
    </AdminShell>
  ),
});
