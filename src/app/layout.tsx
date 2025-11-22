
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AppContextProvider } from '@/context/app-context';

export const metadata: Metadata = {
  metadataBase: new URL('https://chocosmiley.com'),
  title: "Choco Smiley — Online Chocolate Store",
  description:
    "Choco Smiley brings you premium handmade chocolates, custom gift boxes, and personalised chocolate art for every occasion.",
  keywords: [
    "Choco Smiley",
    "homemade chocolates",
    "handmade chocolates",
    "premium chocolates",
    "chocolate gift boxes",
    "personalised chocolates",
    "custom gifting",
    "luxury chocolates",
    "corporate gifting",
    "anniversaries",
    "birthdays",
    "valentines",
    "diwali",
    "christmas",
    "new years",
    "festivals"
  ],
  openGraph: {
    title: "Choco Smiley — Handmade Chocolates & Personalized Gifting",
    description:
      "Explore delicious handmade chocolates, custom hampers & personalised gifts crafted with love.",
    url: "https://chocosmiley.com",
    siteName: "Choco Smiley",
    images: [
      {
        url: "/CS preview.png",
        width: 1200,
        height: 630,
      }
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Choco Smiley — Handmade Chocolates & Personalized Gifting",
    description:
      "Discover premium chocolates & custom gift hampers handcrafted with love.",
    images: ["/CS preview.png"],
  },
  alternates: {
    canonical: "https://chocosmiley.com",
  },

  icons: {
    icon: "/favicon.ico",
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Condensed:wght@400;700&family=IBM+Plex+Sans:wght@400;700&family=Inter:wght@400;700&family=Poppins:wght@400;700&family=Montserrat:wght@400;700&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#5D2B79" />
      </head>
      <body className="font-body antialiased overflow-y-auto no-scrollbar">
          <AppContextProvider>
            {children}
          </AppContextProvider>
        <Toaster />
      </body>
    </html>
  );
}
