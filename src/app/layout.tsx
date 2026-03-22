import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'SmartCoupon Hub',
  description: 'Intelligent coupon recommendations and SMS parsing.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SmartCoupon',
  },
};

export const viewport: Viewport = {
  themeColor: '#ff6a00',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-primary/30 min-h-screen pb-20 md:pb-0 overflow-x-hidden">
        <main className="max-w-md mx-auto min-h-screen shadow-2xl bg-background border-x border-border/10 relative">
          {children}
          <Toaster />
        </main>
      </body>
    </html>
  );
}
