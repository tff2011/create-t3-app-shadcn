import "@/styles/globals.css";

import { Inter } from "next/font/google";

import { ClientProviders } from "./client-providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Backtesting Bitcoin Observatorium",
  description: "Sistema de autenticação Matrix para análise de Bitcoin",
  icons: [
    { rel: "icon", url: "/favicon.svg", type: "image/svg+xml" }
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
