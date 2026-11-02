import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "openapi-fetch + Next.js",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
