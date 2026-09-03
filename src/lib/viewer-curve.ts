/**
 * Curva de audiência SIMULADA.
 *
 * Este módulo produz exclusivamente dados simulados para prototipagem visual.
 * Ele nunca deve ser misturado com compras reais, analytics ou métricas de uso.
 *
 * A contagem é uma função determinística do `currentTime` real do player:
 * o mesmo tempo produz sempre o mesmo valor (interpolação linear entre
 * checkpoints + uma oscilação pseudoaleatória estável).
 */

export type ViewerCheckpoint = {
  /** Segundos de vídeo. */
  time: number;
  /** Pessoas na sala neste momento. */
  viewers: number;
};

export const defaultViewerCurve: ViewerCheckpoint[] = [
  { time: 0, viewers: 118 },
  { time: 300, viewers: 164 },
  { time: 600, viewers: 213 },
  { time: 1200, viewers: 287 },
  { time: 1800, viewers: 342 },
  { time: 2400, viewers: 319 },
  { time: 3000, viewers: 361 },
  { time: 3600, viewers: 338 },
  { time: 3900, viewers: 374 },
  { time: 4200, viewers: 321 },
  { time: 4800, viewers: 286 },
  { time: 5400, viewers: 243 },
];

/** Intervalo (em segundos de vídeo) em que o número é recalculado visualmente. */
export const VIEWER_UPDATE_STEP = 5;

/** Normaliza, ordena e remove checkpoints inválidos ou duplicados no mesmo segundo. */
export function normalizeViewerCurve(raw: unknown): ViewerCheckpoint[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<number>();
  const points: ViewerCheckpoint[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const time = Math.floor(Number(record["time"]));
    const viewers = Math.floor(Number(record["viewers"]));
    if (!Number.isFinite(time) || time < 0) continue;
    if (!Number.isFinite(viewers) || viewers < 0) continue;
    if (seen.has(time)) continue;
    seen.add(time);
    points.push({ time, viewers });
  }
  return points.sort((a, b) => a.time - b.time);
}

/** Hash determinístico simples (sem Math.random) para a oscilação. */
function noiseAt(bucket: number): number {
  let x = Math.sin(bucket * 12.9898) * 43758.5453;
  x = x - Math.floor(x); // 0..1
  return x * 2 - 1; // -1..1
}

/**
 * Valor interpolado da curva no tempo indicado, com pequena oscilação
 * determinística (±1%) para evitar aparência mecânica.
 */
export function viewerCountAt(
  curve: ViewerCheckpoint[],
  currentTime: number,
  step = VIEWER_UPDATE_STEP,
): number | null {
  if (!curve.length) return null;
  const time = Number.isFinite(currentTime) ? Math.max(0, currentTime) : 0;
  const bucket = Math.floor(time / Math.max(1, step));
  const quantized = bucket * Math.max(1, step);

  const first = curve[0]!;
  const last = curve[curve.length - 1]!;
  let base: number;
  if (quantized <= first.time) base = first.viewers;
  else if (quantized >= last.time) base = last.viewers;
  else {
    let previous = first;
    let next = last;
    for (let i = 0; i < curve.length - 1; i += 1) {
      const a = curve[i]!;
      const b = curve[i + 1]!;
      if (quantized >= a.time && quantized <= b.time) {
        previous = a;
        next = b;
        break;
      }
    }
    const span = next.time - previous.time;
    const ratio = span > 0 ? (quantized - previous.time) / span : 0;
    base = previous.viewers + (next.viewers - previous.viewers) * ratio;
  }

  const amplitude = Math.max(1, Math.round(base * 0.01));
  const value = Math.round(base + noiseAt(bucket) * amplitude);
  return Math.max(0, value);
}
