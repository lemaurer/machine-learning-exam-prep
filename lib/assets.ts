export function resolveAssetUrl(source?: string) {
  if (!source) return undefined;
  if (/^(?:data:|blob:|https?:\/\/)/i.test(source)) return source;
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  const normalized = source.startsWith("/") ? source : `/${source}`;
  return `${base}${normalized}` || normalized;
}

