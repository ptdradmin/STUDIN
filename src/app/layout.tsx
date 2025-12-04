
'use client';

import './globals.css';
import Script from 'next/script';
import { Toaster } from '@/components/ui/toaster';
import FirebaseClientProvider from '@/firebase/client-provider';
import { LanguageProvider } from '@/contexts/language-context';
import BottomNavbar from '@/components/bottom-navbar';
import { usePathname } from 'next/navigation';
import { Inter, Poppins, Source_Code_Pro } from 'next/font/google';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

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

function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const publicPages = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/about',
    '/who-we-are',
    '/press',
    '/terms',
    '/privacy',
    '/help',
    '/contact',
    '/faq',
    '/community-rules'
  ];

  const showBottomNav = !publicPages.some(page => pathname === page || (page !== '/' && pathname.startsWith(page)));
  
  return (
    <>
      {children}
      <div className={cn(!isMounted || !showBottomNav ? 'hidden' : 'block')}>
        <BottomNavbar />
      </div>
    </>
  );
}


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
            <AppContent>
                {children}
            </AppContent>
            <Toaster />
          </FirebaseClientProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
