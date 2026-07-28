import { motion } from 'framer-motion';
import { FileText, Brain, BarChart3, Shield } from 'lucide-react';

interface Step {
    number: string;
    title: string;
    description: string;
    icon: React.ElementType;
}

export const HowItWorksSection = () => {
    const steps: Step[] = [
        {
            number: '01',
            title: 'Submit URL',
            description: 'Paste any suspicious URL into our scanner. Support for single URLs, batch processing, QR codes, and documents.',
            icon: FileText
        },
        {
            number: '02',
            title: 'AI Analysis',
            description: 'Our XGBoost ML model analyzes 30+ features including URL structure, domain reputation, and security indicators.',
            icon: Brain
        },
        {
            number: '03',
            title: 'SHAP Explanation',
            description: 'Get transparent, explainable results showing exactly why a URL was flagged with feature importance rankings.',
            icon: BarChart3
        },
        {
            number: '04',
            title: 'Take Action',
            description: 'Receive instant threat assessment with actionable insights. Export reports, block threats, and stay protected.',
            icon: Shield
        }
    ];

    return (
        <section id="how-it-works" className="py-24 relative overflow-hidden bg-white dark:bg-slate-900">
            {/* Animated Background */}
            <div className="absolute inset-0">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.3, 0.2]
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.3, 0.2]
                    }}
                    transition={{ duration: 10, repeat: Infinity, delay: 1 }}
                    className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
                />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center max-w-3xl mx-auto mb-20"
                >
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 mb-6"
                    >
                        <Shield className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                        <span className="text-sm font-bold text-blue-700 dark:text-cyan-400">How It Works</span>
                    </motion.div>

                    <h2 className="text-5xl md:text-6xl font-black mb-6 text-slate-900 dark:text-white">
                        Protection in{' '}
                        <span className="bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                            Four Steps
                        </span>
                    </h2>

                    <p className="text-xl text-slate-600 dark:text-slate-400">
                        Our advanced AI pipeline delivers instant, accurate threat detection with complete transparency
                    </p>
                </motion.div>

                {/* Steps Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{
                                    y: -10,
                                    rotateX: 5,
                                    rotateY: 5,
                                }}
                                style={{ transformStyle: 'preserve-3d' }}
                                className="relative group h-full"
                            >
                                {/* Connecting Line (except last item) */}
                                {index < steps.length - 1 && (
                                    <motion.div
                                        initial={{ scaleX: 0 }}
                                        whileInView={{ scaleX: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                                        className="hidden lg:block absolute top-24 left-full w-full h-0.5 bg-gradient-to-r from-blue-500 to-transparent -translate-x-1/2 z-0 origin-left"
                                    />
                                )}

                                <div className="relative p-8 rounded-3xl bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-800 dark:to-blue-900/10 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-cyan-500 transition-all shadow-xl hover:shadow-2xl h-full flex flex-col">
                                    {/* Number Badge with 3D rotation */}
                                    <motion.div
                                        whileHover={{ rotate: 360 }}
                                        transition={{ duration: 0.6 }}
                                        className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg"
                                    >
                                        <span className="text-2xl font-black text-white">{step.number}</span>
                                    </motion.div>

                                    {/* Icon with 3D float */}
                                    <motion.div
                                        animate={{
                                            y: [0, -5, 0],
                                        }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                            delay: index * 0.2
                                        }}
                                        className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                                    >
                                        <Icon className="w-8 h-8 text-white" />
                                    </motion.div>

                                    {/* Content */}
                                    <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">
                                        {step.title}
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};