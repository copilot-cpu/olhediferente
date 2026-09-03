import { createFileRoute } from "@tanstack/react-router";

import { AdminShell } from "@/components/admin/admin-shell";
import { EmptyState } from "@/components/ds/feedback";

export const Route = createFileRoute("/_authenticated/admin/webinar")({
  head: () => ({ meta: [{ title: "Webinar — Painel OLHE DIFERENTE" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminShell title="Webinar" description="Configurações da transmissão">
      <EmptyState title="Configurações do webinar" description="Serão implementadas na próxima etapa." />
    </AdminShell>
  ),
});
