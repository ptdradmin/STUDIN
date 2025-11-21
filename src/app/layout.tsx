import type {Metadata} from 'next';
import './globals.css';
import {AuthProvider} from '@/contexts/auth-context';
import {Toaster} from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: "STUD'IN - L'écosystème étudiant",
  description: 'La plateforme complète pour les étudiants de Wallonie-Bruxelles',
};

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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Source+Code+Pro&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow">{children}</main>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
