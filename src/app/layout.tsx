import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "zippr.ink",
  icons: {
    icon: "/zippr-ink-fav.svg",
    apple: "/zippr-ink-fav.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-black antialiased">{children}</body>
    </html>
  );
}
