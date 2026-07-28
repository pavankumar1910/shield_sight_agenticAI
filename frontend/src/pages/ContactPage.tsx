import { motion } from 'framer-motion';
import { Mail, MessageSquare, Phone, MapPin, Send, Clock, Globe } from 'lucide-react';
import { useState } from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { showToast } from '../components/ui/Toast';
import { sendContactMessage } from '../services/api';

export const ContactPage = () => {

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const contactMethods = [
        {
            icon: Mail,
            title: 'Email Us',
            description: 'Our support team is here to help',
            contact: 'Shieldsight.off@gmail.com',
            gradient: 'from-blue-500 to-cyan-500',
        },
        {
            icon: Phone,
            title: 'Call Us',
            description: 'Mon-Fri from 8am to 6pm EST',
            contact: '+91 9841388544',
            gradient: 'from-purple-500 to-pink-500',
        },
        {
            icon: MessageSquare,
            title: 'Live Chat',
            description: 'Get instant answers',
            contact: 'Available 24/7',
            gradient: 'from-green-500 to-emerald-500',
        },
    ];

    const officeInfo = [
        { icon: MapPin, label: 'Campus', value: 'Panimalar Engineering College, Chennai, Tamil Nadu 600123' },
        { icon: Clock, label: 'Project Status', value: 'Final Year Project - Active Development' },
        { icon: Globe, label: 'Department', value: 'Computer Science and Engineering' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await sendContactMessage(formData);

            setIsSubmitting(false);
            setSubmitted(true);
            showToast('success', 'Message sent successfully! We will get back to you soon.');

            // Reset form after 3 seconds
            setTimeout(() => {
                setSubmitted(false);
                setFormData({ name: '', email: '', subject: '', message: '' });
            }, 3000);
        } catch (error: any) {
            setIsSubmitting(false);
            showToast('error', error.response?.data?.error || 'Failed to send message. Please try again later.');
            console.error('Contact submit error:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Navbar */}
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
                        className="max-w-4xl mx-auto text-center space-y-6"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-xl"
                        >
                            <MessageSquare className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                            <span className="font-bold text-blue-700 dark:text-cyan-400">Get in Touch</span>
                        </motion.div>

                        <h1 className="text-6xl md:text-7xl font-black leading-tight">
                            <span className="text-slate-900 dark:text-white">We'd Love to </span>
                            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                                Hear From You
                            </span>
                        </h1>

                        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                            Have questions about ShieldSight? Our team is here to help you stay protected against phishing threats.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Contact Methods */}
            <section className="py-12 bg-white dark:bg-slate-900">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {contactMethods.map((method, index) => {
                            const Icon = method.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ y: -5, scale: 1.02 }}
                                    className="p-8 rounded-3xl bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-800 dark:to-blue-900/10 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-cyan-500 shadow-xl hover:shadow-2xl transition-all cursor-pointer"
                                >
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${method.gradient} flex items-center justify-center mb-6`}>
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">
                                        {method.title}
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 mb-3">
                                        {method.description}
                                    </p>
                                    <p className="text-blue-600 dark:text-cyan-400 font-semibold">
                                        {method.contact}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Contact Form & Info */}
            <section className="py-20 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-6"
                        >
                            <div>
                                <h2 className="text-4xl font-black mb-4 text-slate-900 dark:text-white">
                                    Send Us a Message
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Fill out the form below and we'll get back to you as soon as possible.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                            Your Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-cyan-500 outline-none transition-colors"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-cyan-500 outline-none transition-colors"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Subject
                                    </label>
                                    <select
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-cyan-500 outline-none transition-colors"
                                    >
                                        <option value="">Select a subject</option>
                                        <option value="general">General Inquiry</option>
                                        <option value="support">Technical Support</option>
                                        <option value="sales">Sales</option>
                                        <option value="partnership">Partnership</option>
                                        <option value="feedback">Feedback</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Message
                                    </label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={6}
                                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-cyan-500 outline-none transition-colors resize-none"
                                        placeholder="Tell us how we can help..."
                                    />
                                </div>

                                <motion.button
                                    type="submit"
                                    disabled={isSubmitting || submitted}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`w-full px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${submitted
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-xl hover:shadow-blue-500/30'
                                        }`}
                                >
                                    {submitted ? (
                                        <>
                                            <motion.svg
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-6 h-6"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </motion.svg>
                                            Message Sent!
                                        </>
                                    ) : isSubmitting ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                            />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Send Message
                                        </>
                                    )}
                                </motion.button>
                            </form>
                        </motion.div>

                        {/* Office Info */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-8"
                        >
                            <div>
                                <h2 className="text-4xl font-black mb-4 text-slate-900 dark:text-white">
                                    Visit Our Campus
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Developed by final year students at Panimalar Engineering College.
                                </p>
                            </div>

                            <div className="space-y-6">
                                {officeInfo.map((info, index) => {
                                    const Icon = info.icon;
                                    return (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: 20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex gap-4 p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg"
                                        >
                                            <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                                                    {info.label}
                                                </h3>
                                                <p className="text-slate-600 dark:text-slate-400">
                                                    {info.value}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Google Map */}
                            <div className="rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-xl h-96">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.811847672228!2d80.07251631482283!3d13.048325990805566!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5261d7b1e42a9b%3A0xc6381023c94291!2sPanimalar%20Engineering%20College!5e0!3m2!1sen!2sin!4v1677654321000!5m2!1sen!2sin"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
};