import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, ShieldAlert, Coffee, AlertTriangle, EyeIcon, EyeOffIcon, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import PageTransition from '@/components/PageTransition';
import Logo from '@/components/Logo';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Label } from '@/components/ui/label';

// Form validation schema with stronger password requirements
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Rate limiting settings
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 10 * 60 * 1000; // 10 minutes

const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Define form with validation
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });
  
  // Check if redirected from a protected route or load stored lockout state
  useEffect(() => {
    // Extract redirected state if it exists
    const fromProtected = location.state?.fromProtected;
    
    if (fromProtected) {
      setRedirectMessage('Authentication required to access the admin dashboard');
      
      // Clear admin status to force re-authentication
      localStorage.removeItem('isAdmin');
    }
    
    // Load stored login attempts and lockout time
    const storedAttempts = sessionStorage.getItem('loginAttempts');
    const storedLockout = sessionStorage.getItem('lockoutUntil');
    
    if (storedAttempts) {
      setLoginAttempts(parseInt(storedAttempts));
    }
    
    if (storedLockout) {
      const lockoutTime = parseInt(storedLockout);
      if (lockoutTime > Date.now()) {
        setLockoutUntil(lockoutTime);
      } else {
        // Clear expired lockout
        sessionStorage.removeItem('lockoutUntil');
        sessionStorage.removeItem('loginAttempts');
      }
    }
  }, [location]);
  
  // Handle login attempts and rate limiting
  const updateLoginAttempts = (success: boolean) => {
    if (success) {
      // Reset on successful login
      setLoginAttempts(0);
      sessionStorage.removeItem('loginAttempts');
      sessionStorage.removeItem('lockoutUntil');
      return true;
    } else {
      // Increment attempts on failure
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      sessionStorage.setItem('loginAttempts', newAttempts.toString());
      
      // Check if max attempts reached
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockoutTime = Date.now() + LOCKOUT_TIME;
        setLockoutUntil(lockoutTime);
        sessionStorage.setItem('lockoutUntil', lockoutTime.toString());
        toast.error(`Too many login attempts. Please try again in 10 minutes.`);
      } else {
        const remaining = MAX_LOGIN_ATTEMPTS - newAttempts;
        toast.error(`Invalid admin credentials. ${remaining} attempts remaining.`);
      }
      return false;
    }
  };
  
  // Calculate remaining lockout time
  const getRemainingLockoutTime = (): string => {
    if (!lockoutUntil) return '';
    
    const remainingMs = lockoutUntil - Date.now();
    if (remainingMs <= 0) return '';
    
    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);
    
    return `${minutes}m ${seconds}s`;
  };
  
  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    // Check for lockout
    if (lockoutUntil && lockoutUntil > Date.now()) {
      toast.error(`Account locked. Try again in ${getRemainingLockoutTime()}`);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Check for admin credentials with new secure password
      if (values.username !== 'admin' || values.password !== 'barista@4444') {
        setIsLoading(false);
        updateLoginAttempts(false);
        return;
      }
      
      // Update login attempts counter
      updateLoginAttempts(true);
      
      // Simply store admin status without session timeout info
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('adminSecurityKey', 'barista-secured-dashboard-key');

      toast.success('Login successful');
      navigate('/admin/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      updateLoginAttempts(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition className="min-h-screen coffee-pattern">
      <div className="relative h-full min-h-screen">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute right-[-20%] top-[-10%] h-80 w-80 rounded-full bg-cafe/5"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 10, 0] 
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute left-[-10%] bottom-[-5%] h-60 w-60 rounded-full bg-cafe/5"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, -10, 0] 
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        
        <div className="container mx-auto max-w-md p-4 py-8 safe-area-padding">
          <div className="mb-6 flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2 rounded-full h-10 w-10 text-cafe-text hover:text-cafe hover:bg-cafe/5"
              onClick={() => navigate('/')}
            >
              <ChevronLeft size={20} />
              <span className="sr-only">Back</span>
            </Button>
            
            <motion.div 
              className="flex-1 text-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Logo />
            </motion.div>
            
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
          
          <motion.div 
            className="rounded-2xl bg-white/80 backdrop-blur-md p-6 border border-cafe/10 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex justify-center mb-5">
              <div className="rounded-full bg-cafe/10 p-3">
                <ShieldAlert size={28} className="text-cafe" />
              </div>
            </div>
            
            <h1 className="mb-6 text-2xl font-bold text-center text-cafe-dark">Admin Login</h1>
            
            {redirectMessage && (
              <motion.div 
                className="mb-4 rounded-md bg-yellow-50 p-3 text-center text-sm text-yellow-800"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertTriangle className="mx-auto mb-1 h-5 w-5" />
                {redirectMessage}
              </motion.div>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
                <div className="space-y-2">
                  <Label 
                    htmlFor="username" 
                    className="text-sm font-medium text-cafe-text/70"
                  >
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    required
                    className="h-12 rounded-xl"
                    autoComplete="username"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label 
                    htmlFor="password" 
                    className="text-sm font-medium text-cafe-text/70"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="admin123"
                      required
                      className="h-12 pr-10 rounded-xl"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-cafe-text/50 hover:text-cafe-text"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOffIcon size={18} />
                      ) : (
                        <EyeIcon size={18} />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-cafe-text/50 mt-1">
                    Demo credentials: admin / admin123
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 mt-6 bg-cafe hover:bg-cafe-dark rounded-xl text-base"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="h-5 w-5 border-t-2 border-r-2 border-white rounded-full animate-spin mr-2"></div>
                      <span>Logging in...</span>
                    </div>
                  ) : (
                    <span>Login</span>
                  )}
                </Button>
              </form>
            </Form>
          </motion.div>
          
          <motion.p
            className="mt-4 text-center text-sm text-cafe-text/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            This is a protected area for staff only
          </motion.p>
        </div>
      </div>
    </PageTransition>
  );
};

export default Admin;
