import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clone Mission Control",
  description: "Dark-launch Next.js runtime for Clone v2 control plane.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
