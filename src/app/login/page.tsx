import LoginForm from '@/components/login-form';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-grow container relative flex flex-col items-center justify-center py-10">
      <LoginForm />
    </main>
    <Footer />
    </div>
  );
}
