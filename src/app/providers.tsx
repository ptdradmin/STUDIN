'use client';

import { LanguageProvider } from '@/contexts/language-context';
import FirebaseClientProvider from '@/firebase/client-provider';
import Script from 'next/script';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <FirebaseClientProvider>
        <Script 
            src={`https://www.google.com/recaptcha/enterprise.js?render=6LcimiAsAAAAAEYqnXn6r1SCpvlUYftwp9nK0wOS`} 
            strategy="beforeInteractive" 
          />
        {children}
      </FirebaseClientProvider>
    </LanguageProvider>
  );
}
