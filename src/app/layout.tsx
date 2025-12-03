
'use client';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import FirebaseClientProvider from '@/firebase/client-provider';
import { LanguageProvider } from '@/contexts/language-context';
import BottomNavbar from '@/components/bottom-navbar';
import { usePathname } from 'next/navigation';
import { Inter, Poppins, Source_Code_Pro } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-poppins',
});

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-source-code-pro',
});

function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const publicPages = [
    '/',
    '/login',
    '/register',
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

  const showBottomNav = !publicPages.includes(pathname);

  return (
    <>
      {children}
      {showBottomNav && <BottomNavbar />}
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
