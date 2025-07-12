/*
 * Keeton Trades - Configuration File
 * 
 * This file contains all the configuration settings for the Keeton Trades platform.
 * It includes API keys, endpoints, and other settings needed for the application.
 * 
 * IMPORTANT: Replace the placeholder values with your actual API keys!
 * 
 * Security Note: In a production environment, these sensitive values should be
 * stored as environment variables or in a secure configuration management system.
 */

// =======================
// Stripe Configuration
// =======================
const STRIPE_CONFIG = {
    // Replace with your actual Stripe publishable key
    // Get this from your Stripe Dashboard -> Developers -> API keys
    publishableKey: 'pk_test_51234567890abcdef_YOUR_STRIPE_PUBLISHABLE_KEY_HERE',
    
    // Currency for payments (ISO 4217 code)
    currency: 'usd',
    
    // Membership plan IDs from Stripe
    // Create these in your Stripe Dashboard -> Products
    membershipPlans: {
        starter: {
            priceId: 'price_starter_monthly_YOUR_PRICE_ID_HERE',
            name: 'Starter',
            price: 49,
            currency: 'usd'
        },
        pro: {
            priceId: 'price_pro_monthly_YOUR_PRICE_ID_HERE',
            name: 'Pro',
            price: 99,
            currency: 'usd'
        },
        elite: {
            priceId: 'price_elite_monthly_YOUR_PRICE_ID_HERE',
            name: 'Elite',
            price: 199,
            currency: 'usd'
        }
    }
};

// =======================
// Whop Configuration
// =======================
const WHOP_CONFIG = {
    // Replace with your actual Whop API key
    // Get this from your Whop Dashboard -> Developer -> API Keys
    apiKey: 'whop_YOUR_API_KEY_HERE',
    
    // Your Whop company ID
    // Find this in your Whop Dashboard -> Settings -> Company
    companyId: 'comp_YOUR_COMPANY_ID_HERE',
    
    // Product IDs from Whop (these should match your Stripe products)
    // Create these in your Whop Dashboard -> Products
    products: {
        starter: 'prod_starter_YOUR_PRODUCT_ID_HERE',
        pro: 'prod_pro_YOUR_PRODUCT_ID_HERE',
        elite: 'prod_elite_YOUR_PRODUCT_ID_HERE'
    },
    
    // Whop API endpoints
    endpoints: {
        baseUrl: 'https://api.whop.com/v1',
        checkout: '/checkout',
        subscriptions: '/subscriptions',
        products: '/products'
    }
};

// =======================
// Application Configuration
// =======================
const APP_CONFIG = {
    // Application metadata
    name: 'Keeton Trades',
    version: '1.0.0',
    author: 'Keeton Trades Team',
    
    // Contact information
    contact: {
        email: 'support@keetontrades.com',
        phone: '+1 (555) 123-4567',
        address: '123 Trading Street, Financial District, NY 10001'
    },
    
    // Social media links
    social: {
        twitter: 'https://twitter.com/keetontrades',
        linkedin: 'https://linkedin.com/company/keetontrades',
        telegram: 'https://t.me/keetontrades',
        discord: 'https://discord.gg/kt3KkKxG'
    },
    
    // Feature toggles
    features: {
        darkMode: true,
        animations: true,
        newsletter: true,
        analytics: true,
        chatSupport: false
    },
    
    // Animation and UI settings
    ui: {
        animationDuration: 300,
        loadingTimeout: 3000,
        scrollOffset: 100,
        mobileBreakpoint: 768
    }
};

// =======================
// Trading Chart Configuration
// =======================
const CHART_CONFIG = {
    // Chart.js configuration for the analytics chart
    type: 'line',
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                display: false,
                grid: {
                    display: false
                }
            },
            y: {
                display: false,
                grid: {
                    display: false
                }
            }
        },
        elements: {
            line: {
                tension: 0.4,
                borderWidth: 2,
                borderColor: '#FFD700'
            },
            point: {
                radius: 0,
                hoverRadius: 6,
                backgroundColor: '#FFD700'
            }
        }
    },
    
    // Sample data for the chart
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Portfolio Value',
            data: [65000, 78000, 85000, 92000, 105000, 125000],
            borderColor: '#FFD700',
            backgroundColor: 'rgba(255, 215, 0, 0.1)',
            fill: true
        }]
    }
};

