import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpareSeat",
  description:
    "Peer to peer ride sharing for Newfoundland and Labrador with cost sharing safeguards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-xl font-semibold">
              SpareSeat
            </Link>
            <div className="flex gap-4 text-sm">
              <Link href="/about">About</Link>
              <Link href="/faq">FAQ</Link>
              <Link href="/trust">Trust and Safety</Link>
              <Link href="/moderation">Moderation</Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
