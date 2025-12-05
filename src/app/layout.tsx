import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Inter, Poppins } from 'next/font/google';
import { FirebaseProvider } from '@/firebase/provider';
import { LanguageProvider } from '@/contexts/language-context';

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-body antialiased">
        <FirebaseProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
          <Toaster />
        </FirebaseProvider>
      </body>
    </html>
  );
}
