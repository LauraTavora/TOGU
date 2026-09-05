import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/client/auth/auth-provider";

export const metadata: Metadata = {
  title: "TOGU",
  description: "Seu tempo. Suas pessoas. Juntos.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
