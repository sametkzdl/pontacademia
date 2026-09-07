/**
 * Resolves a storage key, absolute URL, or relative URL into a browser-loadable image URL.
 */
export function getPhotoUrl(urlOrKey?: string | null): string | null {
  if (!urlOrKey || typeof urlOrKey !== "string" || !urlOrKey.trim()) return null;
  const trimmed = urlOrKey.trim();
  if (
    trimmed.startsWith("http://") || 
    trimmed.startsWith("https://") || 
    trimmed.startsWith("data:") || 
    trimmed.startsWith("/api/")
  ) {
    return trimmed;
  }
  return `/api/storage/file?key=${encodeURIComponent(trimmed)}`;
}
