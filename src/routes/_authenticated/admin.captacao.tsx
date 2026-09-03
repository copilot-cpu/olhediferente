import { createFileRoute } from "@tanstack/react-router";

import { AdminShell } from "@/components/admin/admin-shell";
import { EmptyState } from "@/components/ds/feedback";

export const Route = createFileRoute("/_authenticated/admin/captacao")({
  head: () => ({ meta: [{ title: "Captação — Painel OLHE DIFERENTE" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminShell title="Captação" description="Conteúdo da página de captação">
      <EmptyState title="Editor de captação" description="Será implementado na próxima etapa." />
    </AdminShell>
  ),
});
