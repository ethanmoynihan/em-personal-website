import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK"],
});

export const metadata: Metadata = {
  title: "Ethan Moynihan",
  description: "Paintings by Ethan Moynihan",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

function SiteHeader() {
  return (
    <header className="border-b border-ink/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="font-display text-2xl font-semibold tracking-tight text-ink"
        >
          Ethan Moynihan
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <NavLink href="/gallery">Gallery</NavLink>
          <NavLink href="/series">Series</NavLink>
          <NavLink href="/about">About</NavLink>
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-ink/70 transition-colors hover:text-coral"
    >
      {children}
    </Link>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-ink/10 mt-24">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-sm text-ink/60">
        <span>© {new Date().getFullYear()} Ethan Moynihan</span>
        <Link href="/about" className="hover:text-coral">
          Contact
        </Link>
      </div>
    </footer>
  );
}
