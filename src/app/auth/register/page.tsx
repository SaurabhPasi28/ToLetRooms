// app/register/page.tsx
import AuthForm from '@/components/auth/AuthForm';

export default function RegisterPage() {
  return <AuthForm isLogin={false} />;
}