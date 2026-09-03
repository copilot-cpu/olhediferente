import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

/**
 * Imagens administráveis.
 *
 * O valor guardado no banco é sempre um texto curto:
 * - `media://<caminho>` quando o arquivo foi enviado pelo admin (bucket `media`);
 * - uma URL http(s) quando o cliente prefere apontar para uma imagem externa.
 *
 * Nunca guardamos base64.
 */

export const MEDIA_BUCKET = "media";
export const MEDIA_PREFIX = "media://";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/svg+xml",
];

export function isStorageRef(value: string | null | undefined): boolean {
  return typeof value === "string" && value.startsWith(MEDIA_PREFIX);
}

export function storagePath(value: string): string {
  return value.slice(MEDIA_PREFIX.length);
}

function safeHttpUrl(value: string): string | null {
  if (!/^https?:\/\//i.test(value)) return null;
  try {
    return new URL(value).toString();
  } catch {
    return null;
  }
}

/** Valida o arquivo antes do upload. Retorna a mensagem de erro ou null. */
export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "Formato não suportado. Envie JPG, PNG, WEBP, AVIF ou SVG.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "A imagem excede 5 MB. Envie um arquivo menor.";
  }
  return null;
}

function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Envia a imagem para o bucket privado e devolve a referência `media://...`. */
export async function uploadImage(file: File, folder: string): Promise<string> {
  const invalid = validateImageFile(file);
  if (invalid) throw new Error(invalid);

  const path = `${folder}/${Date.now()}-${slugify(file.name) || "imagem"}`;
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
  if (error) throw new Error(error.message);
  return `${MEDIA_PREFIX}${path}`;
}

/** Remove o arquivo do bucket (ignora valores que não são do storage). */
export async function removeImage(value: string | null | undefined): Promise<void> {
  if (!isStorageRef(value)) return;
  await supabase.storage.from(MEDIA_BUCKET).remove([storagePath(value as string)]);
}

/** Resolve a referência guardada para uma URL exibível. */
export async function resolveMediaUrl(value: string | null | undefined): Promise<string | null> {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return null;
  if (!isStorageRef(raw)) return safeHttpUrl(raw);

  const { data, error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .createSignedUrl(storagePath(raw), 60 * 60 * 6);
  if (error) return null;
  return data?.signedUrl ?? null;
}

/** Hook de leitura: devolve a URL final da imagem (ou null enquanto resolve). */
export function useMediaUrl(value: string | null | undefined): string | null {
  const raw = typeof value === "string" ? value.trim() : "";
  const { data } = useQuery({
    queryKey: ["media-url", raw],
    enabled: Boolean(raw),
    queryFn: () => resolveMediaUrl(raw),
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });

  if (!raw) return null;
  if (!isStorageRef(raw)) return safeHttpUrl(raw);
  return data ?? null;
}
