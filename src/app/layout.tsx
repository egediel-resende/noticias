import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TacticalInsight - Radar Realtime I.A.",
  description: "Monitor de notícias de futebol em tempo real com I.A.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
