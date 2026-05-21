"use client";

import { useState, useTransition } from "react";
import { deleteSeries, updateSeries } from "../actions";
import type { Series, Artwork } from "@/lib/supabase/types";

export function SeriesEditor({
  series,
  candidateCovers,
}: {
  series: Series;
  candidateCovers: Pick<Artwork, "id" | "title">[];
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    start(async () => {
      try {
        await updateSeries(series.id, fd);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed");
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-lg border border-ink/10 bg-white/40 p-4"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Title" name="title" defaultValue={series.title} required />
        <Field label="Slug" name="slug" defaultValue={series.slug} required />
      </div>
      <label className="mt-3 block">
        <span className="block text-xs uppercase tracking-widest text-ink/50 mb-1">
          Description
        </span>
        <textarea
          name="description"
          rows={2}
          defaultValue={series.description ?? ""}
          className="w-full rounded-md border border-ink/15 bg-white/60 px-3 py-2 text-sm text-ink focus:border-coral focus:outline-none"
        />
      </label>

      <label className="mt-3 block">
        <span className="block text-xs uppercase tracking-widest text-ink/50 mb-1">
          Cover painting
        </span>
        <select
          name="cover_artwork_id"
          defaultValue={series.cover_artwork_id ?? ""}
          className="w-full rounded-md border border-ink/15 bg-white/60 px-3 py-2 text-sm text-ink focus:border-coral focus:outline-none"
        >
          <option value="">— None —</option>
          {candidateCovers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </label>

      {error && <p className="mt-3 text-sm text-coral">{error}</p>}

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-cream hover:bg-coral transition-colors disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => {
            if (
              !confirm(
                "Delete this series? Paintings will remain but become unassigned.",
              )
            )
              return;
            start(() => deleteSeries(series.id));
          }}
          disabled={pending}
          className="rounded-full border border-ink/20 px-4 py-1.5 text-xs text-ink/70 hover:border-coral hover:text-coral disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-widest text-ink/50 mb-1">
        {label}
      </span>
      <input
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded-md border border-ink/15 bg-white/60 px-3 py-2 text-sm text-ink focus:border-coral focus:outline-none"
      />
    </label>
  );
}
