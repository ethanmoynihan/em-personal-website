import Image from "next/image";
import { requireAdminUser } from "./auth";
import { publicImageUrl } from "@/lib/supabase/storage";
import { UploadForm } from "./UploadForm";
import { ArtworkRow } from "./ArtworkRow";
import type { Artwork, Series } from "@/lib/supabase/types";

export const metadata = { title: "Admin — Artworks" };

export default async function AdminHomePage() {
  const { supabase } = await requireAdminUser();

  const [{ data: artworks }, { data: series }] = await Promise.all([
    supabase
      .from("artworks")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("series")
      .select("id, title")
      .order("title", { ascending: true }),
  ]);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
      <UploadForm series={(series ?? []) as Pick<Series, "id" | "title">[]} />

      <section>
        <h2 className="font-display text-xl font-semibold text-ink mb-4">
          All artworks ({artworks?.length ?? 0})
        </h2>
        <div className="space-y-3">
          {(artworks ?? []).map((a) => {
            const piece = a as Artwork;
            return (
              <div
                key={piece.id}
                className="flex items-center gap-4 rounded-lg border border-ink/10 bg-white/40 p-3"
              >
                <Image
                  src={publicImageUrl(piece.thumbnail_path ?? piece.image_path)}
                  alt={piece.title}
                  width={80}
                  height={80}
                  className="h-16 w-16 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink truncate">{piece.title}</p>
                  <p className="text-xs text-ink/60">
                    {piece.year ?? "—"}
                    {piece.medium ? ` · ${piece.medium}` : ""}
                    {piece.is_published ? "" : " · draft"}
                  </p>
                </div>
                <ArtworkRow id={piece.id} isPublished={piece.is_published} />
              </div>
            );
          })}
          {(!artworks || artworks.length === 0) && (
            <p className="text-ink/60 italic">No artworks yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
