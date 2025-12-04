'use client';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import dynamic from 'next/dynamic';
import { Inter, Poppins } from 'next/font/google';
import Providers from './providers';
import Script from 'next/script';


const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

// Charge BottomNavbar uniquement côté client
const BottomNavbar = dynamic(
  () => import('@/components/bottom-navbar'),
  { ssr: false }
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <Script 
            src="https://www.google.com/recaptcha/enterprise.js?render=6LcimiAsAAAAAEYqnXn6r1SCpvlUYftwp9nK0wOS" 
            strategy="beforeInteractive" 
            async
        />
      </head>
      <body className="font-body antialiased">
        <Providers>
            {children}
            <BottomNavbar />
            <Toaster />
        </Providers>
      </body>
    </html>
  );
}
