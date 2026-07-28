// Analytics utility for tracking user interactions
// In production, integrate with Google Analytics, Mixpanel, or similar

export type AnalyticsEvent = {
    category: string;
    action: string;
    label?: string;
    value?: number;
};

export const trackEvent = ({ category, action, label, value }: AnalyticsEvent) => {
    // Console log in development
    if (process.env.NODE_ENV === 'development') {
        console.log('📊 Analytics Event:', { category, action, label, value });
    }

    // Integrate with your analytics provider here
    // Example for Google Analytics:
    // if (typeof window.gtag !== 'undefined') {
    //   window.gtag('event', action, {
    //     event_category: category,
    //     event_label: label,
    //     value: value,
    //   });
    // }

    // Example for Mixpanel:
    // if (typeof window.mixpanel !== 'undefined') {
    //   window.mixpanel.track(action, { category, label, value });
    // }
};

export const trackPageView = (path: string) => {
    if (process.env.NODE_ENV === 'development') {
        console.log('📄 Page View:', path);
    }

    // Add your page view tracking here
};

export const trackNewsletterSubscription = (email: string, success: boolean) => {
    trackEvent({
        category: 'Newsletter',
        action: success ? 'Subscribe Success' : 'Subscribe Failed',
        label: email,
    });
};

export const trackLinkClick = (linkType: string, linkLabel: string) => {
    trackEvent({
        category: 'Footer',
        action: 'Link Click',
        label: `${linkType}: ${linkLabel}`,
    });
};

export const trackSocialClick = (platform: string) => {
    trackEvent({
        category: 'Social Media',
        action: 'Click',
        label: platform,
    });
};
