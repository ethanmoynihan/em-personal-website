import type { Artwork } from "@/lib/supabase/types";
import { ArtworkCard } from "./ArtworkCard";

export function GalleryGrid({ artworks }: { artworks: Artwork[] }) {
  if (artworks.length === 0) {
    return (
      <p className="text-ink/60 italic">No work to show yet — check back soon.</p>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {artworks.map((a) => (
        <ArtworkCard key={a.id} artwork={a} />
      ))}
    </div>
  );
}
