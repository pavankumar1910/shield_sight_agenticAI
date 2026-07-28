import { motion, useScroll, useTransform } from 'framer-motion';
import { Shield, Zap, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';

export const HeroSection = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* 3D Animated Background - Spline Style */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-slate-50 dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-950"
      >
        {/* 3D Floating Orbs with Depth */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -60 - i * 20, 0],
              x: [0, 40 - i * 10, -20, 0],
              scale: [1, 1.3 + i * 0.1, 1],
              rotateX: [0, 180, 360],
              rotateY: [0, 180, 360],
              rotateZ: [0, 90, 0],
            }}
            transition={{
              duration: 12 + i * 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1.5
            }}
            style={{
              transformStyle: 'preserve-3d',
              perspective: '1000px',
              top: `${15 + i * 15}%`,
              left: `${10 + i * 18}%`,
            }}
            className={`absolute w-64 h-64 rounded-full blur-3xl opacity-20 ${i % 3 === 0 ? 'bg-blue-500' :
                i % 3 === 1 ? 'bg-cyan-400' :
                  'bg-purple-500'
              }`}
          />
        ))}

        {/* Animated Grid Pattern */}
        <motion.div
          animate={{
            backgroundPosition: ['0px 0px', '50px 50px'],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem]"
        />

        {/* Rotating Gradient Mesh */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl"
        />
      </motion.div>

      <motion.div
        style={{ opacity }}
        className="container mx-auto px-6 relative z-10"
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Badge with 3D effect */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{
                scale: 1.05,
                rotateX: 10,
                rotateY: 10,
              }}
              transition={{ delay: 0.2 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                95.2% AI Detection Accuracy
              </span>
            </motion.div>

            {/* Heading */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl lg:text-7xl font-heading font-bold leading-tight text-foreground"
              >
                Defend Against
                <br />
                <motion.span
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 dark:from-blue-400 dark:via-cyan-400 dark:to-blue-500 bg-[length:200%_auto] bg-clip-text text-transparent"
                >
                  Phishing Threats
                </motion.span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-muted-foreground max-w-lg"
              >
                Advanced ML-powered phishing detection. Analyze URLs in real-time with
                explainable AI and comprehensive threat intelligence.
              </motion.p>
            </div>

            {/* CTA Button - ONLY ONE BUTTON */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <Button
                onClick={() => navigate('/signup')}
                size="lg"
                className="px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 text-white shadow-xl hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-6 pt-8 border-t border-blue-200 dark:border-blue-500/20"
            >
              {[
                { label: 'Accuracy', value: '95%+', color: 'text-green-600 dark:text-green-400' },
                { label: 'URLs Analyzed', value: '10M+', color: 'text-blue-600 dark:text-blue-400' },
                { label: 'Users Protected', value: '50K+', color: 'text-cyan-600 dark:text-cyan-400' },
              ].map((stat, index) => (
                <div key={index} className="space-y-1">
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Content - 3D Floating Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* 3D Floating Card - NO ROTATION on logo */}
            <motion.div
              animate={{
                y: [0, -25, 0],
                rotateX: [0, 3, 0],
                rotateY: [0, -3, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px'
              }}
              className="relative"
            >
              {/* Glowing Border */}
              <div className="relative rounded-3xl p-1 bg-gradient-to-r from-blue-500/50 via-cyan-500/50 to-blue-500/50 shadow-2xl">
                {/* Animated Glow */}
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.4, 0.7, 0.4]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur-xl"
                />

                {/* Card Content */}
                <div className="relative glass rounded-3xl p-8 backdrop-blur-xl bg-blue-950/90 border border-blue-500/20">
                  {/* Dashboard Mock */}
                  <div className="space-y-6">
                    {/* Header - NO ROTATION */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Shield className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">ShieldSight Pro</h3>
                        <p className="text-sm text-blue-300">ML Detection Engine</p>
                      </div>
                    </div>

                    {/* URL Input Mock */}
                    <div className="space-y-3">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="h-14 bg-blue-900/30 border border-blue-500/20 rounded-lg flex items-center px-4"
                      >
                        <Lock className="w-5 h-5 text-blue-400 mr-3" />
                        <motion.span
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-blue-200/60 text-sm"
                        >
                          https://suspicious-url.com...
                        </motion.span>
                      </motion.div>
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3">
                        <Zap className="w-4 h-4 mr-2" />
                        Analyze with AI
                      </Button>
                    </div>

                    {/* Stats Grid with 3D Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Total Scans', value: '1,234', icon: Shield, gradient: 'from-blue-500 to-blue-600' },
                        { label: 'Threats Blocked', value: '156', icon: Lock, gradient: 'from-red-500 to-red-600' },
                      ].map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                          <motion.div
                            key={index}
                            whileHover={{
                              scale: 1.05,
                              y: -5,
                              rotateX: 5,
                              rotateY: 5,
                            }}
                            style={{ transformStyle: 'preserve-3d' }}
                            className="p-4 rounded-xl bg-blue-900/30 border border-blue-500/20 backdrop-blur group hover:bg-blue-900/50 transition-all cursor-pointer"
                          >
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.gradient} mb-3 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                            <p className="text-xs text-blue-300">{stat.label}</p>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Status Indicator */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="w-2 h-2 rounded-full bg-green-500"
                        />
                        <span className="text-sm text-green-400">System Active</span>
                      </div>
                      <span className="text-xs text-green-400/60">Real-time Protection</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3D Decorative Elements */}
              <motion.div
                animate={{
                  rotate: 360,
                  scale: [1, 1.3, 1],
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                style={{ transformStyle: 'preserve-3d' }}
                className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-2xl"
              />
              <motion.div
                animate={{
                  rotate: -360,
                  scale: [1, 1.4, 1]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                style={{ transformStyle: 'preserve-3d' }}
                className="absolute -bottom-10 -left-10 w-48 h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-2xl"
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ delay: 1, duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="w-6 h-10 border-2 border-blue-400/50 rounded-full flex justify-center">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-3 bg-blue-400 rounded-full mt-2"
          />
        </div>
      </motion.div>
    </section>
  );
};