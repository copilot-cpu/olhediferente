import { createFileRoute } from "@tanstack/react-router";

import { AdminShell } from "@/components/admin/admin-shell";
import { EmptyState } from "@/components/ds/feedback";

export const Route = createFileRoute("/_authenticated/admin/leads")({
  head: () => ({ meta: [{ title: "Leads — Painel OLHE DIFERENTE" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminShell title="Leads" description="Inscritos capturados">
      <EmptyState title="Lista de leads" description="A listagem será implementada na próxima etapa." />
    </AdminShell>
  ),
});
