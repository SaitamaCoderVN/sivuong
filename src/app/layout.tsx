import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/layout/Navbar";
import { FocusModeProvider } from "@/lib/contexts/FocusModeContext";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LanguageProvider } from "@/components/providers/LanguageProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sĩ Vương | Academic Study Rituals",
  description: "A focused study ritual system designed for professional discipline and academic excellence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
        <body
          className={`${inter.variable} font-sans min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary transition-colors duration-1000`}
        >
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <LanguageProvider>
              <FocusModeProvider>
                <div className="relative flex min-h-screen flex-col">
                  <Navbar />
                  <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-8 pt-28 pb-24">
                    {children}
                  </main>
                </div>
                <Toaster position="bottom-right" closeButton richColors />
              </FocusModeProvider>
            </LanguageProvider>
          </ThemeProvider>
        </body>
    </html>
  );
}
