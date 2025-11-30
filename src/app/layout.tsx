import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/context";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "FOXuse - Airdrop Hunter",
  description: "Track and manage your crypto airdrops",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <ToastProvider>
            {children}
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
