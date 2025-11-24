import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SurfSight Dashboard Design",
  description: "Surf conditions dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

