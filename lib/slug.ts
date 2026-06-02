import slugify from "slugify";

export function makeListingSlug(title: string, id: string): string {
  const base = slugify(title, { lower: true, strict: true, locale: "vi" });
  const shortId = id.slice(-6).toUpperCase();
  return `${base}-ID${shortId}`;
}

export function idFromSlug(slug: string): string | null {
  const match = slug.match(/-ID([A-Z0-9]{6})$/);
  return match ? match[1] : null;
}
