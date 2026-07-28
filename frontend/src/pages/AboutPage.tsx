import { motion } from 'framer-motion';
import { Shield, Users, Target, Zap, Award, Globe } from 'lucide-react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { useNavigate } from 'react-router-dom';


export const AboutPage = () => {
    const navigate = useNavigate();


    const stats = [
        { icon: Users, value: '50K+', label: 'Active Users', color: 'from-blue-500 to-cyan-500' },
        { icon: Shield, value: '10M+', label: 'URLs Scanned', color: 'from-purple-500 to-pink-500' },
        { icon: Zap, value: '95.2%', label: 'Accuracy Rate', color: 'from-green-500 to-emerald-500' },
        { icon: Award, value: '24/7', label: 'Protection', color: 'from-amber-500 to-orange-500' },
    ];

    const team = [
        {
            name: 'Security Team',
            role: 'ML & Threat Intelligence',
            description: 'Expert team combining machine learning expertise with cybersecurity knowledge',
        },
        {
            name: 'Research Division',
            role: 'AI Development',
            description: 'Continuously improving our models with the latest in AI research',
        },
        {
            name: 'Support Team',
            role: '24/7 Customer Success',
            description: 'Dedicated to helping users stay protected against phishing threats',
        },
    ];

    const values = [
        {
            icon: Shield,
            title: 'Security First',
            description: 'We prioritize user security and privacy above all else, with zero data retention policy.',
        },
        {
            icon: Globe,
            title: 'Global Protection',
            description: 'Protecting users worldwide with real-time threat detection and analysis.',
        },
        {
            icon: Target,
            title: 'Accuracy Matters',
            description: 'We maintain industry-leading accuracy with minimal false positives.',
        },
    ];

    return (
        <div className="min-h-screen bg-background">
            <LandingNavbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-slate-50 dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-950">
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                y: [0, -50, 0],
                                x: [0, 30, 0],
                                scale: [1, 1.2, 1],
                            }}
                            transition={{
                                duration: 10 + i * 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 2
                            }}
                            className={`absolute w-96 h-96 rounded-full blur-3xl opacity-20 ${i === 0 ? 'bg-blue-500 top-20 left-10' :
                                i === 1 ? 'bg-cyan-500 top-40 right-20' :
                                    'bg-purple-500 bottom-20 left-1/3'
                                }`}
                        />
                    ))}
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 1, y: 0 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl mx-auto text-center space-y-6"
                    >
                        <motion.div
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-xl"
                        >
                            <Shield className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                            <span className="font-bold text-blue-700 dark:text-cyan-400">About ShieldSight</span>
                        </motion.div>

                        <h1 className="text-6xl md:text-7xl font-black leading-tight">
                            <span className="text-slate-900 dark:text-white">Protecting the </span>
                            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                                Digital World
                            </span>
                        </h1>

                        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                            ShieldSight is an enterprise-grade AI-powered phishing detection platform built with cutting-edge machine learning technology. Our mission is to make the internet safer for everyone.
                        </p>
                    </motion.div>

                    {/* Stats Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16 max-w-6xl mx-auto"
                    >
                        {stats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + index * 0.1 }}
                                    whileHover={{ y: -5, scale: 1.05 }}
                                    className="p-6 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl"
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">{stat.value}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="py-20 bg-white dark:bg-slate-900">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="space-y-6"
                        >
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">
                                Our Story
                            </h2>
                            <div className="space-y-4 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                                <p>
                                    We are final-year students from Panimalar Engineering College, driven by a shared passion for cybersecurity and innovation. During our research, we discovered a critical threat: over 3.2 billion phishing emails are sent every day, targeting individuals and organizations to steal sensitive credentials.
                                </p>
                                <p>
                                    Seeing how vulnerable users and companies are to these attacks inspired us to take action. Our idea was simple yet powerful — to make people safer through an innovative and intelligent web solution that detects and prevents phishing attempts before damage occurs.
                                </p>
                                <p>
                                    With a strong foundation in machine learning and web technologies, we built our platform to help users identify malicious links, protect their credentials, and stay one step ahead of cybercriminals. Our goal is to create a safer digital environment where security is accessible, transparent, and effective for everyone.
                                </p>
                                <p>
                                    This project is not just our final-year work — it is our contribution toward a more secure online world.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center max-w-3xl mx-auto mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-black mb-6 text-slate-900 dark:text-white">
                            Our <span className="bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">Core Values</span>
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {values.map((value, index) => {
                            const Icon = value.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ y: -10, scale: 1.02 }}
                                    className="p-8 rounded-3xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-cyan-500 shadow-xl hover:shadow-2xl transition-all"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6">
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">
                                        {value.title}
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        {value.description}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20 bg-white dark:bg-slate-900">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center max-w-3xl mx-auto mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-black mb-6 text-slate-900 dark:text-white">
                            Meet Our <span className="bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">Team</span>
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {team.map((member, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="p-8 rounded-3xl bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-800 dark:to-blue-900/10 border-2 border-slate-200 dark:border-slate-700 shadow-xl"
                            >
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6 mx-auto">
                                    <Users className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white text-center">
                                    {member.name}
                                </h3>
                                <p className="text-blue-600 dark:text-cyan-400 font-semibold mb-4 text-center">
                                    {member.role}
                                </p>
                                <p className="text-slate-600 dark:text-slate-400 text-center leading-relaxed">
                                    {member.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                <div className="container mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-3xl mx-auto text-center space-y-8"
                    >
                        <h2 className="text-4xl md:text-5xl font-black text-white">
                            Ready to Get Started?
                        </h2>
                        <p className="text-xl text-blue-100">
                            Join thousands of users protecting themselves against phishing threats.
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/signup')}
                            className="px-10 py-5 bg-white text-blue-600 rounded-2xl font-black text-lg shadow-2xl hover:shadow-white/20 transition-all"
                        >
                            Get Started Free
                        </motion.button>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};