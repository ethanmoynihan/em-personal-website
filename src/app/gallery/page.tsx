import { createClient } from "@/lib/supabase/server";
import { GalleryGrid } from "@/components/GalleryGrid";
import { PageHeader } from "@/components/PageHeader";
import type { Artwork } from "@/lib/supabase/types";

export const metadata = {
  title: "Gallery — Ethan Moynihan",
};

export default async function GalleryPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("artworks")
    .select("*")
    .eq("is_published", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  const artworks = (data ?? []) as Artwork[];

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <PageHeader
        eyebrow="All work"
        title="Gallery"
        description="Every published piece, newest first."
      />
      <GalleryGrid artworks={artworks} />
    </div>
  );
}
