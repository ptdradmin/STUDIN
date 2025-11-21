import LoginForm from '@/components/login-form';
import Navbar from '@/components/navbar';

export default function LoginPage() {
  return (
    <>
    <Navbar />
    <div className="container relative flex min-h-[calc(100vh-80px)] flex-col items-center justify-center py-10">
      <LoginForm />
    </div>
    </>
  );
}