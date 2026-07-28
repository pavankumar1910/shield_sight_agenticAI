
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin, Shield, Globe, Loader2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { trackLinkClick, trackSocialClick, trackNewsletterSubscription } from '../../utils/analytics';

export const Footer = () => {
    const currentYear = new Date().getFullYear();
    const { language, setLanguage, t } = useLanguage();

    // Newsletter form state
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Email validation
    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Newsletter submission handler
    const handleNewsletterSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Validation
        if (!validateEmail(email)) {
            setNotification({ type: 'error', message: t('footer.newsletter.invalid') });
            setTimeout(() => setNotification(null), 3000);
            return;
        }

        setIsSubmitting(true);

        try {
            // Simulate API call - replace with your actual endpoint
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // In production, make actual API call:
            // const response = await fetch('/api/newsletter/subscribe', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ email }),
            // });

            trackNewsletterSubscription(email, true);
            setNotification({ type: 'success', message: t('footer.newsletter.success') });
            setEmail(''); // Reset form

            setTimeout(() => setNotification(null), 5000);
        } catch (error) {
            trackNewsletterSubscription(email, false);
            setNotification({ type: 'error', message: t('footer.newsletter.error') });
            setTimeout(() => setNotification(null), 3000);
        } finally {
            setIsSubmitting(false);
        }
    };

    const productLinks = [
        { key: 'footer.product.features', href: '#features' },
        { key: 'footer.product.pricing', href: '#pricing' },
        { key: 'footer.product.api', href: '#api' },
        { key: 'footer.product.roadmap', href: '#roadmap' },
        { key: 'footer.product.security', href: '#security' },
    ];

    const companyLinks = [
        { key: 'footer.company.about', href: '#about' },
        { key: 'footer.company.careers', href: '#careers' },
        { key: 'footer.company.blog', href: '#blog' },
        { key: 'footer.company.contact', href: '#contact' },
        { key: 'footer.company.partners', href: '#partners' },
    ];

    const socialIcons = [
        { Icon: Twitter, name: 'Twitter', url: '#' },
        { Icon: Linkedin, name: 'LinkedIn', url: '#' },
        { Icon: Facebook, name: 'Facebook', url: '#' },
        { Icon: Instagram, name: 'Instagram', url: '#' },
    ];

    const languages = [
        { code: 'en' as const, label: 'English', flag: '🇺🇸' },
        { code: 'es' as const, label: 'Español', flag: '🇪🇸' },
        { code: 'fr' as const, label: 'Français', flag: '🇫🇷' },
        { code: 'de' as const, label: 'Deutsch', flag: '🇩🇪' },
        { code: 'hi' as const, label: 'हिन्दी', flag: '🇮🇳' },
    ];

    return (
        <footer className="bg-gradient-to-b from-background to-blue-50/50 dark:to-blue-950/20 border-t border-border mt-auto">
            <div className="container mx-auto px-6 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                    {/* Branding */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-heading font-bold text-foreground">
                                ShieldSight
                            </span>
                        </div>
                        <p className="text-muted-foreground leading-relaxed max-w-xs">
                            {t('footer.tagline')}
                        </p>

                        {/* Newsletter */}
                        <div className="space-y-3">
                            <h4 className="font-semibold text-sm">{t('footer.newsletter.title')}</h4>
                            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={t('footer.newsletter.placeholder')}
                                        disabled={isSubmitting}
                                        className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[40px]"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Mail className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>

                                {/* Notification */}
                                {notification && (
                                    <div className={`text-xs p-2 rounded ${notification.type === 'success'
                                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                        : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                        }`}>
                                        {notification.message}
                                    </div>
                                )}
                            </form>
                        </div>

                        <div className="flex space-x-4">
                            {socialIcons.map(({ Icon, name, url }) => (
                                <a
                                    key={name}
                                    href={url}
                                    onClick={() => trackSocialClick(name)}
                                    className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-500 hover:text-white transition-all duration-300"
                                    aria-label={name}
                                >
                                    <Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-foreground text-lg mb-6">{t('footer.product')}</h3>
                        <ul className="space-y-4">
                            {productLinks.map(({ key, href }) => (
                                <li key={key}>
                                    <a
                                        href={href}
                                        onClick={() => trackLinkClick('Product', t(key))}
                                        className="text-muted-foreground hover:text-blue-500 transition-colors flex items-center gap-2 group"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {t(key)}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="font-semibold text-foreground text-lg mb-6">{t('footer.company')}</h3>
                        <ul className="space-y-4">
                            {companyLinks.map(({ key, href }) => (
                                <li key={key}>
                                    <a
                                        href={href}
                                        onClick={() => trackLinkClick('Company', t(key))}
                                        className="text-muted-foreground hover:text-blue-500 transition-colors flex items-center gap-2 group"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {t(key)}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="font-semibold text-foreground text-lg mb-6">{t('footer.contact')}</h3>
                        <ul className="space-y-6">
                            <li className="flex items-start gap-3 text-muted-foreground">
                                <MapPin className="w-5 h-5 text-blue-500 shrink-0 mt-1" />
                                <span>
                                    Bangalore Trunk Road, Varadharajapuram,<br />
                                    Poonamallee, Chennai, Tamil Nadu 600123
                                </span>
                            </li>
                            <li className="flex items-center gap-3 text-muted-foreground">
                                <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                                <a
                                    href="mailto:support@sentinelx.security"
                                    onClick={() => trackLinkClick('Contact', 'Email')}
                                    className="hover:text-blue-500 transition-colors"
                                >
                                    Shieldsight.off@gmail.com
                                </a>
                            </li>
                            <li className="flex items-center gap-3 text-muted-foreground">
                                <Phone className="w-5 h-5 text-blue-500 shrink-0" />
                                <a
                                    href="tel:+91 9841388544"
                                    onClick={() => trackLinkClick('Contact', 'Phone')}
                                    className="hover:text-blue-500 transition-colors"
                                >
                                    +91 9841388544
                                </a>
                            </li>
                        </ul>

                        {/* Language Selector */}
                        <div className="mt-6">
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value as any)}
                                    className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer appearance-none"
                                >
                                    {languages.map(({ code, label, flag }) => (
                                        <option key={code} value={code}>
                                            {flag} {label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                    <p>© {currentYear} {t('footer.copyright')}</p>
                    <div className="flex gap-8">
                        <a
                            href="#privacy"
                            onClick={() => trackLinkClick('Legal', 'Privacy Policy')}
                            className="hover:text-blue-500 transition-colors"
                        >
                            {t('footer.privacy')}
                        </a>
                        <a
                            href="#terms"
                            onClick={() => trackLinkClick('Legal', 'Terms of Service')}
                            className="hover:text-blue-500 transition-colors"
                        >
                            {t('footer.terms')}
                        </a>
                        <a
                            href="#cookies"
                            onClick={() => trackLinkClick('Legal', 'Cookie Policy')}
                            className="hover:text-blue-500 transition-colors"
                        >
                            {t('footer.cookies')}
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
