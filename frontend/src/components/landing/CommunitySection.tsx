import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessageSquare } from 'lucide-react';

export const CommunitySection = () => {
    const [activeTab, setActiveTab] = useState<'chat' | 'forum'>('chat');

    return (
        <section id="community" className="py-24 relative overflow-hidden bg-white dark:bg-slate-900">
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
                        <Users className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                        <span className="text-sm font-bold text-blue-700 dark:text-cyan-400">Community</span>
                    </motion.div>

                    <h2 className="text-5xl md:text-6xl font-black mb-6 text-slate-900 dark:text-white">
                        Join Our{' '}
                        <span className="bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                            Growing Community
                        </span>
                    </h2>

                    <p className="text-xl text-slate-600 dark:text-slate-400">
                        Connect with security professionals, share insights, and stay updated on the latest threats
                    </p>
                </motion.div>

                <div className="max-w-5xl mx-auto">
                    {/* Tab Selector */}
                    <div className="flex gap-4 mb-8 justify-center">
                        {[
                            { id: 'chat' as const, label: 'Live Chat', icon: MessageSquare },
                            { id: 'forum' as const, label: 'Forum', icon: Users }
                        ].map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <motion.button
                                    key={tab.id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === tab.id
                                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {tab.label}
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Content Area */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-8 rounded-3xl bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-800 dark:to-blue-900/10 border-2 border-slate-200 dark:border-slate-700 shadow-xl"
                    >
                        <AnimatePresence mode="wait">
                            {activeTab === 'chat' ? (
                                <motion.div
                                    key="chat"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Live Community Chat</h3>
                                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                className="w-2 h-2 rounded-full bg-green-500"
                                            />
                                            <span className="text-sm font-medium text-green-700 dark:text-green-400">1,234 online</span>
                                        </div>
                                    </div>

                                    <div className="h-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 overflow-y-auto space-y-4">
                                        {/* Sample Messages */}
                                        {[
                                            { user: 'Alice', message: 'Just caught a sophisticated phishing attempt!', time: '2m ago' },
                                            { user: 'Bob', message: 'Anyone tested the new batch processing feature?', time: '5m ago' },
                                            { user: 'Carol', message: 'The SHAP explanations are incredibly helpful', time: '8m ago' }
                                        ].map((msg, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                whileHover={{ x: 5 }}
                                                className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold shrink-0">
                                                    {msg.user[0]}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-bold text-slate-900 dark:text-white">{msg.user}</span>
                                                        <span className="text-xs text-slate-400">{msg.time}</span>
                                                    </div>
                                                    <p className="text-slate-600 dark:text-slate-300">{msg.message}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Type your message..."
                                            className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-cyan-500 outline-none transition-colors"
                                        />
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold"
                                        >
                                            Send
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="forum"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Recent Discussions</h3>
                                    {[
                                        { title: 'Best practices for URL validation', replies: 24, views: 342 },
                                        { title: 'QR code phishing on the rise', replies: 18, views: 256 },
                                        { title: 'Feature request: Browser extension', replies: 45, views: 891 }
                                    ].map((topic, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            whileHover={{ x: 5, scale: 1.02 }}
                                            className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-cyan-500 transition-all cursor-pointer"
                                        >
                                            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{topic.title}</h4>
                                            <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-400">
                                                <span>{topic.replies} replies</span>
                                                <span>{topic.views} views</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};