import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HelpCircle, Search, BookOpen, MessageCircle, Mail } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: 'Getting Started',
    question: 'What is ShieldSight?',
    answer: 'ShieldSight is an AI-powered phishing detection system that analyzes URLs to determine if they are legitimate or potentially malicious. It uses advanced machine learning with 95%+ accuracy.',
  },
  {
    category: 'Getting Started',
    question: 'How do I analyze a URL?',
    answer: 'Go to the Analyze page, enter any URL (starting with http:// or https://), and click "Analyze". You\'ll get instant results with confidence scores and SHAP explanations.',
  },
  {
    category: 'Features',
    question: 'What is SHAP explanation?',
    answer: 'SHAP (SHapley Additive exPlanations) shows which features of the URL contributed to the prediction. It helps you understand WHY a URL was flagged as phishing or legitimate.',
  },
  {
    category: 'Features',
    question: 'How does batch analysis work?',
    answer: 'Upload a CSV file with URLs (one per line), and ShieldSight will analyze up to 100 URLs simultaneously. Results can be exported as CSV, JSON, or TXT.',
  },
  {
    category: 'Features',
    question: 'What is the History feature?',
    answer: 'History automatically saves all your URL scans locally. You can view past results, filter by phishing/legitimate, and see statistics about your usage.',
  },
  {
    category: 'Accuracy',
    question: 'How accurate is ShieldSight?',
    answer: 'Our XGBoost model achieves 95%+ accuracy on test data. We use 50 PhiUSIIL features and a domain whitelist for known legitimate sites like Google and Facebook.',
  },
  {
    category: 'Accuracy',
    question: 'What if a legitimate site is flagged as phishing?',
    answer: 'False positives can occur. Known legitimate domains are whitelisted. If you encounter a false positive, the SHAP explanation will show which features triggered the alert.',
  },
  {
    category: 'Privacy',
    question: 'Is my data safe?',
    answer: 'Yes! All data is stored locally in your browser. We do not send your URLs to any third-party servers except our API for analysis. You can export or delete your data anytime.',
  },
  {
    category: 'Privacy',
    question: 'Can I delete my history?',
    answer: 'Absolutely! Go to History and click "Clear All", or go to Settings → Data Management to clear all data including settings.',
  },
  {
    category: 'Technical',
    question: 'What features does the model use?',
    answer: 'The model uses 50 PhiUSIIL features including URL length, domain characteristics, special characters, HTTPS presence, and similarity indices.',
  },
  {
    category: 'Technical',
    question: 'Can I use ShieldSight offline?',
    answer: 'No, ShieldSight requires an internet connection to analyze URLs as it needs to communicate with our ML backend API.',
  },
];

export const Help = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigate = useNavigate();

  const categories = Array.from(new Set(faqs.map((f) => f.category)));

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Help Center
            </h1>
            <p className="text-muted-foreground">
              Find answers to common questions
            </p>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for help..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-lg"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-2"
      >
        <Button
          size="sm"
          variant={selectedCategory === null ? 'default' : 'outline'}
          onClick={() => setSelectedCategory(null)}
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            size="sm"
            variant={selectedCategory === category ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </motion.div>

      {/* FAQs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        {filteredFAQs.length === 0 ? (
          <Card className="glass">
            <CardContent className="p-12 text-center">
              <Search className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No results found</p>
            </CardContent>
          </Card>
        ) : (
          filteredFAQs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="glass hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-primary font-semibold mb-2">
                        {faq.category}
                      </p>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {faq.question}
                      </h3>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Contact Support */}
      <div className="mt-8">
        <Card className="glass bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20 shadow-xl overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center flex-shrink-0 shadow-inner">
                  <MessageCircle className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-1">
                    Still need help?
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    Can't find what you're looking for? Our support team is here to guide you through any issues.
                  </p>
                </div>
              </div>

              <Button
                size="lg"
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 h-14 shadow-lg hover:shadow-blue-500/20 transition-all"
                onClick={() => navigate('/contact')}
              >
                <Mail className="w-5 h-5" />
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};