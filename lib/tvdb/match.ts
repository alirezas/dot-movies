import { getSearchResults, type SearchResult } from "@/lib/tvdb/generated";

export function normalizeTitle(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/**
 * Finds the TVDB movie for a library title and release year:
 * 1. an exact title match among results for that exact year
 * 2. an exact title match within ±1 year, since TVDB's year filter is exact
 *    and Letterboxd and TVDB sometimes disagree by a year
 * Throws when neither exists: TVDB's top result alone is usually a
 * different film with a similar name, and no match beats a wrong one.
 */
export async function findTvdbMovie(
  movieTitle: string,
  movieYear: number | null
): Promise<SearchResult> {
  const title = normalizeTitle(movieTitle);

  const search = async (year?: number) => {
    const searchQuery = await getSearchResults({
      query: { query: movieTitle, year, type: "movie", limit: 10 },
      throwOnError: true,
    });
    return searchQuery.data?.data ?? [];
  };

  const yearMatches = (result: SearchResult) =>
    !movieYear ||
    !result.year ||
    Math.abs(Number(result.year) - movieYear) <= 1;

  // TVDB's `name` is often the original-language title, so also check the
  // English translation and aliases
  const titleMatches = (result: SearchResult) =>
    [result.name, result.translations?.eng, ...(result.aliases ?? [])].some(
      (name) => name && normalizeTitle(name) === title
    );

  const yearResults = await search(movieYear || undefined);
  const exactYearMatch = yearResults.find(titleMatches);
  if (exactYearMatch) return exactYearMatch;

  if (movieYear) {
    const anyYearResults = await search();
    const nearYearMatch = anyYearResults.find(
      (r) => yearMatches(r) && titleMatches(r)
    );
    if (nearYearMatch) return nearYearMatch;
  }

  const closest = yearResults[0];
  throw new Error(
    closest
      ? `No exact title match (closest: ${closest.name} (${closest.year}))`
      : "No movie found"
  );
}
