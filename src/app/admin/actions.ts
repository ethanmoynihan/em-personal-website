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

export async function createArtwork(formData: FormData) {
  const supabase = await requireUser();

  const file = formData.get("image") as File | null;
  if (!file || file.size === 0) {
    throw new Error("No image provided");
  }

  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Title required");

  const description = String(formData.get("description") ?? "").trim() || null;
  const medium = String(formData.get("medium") ?? "").trim() || null;
  const yearStr = String(formData.get("year") ?? "").trim();
  const year = yearStr ? Number(yearStr) : null;
  const seriesId = String(formData.get("series_id") ?? "") || null;
  const widthPx = Number(formData.get("width_px") ?? 0) || null;
  const heightPx = Number(formData.get("height_px") ?? 0) || null;

  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(ARTWORKS_BUCKET)
    .upload(path, file, {
      contentType: file.type || `image/${ext}`,
      cacheControl: "31536000",
    });
  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  const { error: insertError } = await supabase.from("artworks").insert({
    title,
    description,
    medium,
    year,
    series_id: seriesId,
    image_path: path,
    width_px: widthPx,
    height_px: heightPx,
  });
  if (insertError) throw new Error(`Insert failed: ${insertError.message}`);

  revalidatePath("/admin");
  revalidatePath("/gallery");
  revalidatePath("/");
  if (seriesId) revalidatePath(`/series`);
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
