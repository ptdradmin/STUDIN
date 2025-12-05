import { Suspense } from 'react';
import LoginForm from '@/components/login-form';
import Image from 'next/image';

function LoginPageContent() {
  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <LoginForm />
      </div>
      <div className="hidden bg-muted lg:block relative">
        <Image
          src="https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=1974&auto=format&fit=crop"
          alt="Image d'étudiants souriant dans un bar"
          layout="fill"
          objectFit="cover"
          className="opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent"></div>
        <div className="absolute bottom-10 left-10 text-white">
            <h2 className="text-3xl font-bold">Bienvenue sur STUD'IN</h2>
            <p className="mt-2 max-w-md">La plateforme qui connecte et simplifie la vie des étudiants de la Fédération Wallonie-Bruxelles.</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
