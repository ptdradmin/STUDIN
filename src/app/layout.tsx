'use client';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import FirebaseClientProvider from '@/firebase/client-provider';
import { LanguageProvider } from '@/contexts/language-context';
import { useUser } from '@/firebase';
import { PageSkeleton } from '@/components/page-skeleton';
import BottomNavbar from '@/components/bottom-navbar';
import { usePathname } from 'next/navigation';

function AppContent({ children }: { children: React.ReactNode }) {
  const { isUserLoading } = useUser();
  const pathname = usePathname();

  const showBottomNav = !['/login', '/register', '/', '/about', '/who-we-are', '/press', '/terms', '/privacy', '/help', '/contact', '/faq'].includes(pathname);

  if (isUserLoading) {
    return <PageSkeleton />;
  }

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
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@700;800&family=Source+Code+Pro&display=swap"
          rel="stylesheet"
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
