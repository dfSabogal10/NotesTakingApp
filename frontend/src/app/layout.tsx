import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Notes Taking App",
  description: "Organize your notes by category",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
