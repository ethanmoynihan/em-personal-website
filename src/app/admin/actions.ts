"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ARTWORKS_BUCKET } from "@/lib/supabase/storage";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return redirect(`/admin/login?error=${encodeURIComponent(error.message)}`);
  }
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return supabase;
}

export async function createArtworkRecord(input: {
  title: string;
  description: string | null;
  medium: string | null;
  year: number | null;
  series_id: string | null;
  image_path: string;
  width_px: number | null;
  height_px: number | null;
}) {
  const supabase = await requireUser();

  if (!input.title.trim()) throw new Error("Title required");
  if (!input.image_path) throw new Error("Image path required");

  const { error } = await supabase.from("artworks").insert({
    title: input.title.trim(),
    description: input.description,
    medium: input.medium,
    year: input.year,
    series_id: input.series_id,
    image_path: input.image_path,
    width_px: input.width_px,
    height_px: input.height_px,
  });
  if (error) throw new Error(`Insert failed: ${error.message}`);

  revalidatePath("/admin");
  revalidatePath("/gallery");
  revalidatePath("/");
  if (input.series_id) revalidatePath(`/series`);
}

// Used to clean up an uploaded file when the DB insert fails after the upload.
export async function deleteArtworkFile(path: string) {
  const supabase = await requireUser();
  await supabase.storage.from(ARTWORKS_BUCKET).remove([path]);
}

export async function togglePublishArtwork(id: string, isPublished: boolean) {
  const supabase = await requireUser();
  const { error } = await supabase
    .from("artworks")
    .update({ is_published: isPublished })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath("/gallery");
}

export async function deleteArtwork(id: string) {
  const supabase = await requireUser();
  const { data: piece } = await supabase
    .from("artworks")
    .select("image_path, thumbnail_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("artworks").delete().eq("id", id);
  if (error) throw new Error(error.message);

  if (piece?.image_path) {
    const paths = [piece.image_path];
    if (piece.thumbnail_path) paths.push(piece.thumbnail_path);
    await supabase.storage.from(ARTWORKS_BUCKET).remove(paths);
  }

  revalidatePath("/admin");
  revalidatePath("/gallery");
}

export async function createSeries(formData: FormData) {
  const supabase = await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;

  if (!title || !slug) throw new Error("Title and slug required");

  const { error } = await supabase
    .from("series")
    .insert({ title, slug, description });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/series");
  revalidatePath("/series");
}

export async function updateSeries(id: string, formData: FormData) {
  const supabase = await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const coverId = String(formData.get("cover_artwork_id") ?? "") || null;

  const { error } = await supabase
    .from("series")
    .update({ title, slug, description, cover_artwork_id: coverId })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/series");
  revalidatePath("/series");
  revalidatePath(`/series/${slug}`);
}

export async function deleteSeries(id: string) {
  const supabase = await requireUser();
  const { error } = await supabase.from("series").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/series");
  revalidatePath("/series");
}
