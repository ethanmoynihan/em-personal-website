const BUCKET = "artworks";

export function publicImageUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return "";
  return `${base}/storage/v1/object/public/${BUCKET}/${path}`;
}

export const ARTWORKS_BUCKET = BUCKET;
