import { useMemo } from "react";

import {
  VIEWER_UPDATE_STEP,
  viewerCountAt,
  type ViewerCheckpoint,
} from "@/lib/viewer-curve";

/**
 * Audiência SIMULADA derivada do `currentTime` real do player.
 *
 * Não há relógio próprio, `Date.now`, intervalo ou aleatoriedade por render:
 * o valor é uma função pura do tempo do vídeo, recalculada apenas quando o
 * tempo cruza um novo passo de {@link VIEWER_UPDATE_STEP} segundos. Se o vídeo
 * pausa, o `currentTime` para e a progressão para junto.
 */
export function useSimulatedAudience({
  enabled,
  currentTime,
  curve,
}: {
  enabled: boolean;
  currentTime: number;
  curve: ViewerCheckpoint[];
}): number | null {
  const bucket = Math.floor(Math.max(0, currentTime) / VIEWER_UPDATE_STEP);

  return useMemo(() => {
    if (!enabled) return null;
    return viewerCountAt(curve, bucket * VIEWER_UPDATE_STEP);
    // `bucket` (e não `currentTime`) é a dependência: evita recálculo por frame.
  }, [enabled, curve, bucket]);
}
