import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Shield, Check, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { showToast } from '../ui/Toast';
import { Modal } from '../ui/Modal';


export const SignupForm = () => {
  const { signup, loading } = useAuthStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [activeModal, setActiveModal] = useState<'terms' | 'privacy' | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showToast('error', 'Passwords do not match!');
      return;
    }

    if (!acceptTerms) {
      showToast('error', 'Please accept terms and conditions');
      return;
    }


    try {
      await signup(formData.email, formData.password, formData.name);
      setVerificationSent(true);
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 -left-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-20 right-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Verification Success Screen */}
      {verificationSent ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          <Card className="glass p-8 shadow-2xl text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-6"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            <h2 className="text-2xl font-bold text-foreground mb-2">
              Verify Your Email
            </h2>
            <p className="text-muted-foreground mb-2">
              We've sent a verification link to:
            </p>
            <p className="text-primary font-semibold mb-6">
              {formData.email}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Please check your inbox (and spam folder) and click the verification link before logging in.
            </p>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              <Mail className="w-5 h-5" />
              Go to Login
            </Link>
          </Card>
        </motion.div>
      ) : (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="glass p-8 shadow-2xl">
          {/* Logo & Title */}
          <div className="flex flex-col items-center mb-6">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="mb-4"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </motion.div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Create Account
            </h1>
            <p className="text-muted-foreground mt-2">
              Join ShieldSight today
            </p>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

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
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2"
                >
                  <div className="flex gap-1 mb-1">
                    {[0, 1, 2, 3].map((index) => (
                      <div
                        key={index}
                        className={`h-1 flex-1 rounded-full transition-colors ${index < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Password strength: {strengthLabels[passwordStrength - 1] || 'Very Weak'}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="pl-10"
                  required
                />
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
              />
              <label className="text-sm text-muted-foreground">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => setActiveModal('terms')}
                  className="text-primary hover:underline font-medium focus:outline-none"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={() => setActiveModal('privacy')}
                  className="text-primary hover:underline font-medium focus:outline-none"
                >
                  Privacy Policy
                </button>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !acceptTerms}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                'Create Account'
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

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary hover:underline font-semibold"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Protected by ShieldSight © 2026
        </p>
      </motion.div>
      )}

      {/* Terms & Privacy Modals */}
      <Modal
        isOpen={activeModal === 'terms'}
        onClose={() => setActiveModal(null)}
        title="Terms of Service"
      >
        <div className="space-y-4">
          <p className="font-bold">Last Updated: March 2026</p>
          <p>By using ShieldSight, you agree to the following terms:</p>
          <h3 className="font-semibold">1. Service Description</h3>
          <p>ShieldSight provides AI-powered phishing detection and URL analysis services. While we strive for 100% accuracy, our reports are for informational purposes only.</p>
          <h3 className="font-semibold">2. User Conduct</h3>
          <p>You agree not to use ShieldSight for any illegal activities or to attempt to probe or scan our systems.</p>
          <h3 className="font-semibold">3. Limitation of Liability</h3>
          <p>ShieldSight developers are not liable for any damages resulting from reliance on our phishing detection results.</p>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === 'privacy'}
        onClose={() => setActiveModal(null)}
        title="Privacy Policy"
      >
        <div className="space-y-4">
          <p className="font-bold">Last Updated: March 2026</p>
          <h3 className="font-semibold">1. Data Collection</h3>
          <p>We collectURLs analyzed to improve our detection algorithms. We do not sell your personal data.</p>
          <h3 className="font-semibold">2. Authentication</h3>
          <p>We use Firebase for secure authentication. Your account information is protected.</p>
          <h3 className="font-semibold">3. Tracking</h3>
          <p>We use minimal tracking tokens to maintain your session.</p>
        </div>
      </Modal>
    </div>
  );
};
