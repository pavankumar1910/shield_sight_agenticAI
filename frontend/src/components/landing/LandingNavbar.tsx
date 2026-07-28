import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Sun, Moon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom'; // Added useLocation
import { useThemeStore } from '../../stores/themeStore';

export const LandingNavbar = () => {
    const { theme, toggleTheme } = useThemeStore();
    const navigate = useNavigate();
    const location = useLocation(); // Get current route
    const [scrolled, setScrolled] = React.useState(false);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [hoveredNav, setHoveredNav] = React.useState<string | null>(null);

    React.useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handle hash navigation
    React.useEffect(() => {
        if (location.hash) {
            const element = document.querySelector(location.hash);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 500);
            }
        }
    }, [location.hash, location.pathname]);

    const navItems = [
        { label: 'Features', href: '#features', type: 'scroll' },
        { label: 'How It Works', href: '#how-it-works', type: 'scroll' },
        { label: 'FAQ', href: '#faq', type: 'scroll' },
        { label: 'About', href: '/about', type: 'page' },
        { label: 'Contact', href: '/contact', type: 'page' },
    ];

    const handleNavClick = (item: typeof navItems[0], e: React.MouseEvent) => {
        // If it's a page link (About/Contact), just navigate
        if (item.type === 'page') {
            e.preventDefault();
            navigate(item.href);
            setIsMenuOpen(false);
            return;
        }

        // If it's a scroll link
        if (item.type === 'scroll') {
            e.preventDefault();

            // If we are already on the landing page
            // If we are already on the landing page, manually scroll
            if (location.pathname === '/') {
                const element = document.querySelector(item.href);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            } else {
                // If elsewhere, navigate to home + hash (useEffect above will handle scroll)
                navigate(`/${item.href}`);
            }
            setIsMenuOpen(false);
        }
    };

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled || location.pathname !== '/' // Always show bg if not on landing (optional, or keep transparent until scroll)
                ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-700/50 shadow-lg shadow-black/5'
                : 'bg-transparent border-transparent'
                }`}
        >
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo with 3D effect */}
                    <motion.div
                        className="flex items-center gap-3 cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            if (location.pathname === '/') {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            } else {
                                navigate('/');
                            }
                        }}
                    >
                        <div className="relative">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 rounded-2xl blur-md opacity-50"
                            />
                            <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                                <Shield className="w-7 h-7 text-white" />
                            </div>
                        </div>
                        <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                            ShieldSight
                        </span>
                    </motion.div>

                    {/* Desktop Navigation - ENHANCED HOVER */}
                    <div className="hidden lg:flex items-center gap-2">
                        {navItems.map((item, index) => {
                            const isActive = location.pathname === item.href;

                            return (
                                <motion.div
                                    key={item.label}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onMouseEnter={() => setHoveredNav(item.label)}
                                    onMouseLeave={() => setHoveredNav(null)}
                                    className="relative"
                                >
                                    <motion.a
                                        href={item.href}
                                        onClick={(e) => handleNavClick(item, e)}
                                        whileHover={{ y: -2 }}
                                        className="relative px-4 py-2 text-slate-600 dark:text-slate-300 font-medium transition-colors overflow-hidden rounded-lg group"
                                    >
                                        {/* Animated Background on Hover */}
                                        <motion.div
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{
                                                scale: hoveredNav === item.label || isActive ? 1 : 0,
                                                opacity: hoveredNav === item.label || isActive ? 1 : 0
                                            }}
                                            transition={{ duration: 0.3, ease: "easeOut" }}
                                            className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg"
                                        />

                                        {/* Text */}
                                        <span className={`relative z-10 transition-colors ${hoveredNav === item.label || isActive
                                            ? 'text-blue-600 dark:text-cyan-400'
                                            : ''
                                            }`}>
                                            {item.label}
                                        </span>

                                        {/* Animated Underline */}
                                        <motion.span
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: hoveredNav === item.label || isActive ? '100%' : '0%'
                                            }}
                                            transition={{ duration: 0.3 }}
                                            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-500"
                                        />

                                        {/* Glow Effect on Hover */}
                                        {(hoveredNav === item.label || isActive) && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="absolute inset-0 bg-blue-500/5 rounded-lg blur-xl -z-10"
                                            />
                                        )}
                                    </motion.a>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        {/* Enhanced Theme Toggle */}
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 180 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleTheme}
                            className="relative w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors overflow-hidden group"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                whileHover={{ scale: 1 }}
                                className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 group-hover:opacity-100 opacity-0 transition-opacity"
                            />
                            {theme === 'dark' ? <Sun className="w-5 h-5 relative z-10" /> : <Moon className="w-5 h-5 relative z-10" />}
                        </motion.button>

                        {/* Enhanced Get Started Button */}
                        <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/signup')}
                            className="hidden md:flex relative px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold overflow-hidden group"
                        >
                            <motion.div
                                initial={{ x: '-100%' }}
                                whileHover={{ x: '100%' }}
                                transition={{ duration: 0.5 }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            />
                            <span className="relative z-10">Get Started</span>

                            {/* Glow Effect */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileHover={{ opacity: 1 }}
                                className="absolute inset-0 bg-blue-500/20 blur-xl"
                            />
                        </motion.button>

                        {/* Mobile Menu Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </motion.button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden overflow-hidden"
                    >
                        <div className="pt-4 pb-6 space-y-2">
                            {navItems.map((item) => (
                                <motion.a
                                    key={item.label}
                                    href={item.href}
                                    onClick={(e) => handleNavClick(item, e)}
                                    whileHover={{ x: 5, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                                    className="block px-4 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
                                >
                                    {item.label}
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.nav>
    );
};
