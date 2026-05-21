import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signIn } from "../actions";

export const metadata = { title: "Sign in — Admin" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/admin");

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink mb-6">
        Sign in
      </h1>
      <form action={signIn} className="space-y-4">
        <Field label="Email" name="email" type="email" required />
        <Field label="Password" name="password" type="password" required />
        {error && (
          <p className="text-sm text-coral">{error}</p>
        )}
        <button
          type="submit"
          className="w-full rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream hover:bg-coral transition-colors"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type,
  required,
}: {
  label: string;
  name: string;
  type: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink/80 mb-1">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-md border border-ink/15 bg-white/60 px-3 py-2 text-ink focus:border-coral focus:outline-none"
      />
    </label>
  );
}
