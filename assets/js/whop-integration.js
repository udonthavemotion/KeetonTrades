/*
 * Keeton Trades - Whop Integration
 * 
 * This file handles integration with Whop for membership management and digital product sales.
 * Whop is a marketplace for digital products that works seamlessly with Stripe.
 * 
 * Features:
 * - Product management
 * - Membership validation
 * - Access control
 * - Integration with Stripe payments
 * - Community management
 * 
 * For beginners: Whop is a platform that helps you sell digital products, memberships,
 * and access to communities. It handles the product listing, access management, and 
 * integrates with Stripe for payments.
 * 
 * Setup Required:
 * 1. Create a Whop account at https://whop.com
 * 2. Set up your products in the Whop dashboard
 * 3. Connect your Stripe account to Whop
 * 4. Get your API keys from Whop dashboard
 * 5. Update the config.js file with your Whop credentials
 */

// =======================
// Whop API Client
// =======================
class WhopClient {
    constructor(apiKey, companyId) {
        this.apiKey = apiKey;
        this.companyId = companyId;
        this.baseUrl = 'https://api.whop.com/v1';
        this.isConfigured = apiKey && !apiKey.includes('YOUR_API_KEY_HERE');
    }

    // Make authenticated API requests to Whop
    async request(endpoint, options = {}) {
        if (!this.isConfigured) {
            throw new Error('Whop API key is not configured. Please update config.js');
        }

        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            ...options.headers
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            if (!response.ok) {
                throw new Error(`Whop API error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Whop API request failed:', error);
            throw error;
        }
    }

    // Get product information
    async getProduct(productId) {
        return this.request(`/products/${productId}`);
    }

    // Get all products for the company
    async getProducts() {
        return this.request(`/companies/${this.companyId}/products`);
    }

    // Create a checkout session
    async createCheckout(productId, options = {}) {
        return this.request('/checkout', {
            method: 'POST',
            body: JSON.stringify({
                product_id: productId,
                company_id: this.companyId,
                ...options
            })
        });
    }

    // Validate user access
    async validateAccess(userId, productId) {
        return this.request(`/users/${userId}/access/${productId}`);
    }

    // Get user subscriptions
    async getUserSubscriptions(userId) {
        return this.request(`/users/${userId}/subscriptions`);
    }
}

// =======================
// Whop Integration Manager
// =======================
class WhopIntegration {
    constructor() {
        this.client = null;
        this.products = new Map();
        this.isInitialized = false;
        
        this.init();
    }

    async init() {
        try {
            // Check if Whop configuration exists
            if (!window.WHOP_CONFIG) {
                console.error('Whop configuration not found. Please check config.js');
                return;
            }

            // Initialize the Whop client
            this.client = new WhopClient(
                window.WHOP_CONFIG.apiKey,
                window.WHOP_CONFIG.companyId
            );

            if (!this.client.isConfigured) {
                console.warn('Whop API key not configured. Please update config.js');
                return;
            }

            // Load products
            await this.loadProducts();

            this.isInitialized = true;
            console.log('✅ Whop integration initialized successfully');

        } catch (error) {
            console.error('Failed to initialize Whop integration:', error);
        }
    }

    async loadProducts() {
        try {
            const products = await this.client.getProducts();
            
            // Store products in a Map for quick access
            products.forEach(product => {
                this.products.set(product.id, product);
            });

            console.log(`📦 Loaded ${products.length} products from Whop`);
        } catch (error) {
            console.error('Failed to load products:', error);
        }
    }

    // Create a checkout session for a specific membership plan
    async createCheckoutSession(planName, options = {}) {
        if (!this.isInitialized) {
            throw new Error('Whop integration not initialized');
        }

        const productId = window.WHOP_CONFIG.products[planName];
        if (!productId) {
            throw new Error(`Product ID not found for plan: ${planName}`);
        }

        try {
            const checkoutSession = await this.client.createCheckout(productId, {
                success_url: options.successUrl || `${window.location.origin}/success`,
                cancel_url: options.cancelUrl || `${window.location.origin}/cancel`,
                ...options
            });

            return checkoutSession;
        } catch (error) {
            console.error('Failed to create checkout session:', error);
            throw error;
        }
    }

    // Redirect to Whop checkout
    async redirectToCheckout(planName, options = {}) {
        try {
            const checkoutSession = await this.createCheckoutSession(planName, options);
            
            // Redirect to Whop checkout page
            window.location.href = checkoutSession.checkout_url;
            
        } catch (error) {
            console.error('Failed to redirect to checkout:', error);
            throw error;
        }
    }

    // Get product information
    getProduct(planName) {
        const productId = window.WHOP_CONFIG.products[planName];
        return this.products.get(productId);
    }

    // Check if user has access to a product
    async checkUserAccess(userId, planName) {
        const productId = window.WHOP_CONFIG.products[planName];
        
        try {
            const access = await this.client.validateAccess(userId, productId);
            return access.has_access;
        } catch (error) {
            console.error('Failed to check user access:', error);
            return false;
        }
    }
}

// =======================
// Global Integration Instance
// =======================
const whopIntegration = new WhopIntegration();

// =======================
// UI Integration Functions
// =======================
function initializeWhopButtons() {
    // Add click handlers to membership buttons
    document.querySelectorAll('.membership-btn').forEach(button => {
        button.addEventListener('click', handleMembershipSelection);
    });
}

async function handleMembershipSelection(event) {
    event.preventDefault();
    
    const button = event.target;
    const planName = button.getAttribute('data-plan') || 
                    button.closest('.membership-card').getAttribute('data-plan');
    
    if (!planName) {
        console.error('Plan name not found');
        return;
    }

    // Show loading state
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    button.disabled = true;

    try {
        // Check if we should use Whop or Stripe
        const useWhop = window.WHOP_CONFIG && window.WHOP_CONFIG.apiKey && 
                       !window.WHOP_CONFIG.apiKey.includes('YOUR_API_KEY_HERE');

        if (useWhop) {
            // Use Whop for checkout
            await whopIntegration.redirectToCheckout(planName);
        } else {
            // Fall back to Stripe integration
            if (window.selectMembership) {
                window.selectMembership(planName);
            }
        }
    } catch (error) {
        console.error('Failed to handle membership selection:', error);
        
        if (window.showNotification) {
            window.showNotification(
                'Failed to start checkout. Please try again.',
                'error'
            );
        }
    } finally {
        // Reset button state
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

// =======================
// Access Control
// =======================
class AccessController {
    constructor() {
        this.userAccess = new Map();
    }

    async checkAccess(userId, planName) {
        // Check cache first
        const cacheKey = `${userId}-${planName}`;
        if (this.userAccess.has(cacheKey)) {
            return this.userAccess.get(cacheKey);
        }

        // Check with Whop
        const hasAccess = await whopIntegration.checkUserAccess(userId, planName);
        
        // Cache the result
        this.userAccess.set(cacheKey, hasAccess);
        
        return hasAccess;
    }

    async restrictContent(userId, requiredPlan) {
        const hasAccess = await this.checkAccess(userId, requiredPlan);
        
        if (!hasAccess) {
            this.showAccessDenied(requiredPlan);
            return false;
        }
        
        return true;
    }

    showAccessDenied(requiredPlan) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🔒 Premium Content</h3>
                    <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div style="text-align: center; padding: 2rem;">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">🔒</div>
                        <h4 style="color: #FFD700; margin-bottom: 1rem;">Access Required</h4>
                        <p style="margin-bottom: 2rem;">
                            This content requires a ${requiredPlan} membership or higher.
                        </p>
                        <button class="btn btn-primary" onclick="window.selectMembership('${requiredPlan}')">
                            Upgrade to ${requiredPlan}
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
}

const accessController = new AccessController();

// =======================
// Community Integration
// =======================
class CommunityManager {
    constructor() {
        this.discordInvites = new Map();
        this.telegramLinks = new Map();
    }

    async generateDiscordInvite(planName) {
        // In a real implementation, this would generate a Discord invite
        // based on the user's membership level
        const inviteLinks = {
            starter: 'https://discord.gg/keeton-starter',
            pro: 'https://discord.gg/keeton-pro',
            elite: 'https://discord.gg/keeton-elite'
        };

        return inviteLinks[planName] || inviteLinks.starter;
    }

    async addToTelegram(userId, planName) {
        // In a real implementation, this would add the user to the appropriate
        // Telegram group based on their membership level
        const telegramGroups = {
            starter: '@keeton_starter',
            pro: '@keeton_pro',
            elite: '@keeton_elite'
        };

        const group = telegramGroups[planName] || telegramGroups.starter;
        
        if (window.showNotification) {
            window.showNotification(
                `You've been invited to join ${group} on Telegram!`,
                'success'
            );
        }
    }
}

