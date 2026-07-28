import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'es' | 'fr' | 'de' | 'hi';

type LanguageContextType = {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

type TranslationKey = string;
type TranslationValue = string;
type Translations = Record<Language, Record<TranslationKey, TranslationValue>>;

const translations: Translations = {
    en: {
        // Branding
        'footer.tagline': 'Advanced AI-powered protection against phishing and digital threats.',
        'footer.newsletter.title': 'Subscribe to our newsletter',
        'footer.newsletter.placeholder': 'Enter your email',
        'footer.newsletter.success': 'Successfully subscribed!',
        'footer.newsletter.error': 'Failed to subscribe. Please try again.',
        'footer.newsletter.invalid': 'Please enter a valid email address.',

        // Navigation
        'footer.product': 'Product',
        'footer.product.features': 'Features',
        'footer.product.pricing': 'Pricing',
        'footer.product.api': 'API Documentation',
        'footer.product.roadmap': 'Roadmap',
        'footer.product.security': 'Security',

        'footer.company': 'Company',
        'footer.company.about': 'About Us',
        'footer.company.careers': 'Careers',
        'footer.company.blog': 'Blog',
        'footer.company.contact': 'Contact',
        'footer.company.partners': 'Partners',

        'footer.contact': 'Contact Us',
        'footer.copyright': 'ShieldSight Security Inc. All rights reserved.',
        'footer.privacy': 'Privacy Policy',
        'footer.terms': 'Terms of Service',
        'footer.cookies': 'Cookie Policy',
    },
    es: {
        'footer.tagline': 'Protección avanzada con IA contra phishing y amenazas digitales.',
        'footer.newsletter.title': 'Suscríbete a nuestro boletín',
        'footer.newsletter.placeholder': 'Ingresa tu correo',
        'footer.newsletter.success': '¡Suscripción exitosa!',
        'footer.newsletter.error': 'Error al suscribirse. Inténtalo de nuevo.',
        'footer.newsletter.invalid': 'Por favor ingresa un correo válido.',

        'footer.product': 'Producto',
        'footer.product.features': 'Características',
        'footer.product.pricing': 'Precios',
        'footer.product.api': 'Documentación API',
        'footer.product.roadmap': 'Hoja de ruta',
        'footer.product.security': 'Seguridad',

        'footer.company': 'Empresa',
        'footer.company.about': 'Nosotros',
        'footer.company.careers': 'Carreras',
        'footer.company.blog': 'Blog',
        'footer.company.contact': 'Contacto',
        'footer.company.partners': 'Socios',

        'footer.contact': 'Contáctanos',
        'footer.copyright': 'ShieldSight Security Inc. Todos los derechos reservados.',
        'footer.privacy': 'Política de Privacidad',
        'footer.terms': 'Términos de Servicio',
        'footer.cookies': 'Política de Cookies',
    },
    fr: {
        'footer.tagline': 'Protection avancée par IA contre le phishing et les menaces numériques.',
        'footer.newsletter.title': 'Abonnez-vous à notre newsletter',
        'footer.newsletter.placeholder': 'Entrez votre email',
        'footer.newsletter.success': 'Abonnement réussi !',
        'footer.newsletter.error': 'Échec de l\'abonnement. Réessayez.',
        'footer.newsletter.invalid': 'Veuillez entrer une adresse email valide.',

        'footer.product': 'Produit',
        'footer.product.features': 'Fonctionnalités',
        'footer.product.pricing': 'Tarifs',
        'footer.product.api': 'Documentation API',
        'footer.product.roadmap': 'Feuille de route',
        'footer.product.security': 'Sécurité',

        'footer.company': 'Entreprise',
        'footer.company.about': 'À propos',
        'footer.company.careers': 'Carrières',
        'footer.company.blog': 'Blog',
        'footer.company.contact': 'Contact',
        'footer.company.partners': 'Partenaires',

        'footer.contact': 'Nous contacter',
        'footer.copyright': 'ShieldSight Security Inc. Tous droits réservés.',
        'footer.privacy': 'Politique de confidentialité',
        'footer.terms': 'Conditions d\'utilisation',
        'footer.cookies': 'Politique des cookies',
    },
    de: {
        'footer.tagline': 'Fortschrittlicher KI-Schutz gegen Phishing und digitale Bedrohungen.',
        'footer.newsletter.title': 'Newsletter abonnieren',
        'footer.newsletter.placeholder': 'E-Mail eingeben',
        'footer.newsletter.success': 'Erfolgreich abonniert!',
        'footer.newsletter.error': 'Abonnement fehlgeschlagen. Bitte erneut versuchen.',
        'footer.newsletter.invalid': 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',

        'footer.product': 'Produkt',
        'footer.product.features': 'Funktionen',
        'footer.product.pricing': 'Preise',
        'footer.product.api': 'API-Dokumentation',
        'footer.product.roadmap': 'Roadmap',
        'footer.product.security': 'Sicherheit',

        'footer.company': 'Unternehmen',
        'footer.company.about': 'Über uns',
        'footer.company.careers': 'Karriere',
        'footer.company.blog': 'Blog',
        'footer.company.contact': 'Kontakt',
        'footer.company.partners': 'Partner',

        'footer.contact': 'Kontaktieren Sie uns',
        'footer.copyright': 'ShieldSight Security Inc. Alle Rechte vorbehalten.',
        'footer.privacy': 'Datenschutz',
        'footer.terms': 'Nutzungsbedingungen',
        'footer.cookies': 'Cookie-Richtlinie',
    },
    hi: {
        'footer.tagline': 'फ़िशिंग और डिजिटल खतरों के खिलाफ उन्नत AI-संचालित सुरक्षा।',
        'footer.newsletter.title': 'हमारे न्यूज़लेटर की सदस्यता लें',
        'footer.newsletter.placeholder': 'अपना ईमेल दर्ज करें',
        'footer.newsletter.success': 'सफलतापूर्वक सदस्यता ली गई!',
        'footer.newsletter.error': 'सदस्यता विफल रही। कृपया पुनः प्रयास करें।',
        'footer.newsletter.invalid': 'कृपया एक वैध ईमेल पता दर्ज करें।',

        'footer.product': 'उत्पाद',
        'footer.product.features': 'विशेषताएँ',
        'footer.product.pricing': 'मूल्य निर्धारण',
        'footer.product.api': 'API दस्तावेज़ीकरण',
        'footer.product.roadmap': 'रोडमैप',
        'footer.product.security': 'सुरक्षा',

        'footer.company': 'कंपनी',
        'footer.company.about': 'हमारे बारे में',
        'footer.company.careers': 'करियर',
        'footer.company.blog': 'ब्लॉग',
        'footer.company.contact': 'संपर्क करें',
        'footer.company.partners': 'भागीदार',

        'footer.contact': 'हमसे संपर्क करें',
        'footer.copyright': 'ShieldSight Security Inc. सर्वाधिकार सुरक्षित।',
        'footer.privacy': 'गोपनीयता नीति',
        'footer.terms': 'सेवा की शर्तें',
        'footer.cookies': 'कुकी नीति',
    },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>('en');

    useEffect(() => {
        // Load saved language from localStorage
        const savedLanguage = localStorage.getItem('language') as Language;
        if (savedLanguage && translations[savedLanguage]) {
            setLanguageState(savedLanguage);
        } else {
            // Detect browser language
            const browserLang = navigator.language.split('-')[0] as Language;
            if (translations[browserLang]) {
                setLanguageState(browserLang);
            }
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
    };

    const t = (key: string): string => {
        return translations[language]?.[key] || translations.en[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};
