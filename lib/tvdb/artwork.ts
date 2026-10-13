const TVDB_ARTWORK_HOST = "https://artworks.thetvdb.com";

export function absoluteImageUrl(
  url: string | undefined | null
): string | null {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${TVDB_ARTWORK_HOST}${url.startsWith("/") ? "" : "/"}${url}`;
}
