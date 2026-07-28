import { motion } from 'framer-motion';
import {
  Shield,
  Zap,
  Brain,
  Lock,
  BarChart3,
  Clock,
  Globe,
  CheckCircle
} from 'lucide-react';
import { Card as FeatureCard } from '../ui/Card';
import { GlowingEffect } from '../ui/glowing-effect';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Detection',
    description: 'Advanced machine learning algorithms with 95%+ accuracy for real-time phishing detection.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Analyze URLs in milliseconds with our optimized detection engine and caching system.',
    gradient: 'from-cyan-500 to-blue-400',
  },
  {
    icon: BarChart3,
    title: 'SHAP Explanations',
    description: 'Understand why URLs are flagged with explainable AI and detailed feature analysis.',
    gradient: 'from-blue-600 to-purple-500',
  },
  {
    icon: Lock,
    title: 'Secure & Private',
    description: 'Your data is encrypted and never shared. Complete privacy guaranteed.',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: Clock,
    title: 'Real-Time Analysis',
    description: 'Get instant results with our real-time URL scanning and threat detection.',
    gradient: 'from-red-500 to-rose-500',
  },
  {
    icon: Globe,
    title: 'Global Coverage',
    description: 'Detect phishing attempts from anywhere in the world with comprehensive database.',
    gradient: 'from-indigo-500 to-blue-500',
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 relative overflow-hidden bg-gradient-to-b from-background via-blue-50/50 dark:via-blue-950/20 to-background">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-5" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6"
          >
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Features</span>
          </motion.div>

          <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
            Everything You Need to Stay
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent"> Protected</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Comprehensive security powered by cutting-edge AI technology
          </p>
        </motion.div>

        {/* Features Grid with Glowing Effect */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="h-full"
              >
                <FeatureCard className="glass p-6 h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 group relative rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
                  {/* Glowing border effect */}
                  <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={2}
                    variant="blue"
                  />

                  <div className="relative h-full rounded-xl bg-card/95 backdrop-blur-sm p-6 group hover:bg-card transition-all duration-300">
                    <div className="space-y-4">
                      {/* Icon */}
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all`}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </motion.div>

                      {/* Content */}
                      <div>
                        <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-blue-500 transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors">
                          {feature.description}
                        </p>
                      </div>

                      {/* Check Mark */}
                      <div className="flex items-center gap-2 text-sm text-blue-400">
                        <CheckCircle className="w-4 h-4" />
                        <span>Production Ready</span>
                      </div>
                    </div>
                  </div>
                </FeatureCard>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-4">
            Ready to experience the power of AI-driven security?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all"
          >
            Get Started Free
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};