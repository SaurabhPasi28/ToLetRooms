// app/register/page.tsx
import AuthForm from '@/components/AuthForm';

export default function RegisterPage() {
  return <AuthForm isLogin={false} />;
}