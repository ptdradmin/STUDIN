
'use client';

import './globals.css';
import Script from 'next/script';
import { Toaster } from '@/components/ui/toaster';
import FirebaseClientProvider from '@/firebase/client-provider';
import { LanguageProvider } from '@/contexts/language-context';
import BottomNavbar from '@/components/bottom-navbar';
import { Inter, Poppins, Source_Code_Pro } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
});

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-source-code-pro',
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${poppins.variable} ${sourceCodePro.variable}`}>
      <head>
          <Script 
            src={`https://www.google.com/recaptcha/enterprise.js?render=6LcimiAsAAAAAEYqnXn6r1SCpvlUYftwp9nK0wOS`} 
            strategy="beforeInteractive" 
          />
      </head>
      <body className="font-body antialiased">
        <LanguageProvider>
          <FirebaseClientProvider>
            {children}
            <BottomNavbar />
            <Toaster />
          </FirebaseClientProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
