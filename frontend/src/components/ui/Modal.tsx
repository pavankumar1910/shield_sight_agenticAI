import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-card w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-2xl border border-border flex flex-col pointer-events-auto"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-border">
                                <h2 className="text-xl font-bold text-foreground">
                                    {title}
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-primary/20 hover:scrollbar-thumb-primary/30">
                                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                                    {children}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-border flex justify-end">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
