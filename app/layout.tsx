import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "mcse.in — Every dream has a price.",
  description: "Mock Capital Stock Exchange — 24-26 Apr 2026. Prize Pool Rs 70,000.",
  themeColor: "#0d0c0b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" style={{ background: "#0d0c0b" }}>
      <body className="min-h-full flex flex-col" style={{ background: "#0d0c0b" }}>{children}</body>
    </html>
  );
}
