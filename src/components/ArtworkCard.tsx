import Image from "next/image";
import Link from "next/link";
import type { Artwork } from "@/lib/supabase/types";
import { publicImageUrl } from "@/lib/supabase/storage";

export function ArtworkCard({ artwork }: { artwork: Artwork }) {
  const src = publicImageUrl(artwork.thumbnail_path ?? artwork.image_path);
  const width = artwork.width_px ?? 1200;
  const height = artwork.height_px ?? 1200;

  return (
    <Link
      href={`/gallery/${artwork.id}`}
      className="group block focus:outline-none"
    >
      <div className="relative overflow-hidden rounded-sm bg-ink/5">
        <Image
          src={src}
          alt={artwork.title}
          width={width}
          height={height}
          className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-4">
        <h3 className="font-display text-lg text-ink group-hover:text-coral transition-colors">
          {artwork.title}
        </h3>
        {artwork.year && (
          <span className="text-sm text-ink/50 tabular-nums">{artwork.year}</span>
        )}
      </div>
    </Link>
  );
}
