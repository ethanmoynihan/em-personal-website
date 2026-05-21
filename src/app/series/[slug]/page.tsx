import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GalleryGrid } from "@/components/GalleryGrid";
import { PageHeader } from "@/components/PageHeader";
import type { Artwork, Series } from "@/lib/supabase/types";

export default async function SeriesDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: series } = await supabase
    .from("series")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!series) notFound();
  const s = series as Series;

  const { data: pieces } = await supabase
    .from("artworks")
    .select("*")
    .eq("series_id", s.id)
    .eq("is_published", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <PageHeader
        eyebrow="Series"
        title={s.title}
        description={s.description}
      />
      <GalleryGrid artworks={(pieces ?? []) as Artwork[]} />
    </div>
  );
}
