import { createFileRoute } from "@tanstack/react-router";

import { AdminShell } from "@/components/admin/admin-shell";
import { EmptyState } from "@/components/ds/feedback";

export const Route = createFileRoute("/_authenticated/admin/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — Painel OLHE DIFERENTE" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminShell title="Configurações" description="Ajustes gerais do site">
      <EmptyState title="Configurações" description="Serão implementadas na próxima etapa." />
    </AdminShell>
  ),
});
