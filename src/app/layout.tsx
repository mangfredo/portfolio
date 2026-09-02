import type { Metadata } from "next";
import { Geist_Mono, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tristan Sereño — Software Engineer",
  description:
    "I build internal tools and automation systems that cut hours off manual work. 5+ years across full-stack TypeScript, Node.js, and high-performance automation.",
  metadataBase: new URL("https://tristansereno.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Tristan Sereño — Software Engineer",
    description:
      "I build internal tools and automation systems that cut hours off manual work. 5+ years across full-stack TypeScript, Node.js, and high-performance automation.",
    url: "https://tristansereno.vercel.app",
    siteName: "Tristan Sereño Portfolio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tristan Sereño — Software Engineer",
    description:
      "I build internal tools and automation systems that cut hours off manual work. 5+ years across full-stack TypeScript, Node.js, and high-performance automation.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} ${playfair.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var t = localStorage.getItem('theme');
                if (t) document.documentElement.setAttribute('data-theme', t);
              })();
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
