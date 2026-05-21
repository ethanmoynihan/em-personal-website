import { PageHeader } from "@/components/PageHeader";

export const metadata = {
  title: "About — Ethan Moynihan",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <PageHeader eyebrow="About" title="Ethan Moynihan" />
      <div className="prose prose-lg max-w-none text-ink/80 leading-relaxed">
        <p>
          A short bio goes here — replace this paragraph with whatever you want
          visitors to know. Maybe how you got into painting, what you&apos;re
          currently working on, materials you favor.
        </p>
        <p className="mt-5">
          You can reach me at{" "}
          <a
            href="mailto:hello@example.com"
            className="text-coral hover:underline"
          >
            hello@example.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
