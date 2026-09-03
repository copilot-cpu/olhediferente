import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import {
  defaultViewerCurve,
  normalizeViewerCurve,
  type ViewerCheckpoint,
} from "@/lib/viewer-curve";

export const WEBINAR_SETTINGS_KEY = "main";

export type WebinarSettings = {
  /** Título da aula (coluna `title`). */
  lessonTitle: string;
  /** URL de embed do player Panda (coluna `video_url`). */
  videoEmbedUrl: string;
  /** Texto do status da transmissão (`config.broadcast_label`). */
  broadcastLabel: string;
  /** Nome do professor (`config.teacher_name`). */
  teacherName: string;
  /** Linha de apoio da identificação (`config.lesson_subtitle`). */
  lessonSubtitle: string;
  /** Segundos até liberar a oferta (`config.offer_reveal_seconds`). */
  offerRevealSeconds: number;
  /** Modo de simulação (`config.simulation_mode`). */
  simulationMode: boolean;
  /** Bloqueia avanço manual via `disableForward` do Panda (`config.disable_forward`). */
  disableForward: boolean;
  /** Velocidade padrão do player (`config.playback_speed`). Nesta versão sempre 1. */
  playbackSpeed: number;
  /** Exibe a camada de atividade/audiência (`config.viewer_counter_enabled`). */
  viewerCounterEnabled: boolean;
  /**
   * Usa audiência SIMULADA a partir da curva (`config.viewer_simulation_enabled`).
   * Independente de `simulation_mode` (notificações de compra).
   */
  viewerSimulationEnabled: boolean;
  /** Texto ao lado do número (`config.viewer_label`). */
  viewerLabel: string;
  /** Curva de audiência simulada (`config.viewer_curve`). */
  viewerCurve: ViewerCheckpoint[];
};

export const webinarDefaults: WebinarSettings = {
  lessonTitle: "OLHE DIFERENTE",
  videoEmbedUrl:
    "https://player-vz-234cad63-6f8.tv.pandavideo.com.br/embed/?v=3c9224ad-dbf6-46ae-ad6d-ed09ff0db18a",
  broadcastLabel: "AULA EM ANDAMENTO",
  teacherName: "Marcos Dias",
  lessonSubtitle: "Aula online gratuita",
  offerRevealSeconds: 3840,
  simulationMode: false,
  disableForward: true,
  playbackSpeed: 1,
  viewerCounterEnabled: false,
  viewerSimulationEnabled: false,
  viewerLabel: "pessoas acompanhando",
  viewerCurve: defaultViewerCurve,
};

/** Converte "HH:MM:SS" (ou "MM:SS") em segundos. Retorna null se inválido. */
export function hmsToSeconds(value: string): number | null {
  const parts = String(value).trim().split(":");
  if (parts.length < 2 || parts.length > 3) return null;
  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isFinite(n) || n < 0)) return null;
  const [h, m, s] = parts.length === 3 ? nums : [0, ...nums];
  return (h as number) * 3600 + (m as number) * 60 + (s as number);
}

/** Converte segundos em "HH:MM:SS". */
export function secondsToHms(total: number): string {
  const value = Math.max(0, Math.floor(Number(total) || 0));
  const h = Math.floor(value / 3600);
  const m = Math.floor((value % 3600) / 60);
  const s = value % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

/**
 * Remove aspas, %22 e espaços acidentais que possam ter sido salvos junto da URL,
 * e garante que só URLs http(s) sejam usadas no iframe.
 */
export function normalizeEmbedUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let value = String(raw).trim();
  value = value.replace(/%22/gi, "").replace(/["'`\s]/g, "");
  if (!/^https?:\/\//i.test(value)) return null;
  try {
    return new URL(value).toString();
  } catch {
    return null;
  }
}

/** Controles do player quando o avanço manual está bloqueado (sem progress/fast-forward/settings). */
const LOCKED_CONTROLS = "play-large,play,current-time,volume,captions,pip,fullscreen,airplay";

/**
 * Monta a URL final do embed aplicando os parâmetros oficiais do Panda
 * (https://docs.pandavideo.com/reference/query-params) sem duplicar valores já presentes.
 */
export function buildPlayerUrl(
  rawUrl: string | null | undefined,
  options: { disableForward: boolean; playbackSpeed: number },
): string | null {
  const base = normalizeEmbedUrl(rawUrl);
  if (!base) return null;
  const url = new URL(base);
  const setIfAbsent = (key: string, value: string) => {
    if (!url.searchParams.has(key)) url.searchParams.set(key, value);
  };

  if (options.disableForward) {
    url.searchParams.set("disableForward", "true");
    setIfAbsent("controls", LOCKED_CONTROLS);
  }
  // `defaultSpeed` é o parâmetro oficial; sem o controle `settings` o menu de
  // velocidade não fica disponível para o usuário.
  url.searchParams.set("defaultSpeed", String(options.playbackSpeed || 1));
  return url.toString();
}

type Row = {
  key: string;
  title: string | null;
  video_url: string | null;
  config: unknown;
};

export function mapRow(row: Row | null | undefined): WebinarSettings {
  const config =
    row?.config && typeof row.config === "object" && !Array.isArray(row.config)
      ? (row.config as Record<string, unknown>)
      : {};

  const str = (key: string, fallback: string) =>
    typeof config[key] === "string" && (config[key] as string).trim()
      ? (config[key] as string).trim()
      : fallback;

  return {
    lessonTitle: row?.title?.trim() || webinarDefaults.lessonTitle,
    videoEmbedUrl: normalizeEmbedUrl(row?.video_url) ?? webinarDefaults.videoEmbedUrl,
    broadcastLabel: str("broadcast_label", webinarDefaults.broadcastLabel),
    teacherName: str("teacher_name", webinarDefaults.teacherName),
    lessonSubtitle: str("lesson_subtitle", webinarDefaults.lessonSubtitle),
    offerRevealSeconds:
      typeof config["offer_reveal_seconds"] === "number"
        ? (config["offer_reveal_seconds"] as number)
        : webinarDefaults.offerRevealSeconds,
    simulationMode: config["simulation_mode"] === true,
    disableForward: config["disable_forward"] === false ? false : true,
    playbackSpeed:
      typeof config["playback_speed"] === "number" && (config["playback_speed"] as number) > 0
        ? (config["playback_speed"] as number)
        : webinarDefaults.playbackSpeed,
    viewerCounterEnabled: config["viewer_counter_enabled"] === true,
    viewerSimulationEnabled: config["viewer_simulation_enabled"] === true,
    viewerLabel: str("viewer_label", webinarDefaults.viewerLabel),
    viewerCurve: (() => {
      const curve = normalizeViewerCurve(config["viewer_curve"]);
      return curve.length ? curve : webinarDefaults.viewerCurve;
    })(),
  };
}

/** Configuração pública da transmissão (leitura permitida pelo RLS para registros ativos). */
export function useWebinarSettings() {
  const query = useQuery({
    queryKey: ["webinar-settings", WEBINAR_SETTINGS_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("webinar_settings")
        .select("key,title,video_url,config")
        .eq("key", WEBINAR_SETTINGS_KEY)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as Row | null;
    },
    staleTime: 60 * 1000,
    retry: 1,
  });

  return {
    settings: mapRow(query.data),
    isLoading: query.isLoading,
    hasRow: Boolean(query.data),
  };
}
