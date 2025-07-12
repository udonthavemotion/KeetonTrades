/*
 * Keeton Trades - Stripe Integration
 * 
 * This file handles all Stripe payment processing for the Keeton Trades platform.
 * It includes:
 * - Stripe Elements initialization
 * - Payment form handling
 * - Subscription management
 * - Error handling
 * - Success/failure callbacks
 * 
 * For beginners: Stripe is a payment processor that handles credit card payments
 * securely. We use Stripe Elements to create secure payment forms that collect
 * card details without them touching our servers.
 * 
 * Setup Required:
 * 1. Create a Stripe account at https://stripe.com
 * 2. Get your publishable key from the Stripe dashboard
 * 3. Create subscription products in Stripe
 * 4. Update the config.js file with your keys
 */

// =======================
// Stripe Initialization
// =======================
let stripe;
let elements;
let cardElement;
let isStripeInitialized = false;

// Initialize Stripe when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeStripe();
});

function initializeStripe() {
    // Check if Stripe configuration exists
    if (!window.STRIPE_CONFIG) {
        console.error('Stripe configuration not found. Please check config.js');
        return;
    }

    // Check if publishable key is configured
    if (window.STRIPE_CONFIG.publishableKey.includes('YOUR_STRIPE_PUBLISHABLE_KEY_HERE')) {
        console.warn('Stripe publishable key not configured. Please update config.js');
        return;
    }

    // Initialize Stripe with your publishable key
    stripe = Stripe(window.STRIPE_CONFIG.publishableKey);

    // Create an Elements instance
    elements = stripe.elements({
        appearance: {
            theme: 'night',
            variables: {
                colorPrimary: '#FFD700',
                colorBackground: 'rgba(255, 255, 255, 0.05)',
                colorText: '#ffffff',
                colorDanger: '#df1b41',
                fontFamily: 'Montserrat, sans-serif',
                spacingUnit: '4px',
                borderRadius: '8px',
            }
        }
    });

    // Create and mount the card element
    createCardElement();

    // Set up form submission
    setupPaymentForm();

    isStripeInitialized = true;
    console.log('✅ Stripe initialized successfully');
}

// =======================
// Card Element Creation
// =======================
function createCardElement() {
    // Create card element
    cardElement = elements.create('card', {
        style: {
            base: {
                fontSize: '16px',
                color: '#ffffff',
                fontFamily: 'Montserrat, sans-serif',
                '::placeholder': {
                    color: '#999999',
                }
            },
            invalid: {
                iconColor: '#FFC7EE',
                color: '#FFC7EE',
            },
            complete: {
                iconColor: '#FFD700',
            }
        }
    });

    // Mount the card element
    const cardMountPoint = document.getElementById('stripe-card-element');
    if (cardMountPoint) {
        cardElement.mount('#stripe-card-element');
        
        // Handle real-time validation errors from the card element
        cardElement.on('change', function(event) {
            const displayError = document.getElementById('stripe-card-errors');
            if (event.error) {
                displayError.textContent = event.error.message;
                displayError.style.display = 'block';
            } else {
                displayError.textContent = '';
                displayError.style.display = 'none';
            }
        });
    }
}

// =======================
// Payment Form Setup
// =======================
function setupPaymentForm() {
    const subscribeButton = document.getElementById('subscribe-btn');
    
    if (subscribeButton) {
        subscribeButton.addEventListener('click', handleSubscription);
    }
}

async function handleSubscription(event) {
    event.preventDefault();

    if (!isStripeInitialized) {
        showStripeError('Stripe is not initialized. Please refresh the page and try again.');
        return;
    }

    // Get selected membership plan
    const selectedPlan = getSelectedMembershipPlan();
    if (!selectedPlan) {
        showStripeError('Please select a membership plan.');
        return;
    }

    // Show loading state
    const submitButton = event.target;
    const originalContent = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitButton.disabled = true;

    try {
        // Create payment method
        const {error, paymentMethod} = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
            billing_details: {
                name: 'Customer Name', // You can collect this from a form field
                email: 'customer@example.com', // You can collect this from a form field
            },
        });

        if (error) {
            throw error;
        }

        // Create subscription
        await createSubscription(paymentMethod.id, selectedPlan);

    } catch (error) {
        console.error('Payment error:', error);
        showStripeError(error.message || 'An unexpected error occurred.');
    } finally {
        // Reset button state
        submitButton.innerHTML = originalContent;
        submitButton.disabled = false;
    }
}

// =======================
// Subscription Creation
// =======================
async function createSubscription(paymentMethodId, plan) {
    try {
        // In a real application, you would call your backend API here
        // For this demo, we'll simulate the subscription creation
        
        // This is where you would typically make a call to your backend:
        // const response = await fetch('/create-subscription', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //         paymentMethodId: paymentMethodId,
        //         priceId: plan.priceId,
        //         customerId: customerId, // You would get this from your user system
        //     }),
        // });
        
        // For demo purposes, we'll simulate success
        setTimeout(() => {
            handleSubscriptionSuccess(plan);
        }, 2000);

    } catch (error) {
        console.error('Subscription creation error:', error);
        throw new Error('Failed to create subscription. Please try again.');
    }
}

