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
  title: "Tristan Sereño — Software Engineer | Full-Stack Developer Portfolio",
  description:
    "Tristan Sereño is a Software Engineer specializing in internal tools, automation systems, and full-stack development. 5+ years experience with TypeScript, Node.js, React, and Next.js.",
  keywords: [
    "Tristan Sereño",
    "Tristan Sereno",
    "Software Engineer",
    "Full-Stack Developer",
    "TypeScript Developer",
    "Node.js Developer",
    "React Developer",
    "Web Developer Portfolio",
    "Frontend Developer",
    "Backend Developer",
  ],
  authors: [{ name: "Tristan Sereño", url: "https://tristansereno.vercel.app" }],
  creator: "Tristan Sereño",
  metadataBase: new URL("https://tristansereno.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Tristan Sereño — Software Engineer | Full-Stack Developer Portfolio",
    description:
      "Tristan Sereño is a Software Engineer specializing in internal tools, automation systems, and full-stack development. 5+ years experience with TypeScript, Node.js, React, and Next.js.",
    url: "https://tristansereno.vercel.app",
    siteName: "Tristan Sereño Portfolio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tristan Sereño — Software Engineer",
    description:
      "Software Engineer specializing in internal tools, automation systems, and full-stack development with TypeScript, Node.js, React.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google0fd61d0c93817dcf",
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
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Tristan Sereño",
              alternateName: "Tristan Sereno",
              url: "https://tristansereno.vercel.app",
              jobTitle: "Software Engineer",
              description:
                "Software Engineer specializing in internal tools, automation systems, and full-stack development with TypeScript, Node.js, React, and Next.js.",
              knowsAbout: [
                "TypeScript",
                "JavaScript",
                "Node.js",
                "React",
                "Next.js",
                "Full-Stack Development",
                "Automation",
                "Web Development",
              ],
              sameAs: [
                "https://www.linkedin.com/in/tristansereno",
                "https://github.com/mangfredo",
              ],
            }),
          }}
        />
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
