import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TOGU",
  description: "Seu tempo. Suas pessoas. Juntos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
