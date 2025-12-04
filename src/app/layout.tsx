
'use client';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import dynamic from 'next/dynamic';
import { Inter, Poppins, Source_Code_Pro } from 'next/font/google';
import FirebaseClientProvider from '@/firebase/client-provider';
import { LanguageProvider } from '@/contexts/language-context';
import Script from 'next/script';
import { useEffect, useState } from 'react';

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

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-source-code-pro',
});

const BottomNavbar = dynamic(
  () => import('@/components/bottom-navbar'),
  { ssr: false }
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <html lang="fr" className={`${inter.variable} ${poppins.variable} ${sourceCodePro.variable}`}>
       <head>
          <Script 
            src={`https://www.google.com/recaptcha/enterprise.js?render=6LcimiAsAAAAAEYqnXn6r1SCpvlUYftwp9nK0wOS`} 
            strategy="beforeInteractive" 
          />
      </head>
      <body className="font-body antialiased">
        {isClient ? (
           <LanguageProvider>
              <FirebaseClientProvider>
                {children}
                <BottomNavbar />
                <Toaster />
              </FirebaseClientProvider>
          </LanguageProvider>
        ) : (
          <>{children}</>
        )}
      </body>
    </html>
  );
}
