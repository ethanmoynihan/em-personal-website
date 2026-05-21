import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { publicImageUrl } from "@/lib/supabase/storage";
import type { ArtworkWithSeries, Artwork } from "@/lib/supabase/types";

export default async function ArtworkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: artwork } = await supabase
    .from("artworks")
    .select("*, series:series_id(id, slug, title)")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();

  if (!artwork) notFound();
  const piece = artwork as ArtworkWithSeries;

  // Prev/next within the same series if it has one, otherwise across all pieces.
  const baseQuery = supabase
    .from("artworks")
    .select("id, title, display_order, created_at")
    .eq("is_published", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  const { data: siblings } = piece.series_id
    ? await baseQuery.eq("series_id", piece.series_id)
    : await baseQuery;

  const list = (siblings ?? []) as Pick<Artwork, "id" | "title">[];
  const idx = list.findIndex((a) => a.id === piece.id);
  const prev = idx > 0 ? list[idx - 1] : null;
  const next = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="relative mx-auto bg-ink/5">
        <Image
          src={publicImageUrl(piece.image_path)}
          alt={piece.title}
          width={piece.width_px ?? 2000}
          height={piece.height_px ?? 2000}
          className="h-auto w-full object-contain"
          sizes="(min-width: 1024px) 64rem, 100vw"
          priority
        />
      </div>

      <div className="mt-10 grid gap-10 md:grid-cols-3">
        <div className="md:col-span-2">
          <h1 className="font-display text-4xl font-semibold text-ink">
            {piece.title}
          </h1>
          {piece.description && (
            <p className="mt-5 text-lg text-ink/75 leading-relaxed whitespace-pre-wrap">
              {piece.description}
            </p>
          )}
        </div>

        <aside className="space-y-4 text-sm">
          {piece.medium && (
            <Detail label="Medium" value={piece.medium} />
          )}
          {piece.year && (
            <Detail label="Year" value={String(piece.year)} />
          )}
          {piece.width_px && piece.height_px && (
            <Detail
              label="Dimensions"
              value={`${piece.width_px} × ${piece.height_px} px`}
            />
          )}
          {piece.series && (
            <div>
              <p className="text-xs uppercase tracking-widest text-ink/50">
                Series
              </p>
              <Link
                href={`/series/${piece.series.slug}`}
                className="mt-1 inline-block font-medium text-ink hover:text-coral"
              >
                {piece.series.title}
              </Link>
            </div>
          )}
        </aside>
      </div>

      {(prev || next) && (
        <nav className="mt-16 flex items-center justify-between border-t border-ink/10 pt-6 text-sm">
          {prev ? (
            <Link
              href={`/gallery/${prev.id}`}
              className="text-ink/70 hover:text-coral"
            >
              ← {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/gallery/${next.id}`}
              className="text-ink/70 hover:text-coral text-right"
            >
              {next.title} →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-ink/50">{label}</p>
      <p className="mt-1 text-ink">{value}</p>
    </div>
  );
}
