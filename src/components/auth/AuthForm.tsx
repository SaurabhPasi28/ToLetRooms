"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { sanitizePhone, validateIndianPhone } from '@/utils/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, X, Loader2 } from 'lucide-react';

export default function AuthForm({ isLogin, onClose }: { isLogin: boolean; onClose: () => void }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Password validation
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }

    // Registration specific validation
    if (!isLogin) {
      if (!formData.name.trim()) {
        toast.error('Full name is required');
        return false;
      }
      
      const cleanPhone = sanitizePhone(formData.phone);
      if (!validateIndianPhone(cleanPhone)) {
        toast.error('Valid 10-digit Indian phone number required');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form first
      if (!validateForm()) {
        return;
      }
      
      setFormLoading(true);

      // Prepare the data
      const authData = {
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        ...(!isLogin && {
          name: formData.name.trim(),
          phone: sanitizePhone(formData.phone)
        })
      };

      // Sign in or register
      const result = await signIn('credentials', {
        redirect: false,
        ...authData,
        callbackUrl: '/dashboard' // Explicit callback URL
      });

      // Handle result
      if (result?.error) {
        toast.error(result.error, {
          duration: 3000
        });
        return;
      }
      
      // Check if we need to redirect
      if (result?.url) {
        router.push(result.url);
      } else {
        // Default redirect if no URL provided
        router.push('/dashboard');
      }

      // Show success message
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!', {
        duration: 5000
      });
      onClose(); // Close modal on success

    } catch (error: any) {
      toast.error(error, {
        duration: 20000
      });
      console.error('Authentication error:', error);
      
      // More specific error messages
      let errorMessage = 'Authentication failed. Please try again.';
      if (error.message.includes('credentials')) {
        errorMessage = 'Invalid email or password';
      } else if (error.message.includes('already registered')) {
        errorMessage = 'This email is already registered';
      }

      toast.error(errorMessage, {
        duration: 20000
      });

    } finally {
      setFormLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      const result = await signIn('google', { 
        callbackUrl: '/dashboard',
        redirect: false
      });
      
      if (result?.error) throw new Error(result.error);
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast.error(error.message || 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative bg-background rounded-lg shadow-xl border max-w-md w-full mx-4">
      {/* Close button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-accent transition-colors"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-muted-foreground mt-2">
            {isLogin ? 'Sign in to your account' : 'Enter your details to get started'}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                maxLength={10}
                pattern="[6-9]\d{9}"
                placeholder="Enter 10-digit Indian number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="space-y-2">
            
            {/* Password */}
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={formLoading}
            className="w-full"
          >
            {formLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isLogin ? 'Signing in...' : 'Creating account...'}
              </>
            ) : (
              isLogin ? 'Sign in' : 'Create account'
            )}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full mt-4"
          >
            {googleLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/>
                </svg>
                Continue with Google
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}