import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div className="mx-auto max-w-md px-6 py-20">{children}</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between border-b border-ink/10 pb-4">
        <div className="flex items-center gap-6">
          <h1 className="font-display text-2xl font-semibold text-ink">Admin</h1>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin" className="text-ink/70 hover:text-coral">
              Artworks
            </Link>
            <Link href="/admin/series" className="text-ink/70 hover:text-coral">
              Series
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-ink/60">{user.email}</span>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-full border border-ink/20 px-3 py-1 text-ink/70 hover:border-coral hover:text-coral"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
      {children}
    </div>
  );
}
