export function PageHeader({
  title,
  description,
  eyebrow,
}: {
  title: string;
  description?: string | null;
  eyebrow?: string;
}) {
  return (
    <div className="mb-12">
      {eyebrow && (
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-coral">
          {eyebrow}
        </p>
      )}
      <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-ink">
        {title}
      </h1>
      {description && (
        <p className="mt-4 max-w-2xl text-lg text-ink/70 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
