import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { cn } from '../../lib/utils';

interface URLInputProps {
  onSubmit: (url: string) => void;
  loading?: boolean;
}

export const URLInput = ({ onSubmit, loading = false }: URLInputProps) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const validateURL = (url: string): boolean => {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!validateURL(url)) {
      setError('Please enter a valid URL (must start with http:// or https://)');
      return;
    }

    onSubmit(url);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div className="relative">
        <div className="relative flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Enter URL to analyze (e.g., https://example.com)"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError('');
              }}
              className={cn(
                "pl-12 pr-4 h-14 text-lg",
                error && "border-destructive"
              )}
              disabled={loading}
            />
          </div>
          
          <Button
            type="submit"
            disabled={loading || !url.trim()}
            className="px-8 h-14 bg-gradient-primary text-white shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                Analyze
              </>
            )}
          </Button>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 mt-2 text-destructive"
            >
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Example URLs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-2"
      >
        <span className="text-sm text-muted-foreground">Try:</span>
        {[
          'http://paypal-secure.com',
          'https://www.google.com',
          'http://banking-verify.tk',
        ].map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setUrl(example)}
            disabled={loading}
            className="text-sm px-3 py-1 rounded-full bg-muted hover:bg-muted/80 text-foreground transition-colors disabled:opacity-50"
          >
            {example}
          </button>
        ))}
      </motion.div>
    </motion.form>
  );
};
