import { useEffect } from "react";

import { useSiteSettings } from "@/lib/site-settings";

function setMeta(selector: string, attr: "name" | "property", key: string, content: string) {
  if (!content) return;
  let tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

/**
 * Aplica os campos de compartilhamento definidos no painel (Configurações)
 * sobre o metadata padrão da rota. Sem valor no painel, nada é alterado.
 */
export function SeoFromSettings() {
  const { settings } = useSiteSettings();
  const { ogTitle, ogDescription, ogImage } = settings;

  useEffect(() => {
    if (ogTitle) {
      document.title = ogTitle;
      setMeta('meta[property="og:title"]', "property", "og:title", ogTitle);
      setMeta('meta[name="twitter:title"]', "name", "twitter:title", ogTitle);
    }
    if (ogDescription) {
      setMeta('meta[name="description"]', "name", "description", ogDescription);
      setMeta('meta[property="og:description"]', "property", "og:description", ogDescription);
      setMeta('meta[name="twitter:description"]', "name", "twitter:description", ogDescription);
    }
    if (/^https?:\/\//i.test(ogImage)) {
      setMeta('meta[property="og:image"]', "property", "og:image", ogImage);
      setMeta('meta[name="twitter:image"]', "name", "twitter:image", ogImage);
    }
  }, [ogTitle, ogDescription, ogImage]);

  return null;
}