// =======================
// Email Configuration
// =======================
const EMAIL_CONFIG = {
    // EmailJS configuration for contact form
    // Sign up at https://www.emailjs.com/
    serviceId: 'service_YOUR_SERVICE_ID_HERE',
    templateId: 'template_YOUR_TEMPLATE_ID_HERE',
    userId: 'user_YOUR_USER_ID_HERE',
    
    // Email templates
    templates: {
        contact: 'template_contact_form',
        welcome: 'template_welcome_email',
        newsletter: 'template_newsletter_signup'
    }
};

// =======================
// Environment Detection
// =======================
const ENV_CONFIG = {
    // Automatically detect environment
    isDevelopment: window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname === '',
    
    isProduction: window.location.hostname !== 'localhost' && 
                  window.location.hostname !== '127.0.0.1' &&
                  window.location.hostname !== '',
    
    // API endpoints based on environment
    get apiBaseUrl() {
        return this.isProduction ? 'https://api.keetontrades.com' : 'http://localhost:3000';
    },
    
    // Enable debug mode in development
    get debugMode() {
        return this.isDevelopment;
    }
};

// =======================
// Validation Rules
// =======================
const VALIDATION_CONFIG = {
    // Form validation rules
    email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address'
    },
    
    phone: {
        pattern: /^\+?[\d\s\-\(\)]+$/,
        message: 'Please enter a valid phone number'
    },
    
    name: {
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-Z\s]+$/,
        message: 'Name must contain only letters and spaces'
    },
    
    message: {
        minLength: 10,
        maxLength: 500,
        message: 'Message must be between 10 and 500 characters'
    }
};

// =======================
// Export Configuration
// =======================
// Make configuration available globally
window.STRIPE_CONFIG = STRIPE_CONFIG;
window.WHOP_CONFIG = WHOP_CONFIG;
window.APP_CONFIG = APP_CONFIG;
window.CHART_CONFIG = CHART_CONFIG;
window.EMAIL_CONFIG = EMAIL_CONFIG;
window.ENV_CONFIG = ENV_CONFIG;
window.VALIDATION_CONFIG = VALIDATION_CONFIG;

// =======================
// Configuration Validation
// =======================
function validateConfiguration() {
    const errors = [];
    
    // Check Stripe configuration
    if (STRIPE_CONFIG.publishableKey.includes('YOUR_STRIPE_PUBLISHABLE_KEY_HERE')) {
        errors.push('Stripe publishable key needs to be configured');
    }
    
    // Check Whop configuration
    if (WHOP_CONFIG.apiKey.includes('YOUR_API_KEY_HERE')) {
        errors.push('Whop API key needs to be configured');
    }
    
    // Check Email configuration
    if (EMAIL_CONFIG.serviceId.includes('YOUR_SERVICE_ID_HERE')) {
        errors.push('Email service configuration needs to be set up');
    }
    
    // Log warnings in development
    if (ENV_CONFIG.isDevelopment && errors.length > 0) {
        console.warn('Configuration warnings:', errors);
        console.log('Please update the configuration in assets/js/config.js');
    }
    
    return errors;
}

// Validate configuration on load
if (typeof window !== 'undefined') {
    window.addEventListener('load', validateConfiguration);
}

// =======================
// Utility Functions
// =======================
function getConfig(section) {
    const configs = {
        stripe: STRIPE_CONFIG,
        whop: WHOP_CONFIG,
        app: APP_CONFIG,
        chart: CHART_CONFIG,
        email: EMAIL_CONFIG,
        env: ENV_CONFIG,
        validation: VALIDATION_CONFIG
    };
    
    return configs[section] || null;
}

function isFeatureEnabled(feature) {
    return APP_CONFIG.features[feature] || false;
}

function getMembershipPlan(planName) {
    return STRIPE_CONFIG.membershipPlans[planName] || null;
}

// Make utility functions available globally
window.getConfig = getConfig;
window.isFeatureEnabled = isFeatureEnabled;
window.getMembershipPlan = getMembershipPlan; 