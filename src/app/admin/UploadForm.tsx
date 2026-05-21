"use client";

import { useRef, useState } from "react";
import { createArtworkRecord, deleteArtworkFile } from "./actions";
import { createClient } from "@/lib/supabase/client";
import { ARTWORKS_BUCKET } from "@/lib/supabase/storage";
import type { Series } from "@/lib/supabase/types";

type Preview = {
  url: string;
  width: number;
  height: number;
  file: File;
};

export function UploadForm({ series }: { series: Pick<Series, "id" | "title">[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFile(file: File) {
    setError(null);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setPreview({ url, width: img.naturalWidth, height: img.naturalHeight, file });
    };
    img.src = url;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!preview) {
      setError("Pick an image first");
      return;
    }
    const form = e.currentTarget;
    const fd = new FormData(form);
    const title = String(fd.get("title") ?? "").trim();
    if (!title) {
      setError("Title required");
      return;
    }

    setBusy(true);
    setError(null);

    const file = preview.file;
    const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
    const path = `${crypto.randomUUID()}.${ext}`;
    const supabase = createClient();

    try {
      setProgress("Uploading image…");
      const { error: uploadError } = await supabase.storage
        .from(ARTWORKS_BUCKET)
        .upload(path, file, {
          contentType: file.type || `image/${ext}`,
          cacheControl: "31536000",
        });
      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      setProgress("Saving…");
      try {
        await createArtworkRecord({
          title,
          description: String(fd.get("description") ?? "").trim() || null,
          medium: String(fd.get("medium") ?? "").trim() || null,
          year: fd.get("year") ? Number(fd.get("year")) : null,
          series_id: String(fd.get("series_id") ?? "") || null,
          image_path: path,
          width_px: preview.width,
          height_px: preview.height,
        });
      } catch (insertErr) {
        // Roll back the orphaned file if the DB write fails.
        await deleteArtworkFile(path).catch(() => {});
        throw insertErr;
      }

      form.reset();
      setPreview(null);
      setProgress(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setProgress(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="rounded-lg border border-ink/10 bg-white/40 p-6"
    >
      <h2 className="font-display text-xl font-semibold text-ink mb-4">
        Upload a painting
      </h2>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        className={`relative rounded-md border-2 border-dashed p-6 text-center transition-colors ${
          dragOver ? "border-coral bg-coral/5" : "border-ink/20 bg-ink/[0.02]"
        }`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview.url}
            alt="preview"
            className="mx-auto max-h-72 w-auto rounded"
          />
        ) : (
          <p className="text-ink/60">
            Drop an image here, or{" "}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-coral underline"
            >
              choose a file
            </button>
          </p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        {preview && (
          <p className="mt-3 text-xs text-ink/50">
            {preview.width} × {preview.height} px ·{" "}
            {(preview.file.size / (1024 * 1024)).toFixed(1)} MB
          </p>
        )}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Title" name="title" required />
        <Field label="Year" name="year" type="number" />
        <Field label="Medium" name="medium" placeholder="Oil on canvas" />
        <label className="block">
          <span className="block text-sm font-medium text-ink/80 mb-1">
            Series
          </span>
          <select
            name="series_id"
            className="w-full rounded-md border border-ink/15 bg-white/60 px-3 py-2 text-ink focus:border-coral focus:outline-none"
            defaultValue=""
          >
            <option value="">— No series —</option>
            {series.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </label>
      </div>

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

      {progress && <p className="mt-4 text-sm text-ink/70">{progress}</p>}
      {error && <p className="mt-4 text-sm text-coral">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream hover:bg-coral transition-colors disabled:opacity-50"
      >
        {busy ? "Working…" : "Publish"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink/80 mb-1">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-md border border-ink/15 bg-white/60 px-3 py-2 text-ink focus:border-coral focus:outline-none"
      />
    </label>
  );
}
