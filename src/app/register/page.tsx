
import RegisterForm from '@/components/register-form';
import { GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="container relative flex min-h-screen flex-col items-center justify-center py-10">
       <div className="absolute top-8 left-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold">STUD'IN</h1>
          </Link>
       </div>
      <RegisterForm />
    </div>
  );
}
