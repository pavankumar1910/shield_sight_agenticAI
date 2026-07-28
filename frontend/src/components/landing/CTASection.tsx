import { motion } from 'framer-motion';
import { ArrowRight, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';

export const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 bg-[length:200%_200%] animate-gradient" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Glass Card Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative rounded-3xl p-8 md:p-12 overflow-hidden text-center"
          >
            {/* Glass Background */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl" />

            {/* Content Wrapper */}
            <div className="relative z-10">
              {/* Icon */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-lg border border-white/10 mb-8 shadow-xl"
              >
                <Shield className="w-10 h-10 text-white drop-shadow-md" />
              </motion.div>

              {/* Heading */}
              <h2 className="text-4xl lg:text-5xl font-heading font-bold text-white mb-6 drop-shadow-lg">
                Ready to Protect Your Digital Identity?
              </h2>
              <p className="text-xl text-blue-50/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                Join thousands of users who trust ShieldSight for advanced phishing protection.
                Start scanning URLs for free today.
              </p>

              {/* Buttons */}
              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  onClick={() => navigate('/signup')}
                  size="lg"
                  className="px-10 py-6 text-lg bg-white text-blue-600 hover:bg-blue-50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <Button
                  onClick={() => navigate('/login')}
                  size="lg"
                  variant="outline"
                  className="px-10 py-6 text-lg border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
                >
                  Sign In
                </Button>
              </div>

              {/* Trust Badges */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  visible: { transition: { staggerChildren: 0.1 } }
                }}
                className="mt-12 flex flex-wrap justify-center gap-8"
              >
                {[
                  { icon: Shield, text: "SSL Encrypted" },
                  { icon: Shield, text: "GDPR Compliant" },
                  { icon: Shield, text: "SOC 2 Certified" }
                ].map((badge, idx) => (
                  <motion.div
                    key={idx}
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    className="flex items-center gap-2 text-white/90 text-sm font-medium bg-white/10 py-2 px-4 rounded-full border border-white/10 backdrop-blur-sm"
                  >
                    <badge.icon className="w-4 h-4" />
                    <span>{badge.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Elements */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/30 rounded-full blur-[100px] mix-blend-screen pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-[100px] mix-blend-screen pointer-events-none"
      />
    </section>
  );
};