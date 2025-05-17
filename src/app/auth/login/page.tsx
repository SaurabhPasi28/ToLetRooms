// // app/login/page.tsx
// import AuthForm from '@/components/auth/AuthForm';

// export default function LoginPage() {
//   return <AuthForm isLogin={true} />;
// }


// app/login/page.tsx
import AuthModal from '@/components/auth/AuthModal';

export default function LoginPage() {
  return <AuthModal isLogin={true} />;
}