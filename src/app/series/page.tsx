import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import { publicImageUrl } from "@/lib/supabase/storage";
import type { Series, Artwork } from "@/lib/supabase/types";

export const metadata = {
  title: "Series — Ethan Moynihan",
};

type SeriesWithCover = Series & {
  cover: Pick<Artwork, "id" | "image_path" | "thumbnail_path" | "width_px" | "height_px"> | null;
};

export default async function SeriesIndexPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("series")
    .select(
      "*, cover:cover_artwork_id(id, image_path, thumbnail_path, width_px, height_px)",
    )
    .eq("is_published", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  const series = (data ?? []) as SeriesWithCover[];

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <PageHeader
        eyebrow="Bodies of work"
        title="Series"
        description="Paintings grouped by theme or period."
      />

      {series.length === 0 ? (
        <p className="text-ink/60 italic">No series published yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2">
          {series.map((s) => (
            <Link
              key={s.id}
              href={`/series/${s.slug}`}
              className="group block"
            >
              {s.cover && (
                <div className="relative overflow-hidden rounded-sm bg-ink/5">
                  <Image
                    src={publicImageUrl(
                      s.cover.thumbnail_path ?? s.cover.image_path,
                    )}
                    alt={s.title}
                    width={s.cover.width_px ?? 1600}
                    height={s.cover.height_px ?? 1200}
                    className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    sizes="(min-width: 640px) 50vw, 100vw"
                  />
                </div>
              )}
              <h2 className="mt-4 font-display text-2xl text-ink group-hover:text-coral transition-colors">
                {s.title}
              </h2>
              {s.description && (
                <p className="mt-2 text-ink/70 leading-relaxed">
                  {s.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
