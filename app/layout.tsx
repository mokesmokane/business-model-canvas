import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { LayoutProvider } from '@/contexts/LayoutContext';
import { CanvasTypeProvider } from '@/contexts/CanvasTypeContext';
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "cavvy.ai",
  description: "Materialize your ideas with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <Providers>
            <LayoutProvider>
                <CanvasTypeProvider>
                  {children}
                </CanvasTypeProvider>
            </LayoutProvider>
          </Providers>
      </body>
    </html>
  );
}
