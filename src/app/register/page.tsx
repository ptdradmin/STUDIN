import RegisterForm from '@/components/register-form';
import Navbar from '@/components/navbar';

export default function RegisterPage() {
  return (
    <>
    <Navbar />
    <div className="container relative flex min-h-[calc(100vh-80px)] flex-col items-center justify-center py-10">
      <RegisterForm />
    </div>
    </>
  );
}