
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from 'react';
import { AppContextProvider } from '@/context/app-context';

export const metadata: Metadata = {
  metadataBase: new URL('https://chocosmiley.com'),
  title: 'Choco Smiley',
  description: 'Welcome to Choco Smiley, Handcrafted chocolates for every occasion.',
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Condensed:wght@400;700&family=IBM+Plex+Sans:wght@400;700&family=Inter:wght@400;700&family=Poppins:wght@400;700&family=Montserrat:wght@400;700&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#5D2B79" />
      </head>
      <body className="font-body antialiased overflow-y-auto no-scrollbar">
        <Suspense fallback={null}>
          <AppContextProvider>
            {children}
          </AppContextProvider>
        </Suspense>
        <Toaster />
      </body>
    </html>
  );
}
