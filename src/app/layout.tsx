
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AppContextProvider } from '@/context/app-context';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.chocosmiley.com'),
  title: "Choco Smiley - Premium Handmade Chocolates & Custom Gifts Online",
  description:
    "Indulge in Choco Smiley's finest handmade, personalized chocolates & gift boxes. Perfect for birthdays, weddings, and corporate events. Shop Now!",
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
    title: "Choco Smiley - Premium Handmade Chocolates & Custom Gifts Online",
    description:
      "Explore delicious handmade chocolates, custom hampers & personalised gifts crafted with love.",
    url: "https://www.chocosmiley.com",
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
    title: "Choco Smiley - Premium Handmade Chocolates & Custom Gifts Online",
    description:
      "Discover premium chocolates & custom gift hampers handcrafted with love.",
    images: ["/CS preview.png"],
  },
  alternates: {
    canonical: "https://www.chocosmiley.com",
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
      <body className="font-body antialiased overflow-y-auto no-scrollbar">
          <AppContextProvider>
            {children}
          </AppContextProvider>
        <Toaster />
      </body>
    </html>
  );
}