const communityManager = new CommunityManager();

// =======================
// Webhook Handlers
// =======================
function handleWhopWebhook(event) {
    /*
     * Handle Whop webhooks for subscription events
     * This would typically be implemented in your backend
     */
    
    switch (event.type) {
        case 'subscription.created':
            handleSubscriptionCreated(event.data);
            break;
        case 'subscription.updated':
            handleSubscriptionUpdated(event.data);
            break;
        case 'subscription.cancelled':
            handleSubscriptionCancelled(event.data);
            break;
        case 'payment.succeeded':
            handlePaymentSucceeded(event.data);
            break;
        case 'payment.failed':
            handlePaymentFailed(event.data);
            break;
        default:
            console.log(`Unhandled Whop webhook: ${event.type}`);
    }
}

function handleSubscriptionCreated(subscription) {
    console.log('New subscription created:', subscription);
    
    // Add user to community
    communityManager.addToTelegram(subscription.user_id, subscription.plan_name);
    
    // Send welcome email
    // sendWelcomeEmail(subscription.user_id, subscription.plan_name);
}

function handleSubscriptionUpdated(subscription) {
    console.log('Subscription updated:', subscription);
    
    // Update user access
    accessController.userAccess.clear(); // Clear cache
}

function handleSubscriptionCancelled(subscription) {
    console.log('Subscription cancelled:', subscription);
    
    // Remove user access
    accessController.userAccess.clear(); // Clear cache
    
    // Send cancellation email
    // sendCancellationEmail(subscription.user_id);
}

