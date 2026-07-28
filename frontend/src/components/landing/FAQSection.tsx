import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQ {
    question: string;
    answer: string;
}

export const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs: FAQ[] = [
        {
            question: 'How accurate is ShieldSight\'s phishing detection?',
            answer: 'ShieldSight achieves 95.2% accuracy with a false positive rate of only 3.75%. Our XGBoost ML model is trained on millions of URLs and validated against the Alexa Top-1M domains to ensure reliability.'
        },
        {
            question: 'What types of URLs can I scan?',
            answer: 'You can scan any URL directly, extract URLs from QR codes, PDF documents, DOCX files, TXT files, and emails. We also support batch processing of up to 100 URLs simultaneously.'
        },
        {
            question: 'How fast is the analysis?',
            answer: 'Our fast mode returns results in approximately 140ms. For cached URLs, responses are delivered in just 4ms. Full analysis with SHAP explanations takes around 2 seconds.'
        },
        {
            question: 'Is my data kept private?',
            answer: 'Absolutely. We do not store any URLs you submit. All analysis is performed in real-time, and only temporary caching (5 minutes) is used for performance optimization. We never collect or share your data.'
        },
        {
            question: 'What is SHAP and why is it important?',
            answer: 'SHAP (SHapley Additive exPlanations) provides transparent explanations for why a URL was classified as phishing or legitimate. You can see exactly which features contributed to the decision, making our AI completely explainable.'
        },
        {
            question: 'Can I integrate ShieldSight into my application?',
            answer: 'Yes! We offer a comprehensive REST API with detailed documentation. You can integrate real-time URL scanning into your application, security tools, or workflow automation.'
        }
    ];

    return (
        <section id="faq" className="py-24 relative overflow-hidden bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
            <div className="container mx-auto px-6 relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center max-w-3xl mx-auto mb-16"
                >
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 mb-6"
                    >
                        <HelpCircle className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                        <span className="text-sm font-bold text-blue-700 dark:text-cyan-400">FAQ</span>
                    </motion.div>

                    <h2 className="text-5xl md:text-6xl font-black mb-6 text-slate-900 dark:text-white">
                        Frequently Asked{' '}
                        <span className="bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                            Questions
                        </span>
                    </h2>
                </motion.div>

                {/* FAQ List */}
                <div className="max-w-4xl mx-auto space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.01 }}
                            className="border-2 border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-800 hover:border-blue-500 dark:hover:border-cyan-500 transition-all shadow-lg"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full p-6 flex items-center justify-between text-left group"
                            >
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white pr-8 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                                    {faq.question}
                                </h3>
                                <motion.div
                                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="shrink-0"
                                >
                                    <ChevronDown className="w-6 h-6 text-blue-600 dark:text-cyan-400" />
                                </motion.div>
                            </button>

                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 pb-6 text-slate-600 dark:text-slate-400 leading-relaxed">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};