
'use client';

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import FirebaseClientProvider from '@/firebase/client-provider';
import { useUser } from '@/firebase';
import { LanguageProvider } from '@/contexts/language-context';
import SocialLayout from '@/social/layout';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { PageSkeleton } from '@/components/page-skeleton';
import { usePathname } from 'next/navigation';

const metadata: Metadata = {
  title: "STUD'IN - L'écosystème étudiant",
  description: 'La plateforme complète pour les étudiants de Wallonie-Bruxelles',
};

function AppContent({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return <PageSkeleton />;
  }

  if (user) {
    return <SocialLayout>{children}</SocialLayout>;
  }

  return (
    <div className="flex flex-col min-h-screen dark:bg-background">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
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
            <AppContent>{children}</AppContent>
            <Toaster />
          </FirebaseClientProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
