import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { CanvasProvider } from "@/contexts/CanvasContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { CanvasThemeProvider } from "@/contexts/CanvasThemeContext";

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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ChatProvider>
            <AuthProvider>
              <CanvasProvider>
                <CanvasThemeProvider>
                  {children}
                </CanvasThemeProvider>
              </CanvasProvider>
            </AuthProvider>
          </ChatProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
