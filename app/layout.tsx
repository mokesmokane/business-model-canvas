import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { LayoutProvider } from '@/contexts/LayoutContext';
import { CanvasTypeProvider } from '@/contexts/CanvasTypeContext';
import { AiGenerationProvider } from '@/contexts/AiGenerationContext';
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
  title: "Business Model Canvas",
  description: "Create and save your Business Model Canvas",
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
                <AiGenerationProvider>
                  {children}
                </AiGenerationProvider>
              </CanvasTypeProvider>
            </LayoutProvider>
          </Providers>
      </body>
    </html>
  );
}
