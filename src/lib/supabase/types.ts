export type Series = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_artwork_id: string | null;
  display_order: number;
  is_published: boolean;
  created_at: string;
};

export type Artwork = {
  id: string;
  series_id: string | null;
  title: string;
  description: string | null;
  medium: string | null;
  year: number | null;
  image_path: string;
  thumbnail_path: string | null;
  width_px: number | null;
  height_px: number | null;
  display_order: number;
  is_published: boolean;
  created_at: string;
};

export type ArtworkWithSeries = Artwork & {
  series: Pick<Series, "id" | "slug" | "title"> | null;
};
