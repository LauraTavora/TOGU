import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/client/auth/auth-provider";

/**
 * Força renderização dinâmica em todo o app. Necessário para a CSP com
 * nonce por requisição (middleware.ts): páginas estaticamente pré-geradas
 * têm seu HTML — incluindo os <script> inline de hidratação do Next —
 * congelado em build time, então nunca carregam o nonce daquela requisição
 * específica; o navegador bloquearia a hidratação inteira. Ver ADR-020.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fechô",
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
