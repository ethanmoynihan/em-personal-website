"use client";

import { useTransition } from "react";
import { deleteArtwork, togglePublishArtwork } from "./actions";

export function ArtworkRow({
  id,
  isPublished,
}: {
  id: string;
  isPublished: boolean;
}) {
  const [pending, start] = useTransition();
  return (
    <div className="flex gap-2">
      <button
        onClick={() => start(() => togglePublishArtwork(id, !isPublished))}
        disabled={pending}
        className="rounded-full border border-ink/20 px-3 py-1 text-xs text-ink/70 hover:border-coral hover:text-coral disabled:opacity-50"
      >
        {isPublished ? "Unpublish" : "Publish"}
      </button>
      <button
        onClick={() => {
          if (!confirm("Delete this artwork? This cannot be undone.")) return;
          start(() => deleteArtwork(id));
        }}
        disabled={pending}
        className="rounded-full border border-ink/20 px-3 py-1 text-xs text-ink/70 hover:border-coral hover:text-coral disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
