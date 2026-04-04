import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "mcse.in — Every dream has a price.",
  description: "Mock Capital Stock Exchange — 24-26 Apr 2026. Prize Pool Rs 70,000.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
