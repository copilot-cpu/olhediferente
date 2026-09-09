import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCard, PreviewLink } from "@/components/admin/ui";
import { ErrorState, LoadingState } from "@/components/ds/feedback";
import { Button } from "@/components/ui/button";
import { getOfferPreviewToken, rotateOfferPreviewToken } from "@/lib/offer-preview.functions";

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
 * Gestão do link secreto de pré-visualização.
 * A página aberta pelo link mostra a aula com a oferta já liberada,
 * sem alterar o comportamento normal de `/aula`.
 */
function AdminOfferPreviewPage() {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const tokenQuery = useQuery({
    queryKey: ["offer-preview-token"],
    queryFn: () => getOfferPreviewToken(),
  });

  const rotate = useMutation({
    mutationFn: () => rotateOfferPreviewToken(),
    onSuccess: (data) => {
      queryClient.setQueryData(["offer-preview-token"], data);
      setCopied(false);
    },
  });

  const token = tokenQuery.data?.token ?? "";
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const link = token ? `${origin}/previa/${token}` : "";

  return (
    <AdminShell
      title="Pré-visualização da oferta"
      description="Link secreto com a aula e a oferta completa liberada. Compartilhe apenas com quem precisa revisar."
    >
      <AdminCard title="Link secreto">
        {tokenQuery.isLoading ? (
          <LoadingState />
        ) : tokenQuery.isError ? (
          <ErrorState message="Não foi possível carregar o link." />
        ) : (
          <div className="space-y-4">
            <div className="break-all rounded-md border border-border/60 bg-muted/30 px-4 py-3 font-mono text-sm">
              {link}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText(link).then(() => setCopied(true));
                }}
              >
                {copied ? "LINK COPIADO" : "COPIAR LINK"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <a href={link} target="_blank" rel="noreferrer">
                  ABRIR EM NOVA ABA
                </a>
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={rotate.isPending}
                onClick={() => {
                  if (window.confirm("Gerar um novo link? O link anterior deixa de funcionar."))
                    rotate.mutate();
                }}
              >
                {rotate.isPending ? "GERANDO..." : "GERAR NOVO LINK"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Quem abrir o link vê a página completa: vídeo da aula e, logo abaixo, toda a oferta —
              sem precisar de senha e sem aparecer em buscas.
            </p>
          </div>
        )}
      </AdminCard>

      <div className="mt-6 flex flex-wrap gap-2">
        <PreviewLink to="/aula" label="ABRIR AULA" />
      </div>
    </AdminShell>
  );
}
