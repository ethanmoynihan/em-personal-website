import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { GalleryGrid } from "@/components/GalleryGrid";
import type { Artwork } from "@/lib/supabase/types";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("artworks")
    .select("*")
    .eq("is_published", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(6);

  const featured = (data ?? []) as Artwork[];

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <section className="mb-20">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-coral">
          Paintings
        </p>
        <h1 className="font-display text-5xl sm:text-7xl font-semibold tracking-tight text-ink leading-[1.05] max-w-3xl">
          Work by{" "}
          <span className="text-coral">Ethan Moynihan</span>.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-ink/70 leading-relaxed">
          A small, ongoing collection of paintings. Organized into series, with
          new work added as it&apos;s finished.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/gallery"
            className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-coral"
          >
            See the gallery
          </Link>
          <Link
            href="/series"
            className="rounded-full border border-ink/20 px-6 py-3 text-sm font-medium text-ink transition-colors hover:border-coral hover:text-coral"
          >
            Browse series
          </Link>
        </div>
      </section>

      {featured.length > 0 && (
        <section>
          <div className="mb-8 flex items-baseline justify-between">
            <h2 className="font-display text-3xl font-semibold text-ink">
              Recent work
            </h2>
            <Link
              href="/gallery"
              className="text-sm font-medium text-ink/70 hover:text-coral"
            >
              View all →
            </Link>
          </div>
          <GalleryGrid artworks={featured} />
        </section>
      )}
    </div>
  );
}