function handlePaymentSucceeded(payment) {
    console.log('Payment succeeded:', payment);
    
    // Update user access
    accessController.userAccess.clear(); // Clear cache
}

function handlePaymentFailed(payment) {
    console.log('Payment failed:', payment);
    
    // Send payment failure notification
    // sendPaymentFailureEmail(payment.user_id);
}

// =======================
// Initialize on DOM Load
// =======================
document.addEventListener('DOMContentLoaded', function() {
    initializeWhopButtons();
    console.log('✅ Whop UI integration initialized');
});

// =======================
// Export Functions
// =======================
window.whopIntegration = whopIntegration;
window.accessController = accessController;
window.communityManager = communityManager;

// =======================
// Utility Functions
// =======================
function showWhopError(message) {
    if (window.showNotification) {
        window.showNotification(message, 'error');
    }
    console.error('Whop Error:', message);
}

function showWhopSuccess(message) {
    if (window.showNotification) {
        window.showNotification(message, 'success');
    }
    console.log('Whop Success:', message);
}

// =======================
// Development Helpers
// =======================
if (window.ENV_CONFIG && window.ENV_CONFIG.isDevelopment) {
    // Add development utilities
    window.whopDev = {
        testCheckout: async (planName) => {
            console.log(`Testing checkout for plan: ${planName}`);
            try {
                const session = await whopIntegration.createCheckoutSession(planName, {
                    success_url: `${window.location.origin}?success=true`,
                    cancel_url: `${window.location.origin}?cancelled=true`
                });
                console.log('Checkout session created:', session);
            } catch (error) {
                console.error('Test checkout failed:', error);
            }
        },
        
        simulateWebhook: (type, data) => {
            console.log(`Simulating webhook: ${type}`);
            handleWhopWebhook({ type, data });
        },
        
        testAccess: async (userId, planName) => {
            console.log(`Testing access for user ${userId} and plan ${planName}`);
            const hasAccess = await accessController.checkAccess(userId, planName);
            console.log('Access result:', hasAccess);
            return hasAccess;
        }
    };
    
    console.log('🔧 Whop development utilities available:', window.whopDev);
}

console.log('✅ Whop integration loaded successfully!'); 