import { createFileRoute } from "@tanstack/react-router";

import { AdminShell } from "@/components/admin/admin-shell";
import { EmptyState } from "@/components/ds/feedback";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — Painel OLHE DIFERENTE" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminShell title="Dashboard" description="Visão geral do sistema">
      <EmptyState
        title="Fundação pronta"
        description="Os indicadores serão adicionados nas próximas etapas."
      />
    </AdminShell>
  ),
});
