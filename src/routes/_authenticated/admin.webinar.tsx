import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import {
  AdminCard,
  ConfirmDelete,
  FieldGrid,
  PreviewLink,
  SaveBar,
  TextField,
  type Feedback,
} from "@/components/admin/ui";
import { ErrorState, LoadingState } from "@/components/ds/feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import {
  WEBINAR_SETTINGS_KEY,
  hmsToSeconds,
  mapRow,
  normalizeEmbedUrl,
  secondsToHms,
  webinarDefaults,
} from "@/lib/webinar-settings";
import { normalizeViewerCurve, type ViewerCheckpoint } from "@/lib/viewer-curve";

export const Route = createFileRoute("/_authenticated/admin/webinar")({
  head: () => ({
    meta: [{ title: "Webinar — Painel OLHE DIFERENTE" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminWebinarPage,
});

/** "Isso corresponde a X minutos e Y segundos". */
function describeSeconds(input: string): string | null {
  const seconds = hmsToSeconds(input);
  if (seconds === null) return null;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `Isso corresponde a ${minutes} minuto(s) e ${rest} segundo(s) de vídeo assistido.`;
}

function AdminWebinarPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(webinarDefaults);
  const [revealInput, setRevealInput] = useState(secondsToHms(webinarDefaults.offerRevealSeconds));
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [curve, setCurve] = useState<ViewerCheckpoint[]>(webinarDefaults.viewerCurve);
  const [pointTime, setPointTime] = useState("00:00:00");
  const [pointViewers, setPointViewers] = useState("100");
  const [curveError, setCurveError] = useState<string | null>(null);

  const settingsQuery = useQuery({
    queryKey: ["admin-webinar-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("webinar_settings")
        .select("key,title,video_url,config")
        .eq("key", WEBINAR_SETTINGS_KEY)
        .maybeSingle();
      if (error) throw error;
      return data ?? null;
    },
  });

  useEffect(() => {
    if (settingsQuery.data !== undefined) {
      const mapped = mapRow(settingsQuery.data);
      setForm(mapped);
      setRevealInput(secondsToHms(mapped.offerRevealSeconds));
      setCurve(mapped.viewerCurve);
    }
  }, [settingsQuery.data]);

  const addPoint = () => {
    setCurveError(null);
    const seconds = hmsToSeconds(pointTime);
    if (seconds === null) {
      setCurveError("Informe o horário no formato HH:MM:SS.");
      return;
    }
    const viewers = Number(pointViewers);
    if (!Number.isInteger(viewers) || viewers < 0) {
      setCurveError("A quantidade deve ser um número inteiro maior ou igual a zero.");
      return;
    }
    if (curve.some((point) => point.time === seconds)) {
      setCurveError("Já existe um ponto neste segundo.");
      return;
    }
    setCurve((points) => [...points, { time: seconds, viewers }].sort((a, b) => a.time - b.time));
  };

  const save = useMutation({
    mutationFn: async () => {
      const url = normalizeEmbedUrl(form.videoEmbedUrl);
      if (!url) throw new Error("Informe uma URL de vídeo válida (começando com https://).");

      const revealSeconds = hmsToSeconds(revealInput);
      if (revealSeconds === null) throw new Error("Informe o tempo da oferta no formato HH:MM:SS.");

      const existingConfig =
        settingsQuery.data?.config && typeof settingsQuery.data.config === "object"
          ? (settingsQuery.data.config as Record<string, unknown>)
          : {};

      const { error } = await supabase.from("webinar_settings").upsert(
        {
          key: WEBINAR_SETTINGS_KEY,
          title: form.lessonTitle.trim() || webinarDefaults.lessonTitle,
          video_url: url,
          is_active: true,
          config: {
            ...existingConfig,
            broadcast_label: form.broadcastLabel.trim() || webinarDefaults.broadcastLabel,
            teacher_name: form.teacherName.trim() || webinarDefaults.teacherName,
            lesson_subtitle: form.lessonSubtitle.trim() || webinarDefaults.lessonSubtitle,
            offer_reveal_seconds: revealSeconds,
            disable_forward: form.disableForward,
            simulation_mode: form.simulationMode,
            playback_speed: 1,
            viewer_counter_enabled: form.viewerCounterEnabled,
            viewer_simulation_enabled: form.viewerSimulationEnabled,
            viewer_label: form.viewerLabel.trim() || webinarDefaults.viewerLabel,
            viewer_curve: normalizeViewerCurve(curve),
          },
        },
        { onConflict: "key" },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      setFeedback({ type: "ok", message: "Alterações salvas." });
      void queryClient.invalidateQueries({ queryKey: ["admin-webinar-settings"] });
      void queryClient.invalidateQueries({ queryKey: ["webinar-settings"] });
    },
    onError: (error: unknown) =>
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Não foi possível salvar.",
      }),
  });

  if (settingsQuery.isLoading) {
    return (
      <AdminShell title="Webinar" description="Configurações da transmissão">
        <LoadingState label="Carregando configurações" />
      </AdminShell>
    );
  }

  if (settingsQuery.isError) {
    return (
      <AdminShell title="Webinar" description="Configurações da transmissão">
        <ErrorState description="Não foi possível carregar as configurações da transmissão." />
      </AdminShell>
    );
  }

  const revealHint = describeSeconds(revealInput);
  const isTestReveal = (hmsToSeconds(revealInput) ?? 0) < 120;

  return (
    <AdminShell title="Webinar" description="Configurações da transmissão">
      <form
        className="space-y-8"
        onSubmit={(event) => {
          event.preventDefault();
          setFeedback(null);
          save.mutate();
        }}
      >
        <div className="flex flex-wrap gap-2">
          <PreviewLink to="/aula" label="ABRIR AULA" />
          <PreviewLink to="/admin/preview" label="PRÉ-VISUALIZAR OFERTA" />
        </div>

        <AdminCard title="Vídeo" description="Origem e identificação da aula.">
          <TextField
            label="URL do vídeo Panda"
            placeholder="https://player-vz-....tv.pandavideo.com.br/embed/?v=..."
            value={form.videoEmbedUrl}
            onChange={(v) => setForm((f) => ({ ...f, videoEmbedUrl: v }))}
          />
          <FieldGrid>
            <TextField
              label="Título da aula"
              value={form.lessonTitle}
              onChange={(v) => setForm((f) => ({ ...f, lessonTitle: v }))}
            />
            <TextField
              label="Nome do professor"
              value={form.teacherName}
              onChange={(v) => setForm((f) => ({ ...f, teacherName: v }))}
            />
          </FieldGrid>
          <FieldGrid>
            <TextField
              label="Texto de status da transmissão"
              value={form.broadcastLabel}
              onChange={(v) => setForm((f) => ({ ...f, broadcastLabel: v }))}
            />
            <TextField
              label="Formato exibido ao lado do título"
              value={form.lessonSubtitle}
              onChange={(v) => setForm((f) => ({ ...f, lessonSubtitle: v }))}
            />
          </FieldGrid>
        </AdminCard>

        <AdminCard title="Comportamento do vídeo">
          <div className="flex items-start justify-between gap-4 rounded-md border border-border/60 px-4 py-3">
            <div className="pr-4">
              <Label htmlFor="forward">Bloquear avanço do vídeo</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Remove a barra de progresso e mantém play/pause, volume e tela cheia.
              </p>
            </div>
            <Switch
              id="forward"
              checked={form.disableForward}
              onCheckedChange={(checked) => setForm((f) => ({ ...f, disableForward: checked }))}
            />
          </div>

          <div className="rounded-md border border-border/60 px-4 py-3">
            <p className="text-sm font-medium text-foreground">Velocidade de reprodução</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Fixada em 1x: o menu de velocidade não fica disponível para o participante.
            </p>
          </div>
        </AdminCard>

        <AdminCard
          title="Momento da oferta"
          description="A oferta só aparece quando o tempo realmente assistido atinge este momento."
        >
          <TextField
            label="Momento da oferta (HH:MM:SS)"
            placeholder="01:04:00"
            hint={revealHint ?? "Formato inválido. Use HH:MM:SS."}
            value={revealInput}
            onChange={setRevealInput}
          />
          {isTestReveal ? (
            <p className="rounded-md border border-primary/40 bg-primary/10 px-4 py-3 text-xs text-foreground">
              Atenção: este é um tempo de teste. Salvo assim, qualquer participante verá a oferta
              logo no início da aula. Restaure o horário definitivo ao terminar os testes.
            </p>
          ) : null}
        </AdminCard>

        <AdminCard
          title="Simulação"
          description="Notificações simuladas de inscrição durante a aula."
        >
          <div className="flex items-start justify-between gap-4 rounded-md border border-border/60 px-4 py-3">
            <div className="pr-4">
              <Label htmlFor="simulation">Notificações simuladas</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Quando desligado, nenhum evento simulado é exibido na aula.
              </p>
            </div>
            <Switch
              id="simulation"
              checked={form.simulationMode}
              onCheckedChange={(checked) => setForm((f) => ({ ...f, simulationMode: checked }))}
            />
          </div>
          <PreviewLink to="/admin/simulacao" label="GERENCIAR EVENTOS" />
        </AdminCard>

        <AdminCard
          title="Audiência"
          description="Camada visual de atividade. Hoje usa apenas dados simulados, independentes das notificações."
        >
          <div className="flex items-center justify-between gap-4 rounded-md border border-border/60 px-4 py-3">
            <Label htmlFor="viewer-on">Exibir contador de audiência</Label>
            <Switch
              id="viewer-on"
              checked={form.viewerCounterEnabled}
              onCheckedChange={(checked) =>
                setForm((f) => ({ ...f, viewerCounterEnabled: checked }))
              }
            />
          </div>
          <div className="flex items-center justify-between gap-4 rounded-md border border-border/60 px-4 py-3">
            <Label htmlFor="viewer-sim">Usar audiência simulada</Label>
            <Switch
              id="viewer-sim"
              checked={form.viewerSimulationEnabled}
              onCheckedChange={(checked) =>
                setForm((f) => ({ ...f, viewerSimulationEnabled: checked }))
              }
            />
          </div>
          <TextField
            label="Texto do contador"
            placeholder="pessoas acompanhando"
            value={form.viewerLabel}
            onChange={(v) => setForm((f) => ({ ...f, viewerLabel: v }))}
          />

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Curva de audiência</p>
            {curve.length === 0 ? (
              <p className="rounded-md border border-dashed border-border px-4 py-3 text-xs text-muted-foreground">
                Nenhum ponto configurado. A aula usará a curva padrão.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[320px] text-sm">
                  <thead>
                    <tr className="text-overline text-muted-foreground">
                      <th className="py-1 text-left">Horário</th>
                      <th className="py-1 text-left">Pessoas</th>
                      <th className="py-1 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {curve.map((point) => (
                      <tr key={point.time} className="border-t border-border/40">
                        <td className="py-1.5 tabular-nums">{secondsToHms(point.time)}</td>
                        <td className="py-1.5">
                          <Input
                            className="h-8 w-24"
                            aria-label={`Pessoas em ${secondsToHms(point.time)}`}
                            value={String(point.viewers)}
                            inputMode="numeric"
                            onChange={(e) => {
                              const viewers = Number(e.target.value);
                              setCurve((points) =>
                                points.map((p) =>
                                  p.time === point.time
                                    ? {
                                        ...p,
                                        viewers:
                                          Number.isFinite(viewers) && viewers >= 0
                                            ? Math.floor(viewers)
                                            : 0,
                                      }
                                    : p,
                                ),
                              );
                            }}
                          />
                        </td>
                        <td className="py-1.5 text-right">
                          <ConfirmDelete
                            title="Excluir ponto da curva?"
                            description={`O ponto de ${secondsToHms(point.time)} será removido.`}
                            onConfirm={() =>
                              setCurve((points) => points.filter((p) => p.time !== point.time))
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex flex-wrap items-end gap-2">
              <div className="space-y-1">
                <Label htmlFor="point-time">Horário</Label>
                <Input
                  id="point-time"
                  className="h-9 w-32"
                  value={pointTime}
                  onChange={(e) => setPointTime(e.target.value)}
                  placeholder="00:10:00"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="point-viewers">Pessoas</Label>
                <Input
                  id="point-viewers"
                  className="h-9 w-28"
                  value={pointViewers}
                  inputMode="numeric"
                  onChange={(e) => setPointViewers(e.target.value)}
                />
              </div>
              <Button type="button" variant="quiet" size="sm" onClick={addPoint}>
                <Plus className="size-4" /> ADICIONAR PONTO
              </Button>
            </div>
            {curveError ? <p className="text-xs text-destructive">{curveError}</p> : null}
          </div>
        </AdminCard>

        <AdminCard
          title="Ferramentas de teste"
          description="Atalhos para conferir a aula antes de divulgar. Qualquer valor aqui só passa a valer depois de salvar — e afeta também o público."
        >
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="quiet"
              size="sm"
              onClick={() => {
                setRevealInput("00:00:15");
                setForm((f) => ({
                  ...f,
                  simulationMode: true,
                  viewerCounterEnabled: true,
                  viewerSimulationEnabled: true,
                }));
                setFeedback({
                  type: "error",
                  message:
                    "Configuração de teste preenchida no formulário. Ela só vale para o público depois que você salvar.",
                });
              }}
            >
              PREENCHER CONFIGURAÇÃO DE TESTE
            </Button>
            <Button
              type="button"
              variant="quiet"
              size="sm"
              onClick={() => {
                setRevealInput(secondsToHms(webinarDefaults.offerRevealSeconds));
                setFeedback({
                  type: "ok",
                  message: "Momento da oferta restaurado para 01:04:00. Salve para aplicar.",
                });
              }}
            >
              RESTAURAR MOMENTO PADRÃO (01:04:00)
            </Button>
            <PreviewLink to="/admin/preview" label="PRÉ-VISUALIZAR OFERTA" />
          </div>
        </AdminCard>

        <SaveBar pending={save.isPending} feedback={feedback} />
      </form>
    </AdminShell>
  );
}
