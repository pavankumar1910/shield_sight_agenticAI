import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { EmailScanner } from '../components/email/EmailScanner';

export const EmailScan = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Email Scanner
            </h1>
            <p className="text-muted-foreground">
              Scan suspicious emails for phishing URLs
            </p>
          </div>
        </div>
      </motion.div>

      {/* Scanner */}
      <EmailScanner />
    </div>
  );
};

export default EmailScan;