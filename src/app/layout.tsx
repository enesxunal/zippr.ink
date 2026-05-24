import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "zippr.ink",
  icons: { icon: "/zippr-ink-fav.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
