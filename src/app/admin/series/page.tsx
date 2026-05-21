import { requireAdminUser } from "../auth";
import { SeriesForm } from "./SeriesForm";
import { SeriesEditor } from "./SeriesEditor";
import type { Series, Artwork } from "@/lib/supabase/types";

export const metadata = { title: "Admin — Series" };

export default async function AdminSeriesPage() {
  const { supabase } = await requireAdminUser();

  const { data: series } = await supabase
    .from("series")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: artworks } = await supabase
    .from("artworks")
    .select("id, title, series_id, image_path, thumbnail_path");

  const allSeries = (series ?? []) as Series[];
  const allArtworks = (artworks ?? []) as Pick<
    Artwork,
    "id" | "title" | "series_id" | "image_path" | "thumbnail_path"
  >[];

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr]">
      <SeriesForm />

      <section>
        <h2 className="font-display text-xl font-semibold text-ink mb-4">
          All series ({allSeries.length})
        </h2>
        <div className="space-y-4">
          {allSeries.map((s) => (
            <SeriesEditor
              key={s.id}
              series={s}
              candidateCovers={allArtworks.filter(
                (a) => a.series_id === s.id,
              )}
            />
          ))}
          {allSeries.length === 0 && (
            <p className="text-ink/60 italic">No series yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
