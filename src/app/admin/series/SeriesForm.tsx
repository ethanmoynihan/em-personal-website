"use client";

import { useState } from "react";
import { createSeries } from "../actions";

export function SeriesForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");

  function slugify(s: string) {
    return s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData(e.currentTarget);
      await createSeries(fd);
      setTitle("");
      setSlug("");
      (e.currentTarget as HTMLFormElement).reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-lg border border-ink/10 bg-white/40 p-6"
    >
      <h2 className="font-display text-xl font-semibold text-ink mb-4">
        New series
      </h2>

      <label className="block">
        <span className="block text-sm font-medium text-ink/80 mb-1">Title</span>
        <input
          name="title"
          required
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setSlug(slugify(e.target.value));
          }}
          className="w-full rounded-md border border-ink/15 bg-white/60 px-3 py-2 text-ink focus:border-coral focus:outline-none"
        />
      </label>

      <label className="mt-4 block">
        <span className="block text-sm font-medium text-ink/80 mb-1">
          Slug{" "}
          <span className="text-ink/40 font-normal">
            (url, e.g. /series/winter-light)
          </span>
        </span>
        <input
          name="slug"
          required
          value={slug}
          onChange={(e) => setSlug(slugify(e.target.value))}
          className="w-full rounded-md border border-ink/15 bg-white/60 px-3 py-2 text-ink focus:border-coral focus:outline-none"
        />
      </label>

      <label className="mt-4 block">
        <span className="block text-sm font-medium text-ink/80 mb-1">
          Description
        </span>
        <textarea
          name="description"
          rows={3}
          className="w-full rounded-md border border-ink/15 bg-white/60 px-3 py-2 text-ink focus:border-coral focus:outline-none"
        />
      </label>

      {error && <p className="mt-4 text-sm text-coral">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream hover:bg-coral transition-colors disabled:opacity-50"
      >
        {busy ? "Creating…" : "Create series"}
      </button>
    </form>
  );
}
