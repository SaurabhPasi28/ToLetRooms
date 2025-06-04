// // app/register/page.tsx
// import AuthForm from '@/components/auth/AuthForm';

// export default function RegisterPage() {
//   return <AuthForm isLogin={false} />;
// }

// app/register/page.tsx
import AuthModal from '@/components/auth/AuthModal';

export default function RegisterPage() {
  return <AuthModal isLogin={false} />;
}