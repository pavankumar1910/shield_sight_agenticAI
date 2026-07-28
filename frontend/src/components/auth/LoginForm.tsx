import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Shield, RefreshCw, CheckCircle2 } from 'lucide-react';
import { showToast } from '../ui/Toast';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

export const LoginForm = () => {
  const navigate = useNavigate();
  const { login, resendVerification, loading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNeedsVerification(false);
    try {
      await login(email, password);
      navigate('/app/dashboard');
    } catch (error: any) {
      if (error.message === 'email-not-verified') {
        setNeedsVerification(true);
      }
      console.error('Login failed:', error);
    }
  };

  const handleResendVerification = async () => {
    if (!email || !password) return;
    setResending(true);
    try {
      await resendVerification(email, password);
    } catch {
      // Toast is handled in the store
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="glass p-8 shadow-2xl">
          {/* Logo & Title */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="mb-4"
            >
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </motion.div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Welcome Back
            </h1>
            <p className="text-muted-foreground mt-2">
              Sign in to ShieldSight Dashboard
            </p>
          </div>

          {/* Email Verification Warning Banner */}
          {needsVerification && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-4 rounded-xl bg-orange-500/10 border-2 border-orange-500/30"
            >
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                    Email not verified
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Please check your inbox and click the verification link before logging in.
                  </p>
                  <div className="mt-2 flex items-center gap-4">
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resending}
                      className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                      {resending ? 'Sending...' : 'Resend Verification Email'}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const { reloadUser } = useAuthStore.getState();
                        await reloadUser();
                        const freshUser = useAuthStore.getState().user;
                        if (freshUser?.emailVerified) {
                          showToast('success', 'Email verified! Logging you in...');
                          navigate('/app/dashboard');
                        } else {
                          showToast('warning', 'Email still not verified. Please check your inbox.');
                        }
                      }}
                      className="flex items-center gap-1.5 text-xs font-semibold text-green-600 hover:underline dark:text-green-400"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Check Verification Status
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full gradient-primary text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-card text-muted-foreground">or</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-primary hover:underline font-semibold"
              >
                Sign up
              </Link>
            </p>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Protected by ShieldSight © 2026
        </p>
      </motion.div>
    </div>
  );
};