import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tristan Sereño | Product Engineer · Web Developer · Automation Architect · Software Developer",
  description:
    "5+ years of experience in AI-Native Development, Full-Stack TypeScript, and High-Performance Automation. Proven track record of reducing manual workflows by 97%+.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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
