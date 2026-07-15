import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/providers/theme-provider";
import Navbar from "@/components/navigation/navbar";
import Footer from "@/components/layout/footer";
import ScrollToTop from "@/components/layout/scroll-to-top";
import { getPublicSiteUrl } from "@/lib/server/env";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: getPublicSiteUrl(),
  title: {
    default: "Shiham Ahamed | Portfolio",
    template: "%s | Shiham Ahamed",
  },
  description: "Portfolio of Shiham Ahamed, a software engineering student building practical web applications and backend systems.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Shiham Ahamed Portfolio",
    title: "Shiham Ahamed | Portfolio",
    description: "Practical web applications, backend systems, and engineering work by Shiham Ahamed.",
    images: [{ url: "/logo.svg", alt: "Shiham Ahamed portfolio mark" }],
  },
  twitter: {
    card: "summary",
    title: "Shiham Ahamed | Portfolio",
    description: "Practical web applications, backend systems, and engineering work by Shiham Ahamed.",
    images: ["/logo.svg"],
  },
  icons: { icon: "/favicon.ico" },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ScrollToTop />
          <Navbar />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