// =======================
// Success/Error Handlers
// =======================
function handleSubscriptionSuccess(plan) {
    // Hide the modal
    if (window.closeMembershipModal) {
        window.closeMembershipModal();
    }

    // Show success message
    if (window.showNotification) {
        window.showNotification(
            `🎉 Welcome to Keeton Trades ${plan.name}! Your subscription is now active.`,
            'success'
        );
    }

    // Redirect to dashboard or welcome page
    // window.location.href = '/dashboard';
    
    // For demo purposes, show a success modal
    showSuccessModal(plan);
}

function showSuccessModal(plan) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>🎉 Welcome to Keeton Trades!</h3>
            </div>
            <div class="modal-body">
                <div style="text-align: center; padding: 2rem;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">🚀</div>
                    <h4 style="color: #FFD700; margin-bottom: 1rem;">Subscription Activated</h4>
                    <p style="margin-bottom: 2rem;">
                        Your ${plan.name} membership is now active! You'll receive a confirmation email shortly.
                    </p>
                    <div style="background: rgba(255, 215, 0, 0.1); padding: 1rem; border-radius: 8px; margin-bottom: 2rem;">
                        <p><strong>What's Next?</strong></p>
                        <ul style="text-align: left; margin-top: 0.5rem;">
                            <li>Check your email for login instructions</li>
                            <li>Join our Discord community</li>
                            <li>Start exploring premium features</li>
                        </ul>
                    </div>
                    <button class="btn btn-primary" onclick="this.parentElement.parentElement.parentElement.remove()">
                        Get Started
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function showStripeError(message) {
    const displayError = document.getElementById('stripe-card-errors');
    if (displayError) {
        displayError.textContent = message;
        displayError.style.display = 'block';
    }
    
    if (window.showNotification) {
        window.showNotification(message, 'error');
    }
}

// =======================
// Utility Functions
// =======================
function getSelectedMembershipPlan() {
    const selectedRadio = document.querySelector('input[name="membership"]:checked');
    if (!selectedRadio) {
        return null;
    }
    
    const planName = selectedRadio.value;
    return window.STRIPE_CONFIG.membershipPlans[planName];
}

function formatPrice(amount, currency = 'usd') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase(),
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

// =======================
// Customer Portal
// =======================
function redirectToCustomerPortal() {
    // In a real application, you would create a customer portal session
    // and redirect the user to manage their subscription
    
    if (window.showNotification) {
        window.showNotification(
            'Customer portal would open here. This requires backend integration.',
            'info'
        );
    }
}

// =======================
// Webhook Handling (Backend)
// =======================
/*
 * Important: The following code would typically be in your backend server
 * to handle Stripe webhooks. This is included for reference only.
 * 
 * Example webhook handling in Node.js:
 * 
 * app.post('/stripe-webhook', express.raw({type: 'application/json'}), (req, res) => {
 *     const sig = req.headers['stripe-signature'];
 *     let event;
 * 
 *     try {
 *         event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
 *     } catch (err) {
 *         console.log(`Webhook signature verification failed.`, err.message);
 *         return res.status(400).send(`Webhook Error: ${err.message}`);
 *     }
 * 
 *     // Handle the event
 *     switch (event.type) {
 *         case 'customer.subscription.created':
 *             // Handle new subscription
 *             break;
 *         case 'customer.subscription.updated':
 *             // Handle subscription updates
 *             break;
 *         case 'customer.subscription.deleted':
 *             // Handle subscription cancellation
 *             break;
 *         case 'invoice.payment_succeeded':
 *             // Handle successful payment
 *             break;
 *         case 'invoice.payment_failed':
 *             // Handle failed payment
 *             break;
 *         default:
 *             console.log(`Unhandled event type ${event.type}`);
 *     }
 * 
 *     res.status(200).send('OK');
 * });
 */

// =======================
// Export Functions
// =======================
window.stripeIntegration = {
    initialize: initializeStripe,
    createSubscription: createSubscription,
    handleSubscription: handleSubscription,
    redirectToCustomerPortal: redirectToCustomerPortal,
    formatPrice: formatPrice
};

// =======================
// Development Helpers
// =======================
if (window.ENV_CONFIG && window.ENV_CONFIG.isDevelopment) {
    // Add test card numbers for development
    window.stripeTestCards = {
        visa: '4242424242424242',
        visaDebit: '4000056655665556',
        mastercard: '5555555555554444',
        amex: '378282246310005',
        declined: '4000000000000002',
        insufficientFunds: '4000000000009995',
        expired: '4000000000000069',
        cvc: '4000000000000127'
    };
    
    console.log('💳 Test cards available:', window.stripeTestCards);
}

console.log('✅ Stripe integration loaded successfully!'); 