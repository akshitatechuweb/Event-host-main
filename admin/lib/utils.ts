import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generic helpers for case-insensitive, partial text search across multiple fields
export type SearchableField = string | number | null | undefined;

/**
 * Filters a list of items by a free-text query across multiple string/number fields.
 * - Case-insensitive
 * - Partial matching (substring)
 * - Ignores null/undefined fields
 */
export function filterBySearchQuery<T>(
  items: T[],
  query: string,
  getFields: (item: T) => SearchableField[]
): T[] {
  const trimmed = query.trim();
  if (!trimmed) return items;

  const loweredQuery = trimmed.toLowerCase();

  return items.filter((item) => {
    const fields = getFields(item);

    return fields.some((field) => {
      if (field === null || field === undefined) return false;
      const value = String(field).toLowerCase();
      return value.includes(loweredQuery);
    });
  });
}
export function formatImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;

  // Resolve relative /uploads paths to the production backend by default
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://api.unrealvibe.com";
  const trimmed = url.startsWith("/") ? url : `/${url}`;
  return `${baseUrl}${trimmed}`;
}
