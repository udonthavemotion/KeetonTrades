/*
 * Keeton Trades - Discord Landing Page JavaScript
 * Lightweight and optimized for performance
 * 
 * This file provides essential functionality for the Discord subscription landing page.
 * It's designed to be minimal, fast, and focused only on what's needed.
 */

// =======================
// Page Initialization
// =======================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Keeton Trades Discord Landing Page loaded');
    
    // Initialize all components
    initializeScrollEffects();
    initializeFAQToggle();
    initializeFormValidation();
    initializeModals();
    initializeAnimations();
    
    console.log('✅ All components initialized successfully');
});

// =======================
// Smooth Scrolling
// =======================
function initializeScrollEffects() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// =======================
// FAQ Toggle Functionality
// =======================
function initializeFAQToggle() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const toggle = this.querySelector('.faq-toggle');
            
            // Close all other FAQ items
            faqQuestions.forEach(otherQuestion => {
                if (otherQuestion !== this) {
                    const otherAnswer = otherQuestion.nextElementSibling;
                    const otherToggle = otherQuestion.querySelector('.faq-toggle');
                    
                    otherAnswer.classList.remove('active');
                    otherToggle.classList.remove('active');
                }
            });
            
            // Toggle current FAQ item
            answer.classList.toggle('active');
            toggle.classList.toggle('active');
        });
    });
}

// =======================
// Form Validation
// =======================
function initializeFormValidation() {
    const emailInput = document.getElementById('email');
    
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            validateEmail(this);
        });
        
        emailInput.addEventListener('blur', function() {
            validateEmail(this);
        });
    }
}

function validateEmail(input) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailPattern.test(input.value);
    
    // Remove existing error styling
    input.classList.remove('error');
    const existingError = input.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error styling if invalid
    if (input.value && !isValid) {
        input.classList.add('error');
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = 'Please enter a valid email address';
        errorMessage.style.color = '#ff4444';
        errorMessage.style.fontSize = '0.9rem';
        errorMessage.style.marginTop = '0.5rem';
        input.parentNode.appendChild(errorMessage);
    }
}

// =======================
// Modal Management
// =======================
function initializeModals() {
    const modal = document.getElementById('paymentModal');
    
    if (modal) {
        // Close modal when clicking outside
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closePaymentModal();
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closePaymentModal();
            }
        });
    }
}

function openPaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Initialize Stripe if not already done
        if (typeof initializeStripe === 'function') {
            initializeStripe();
        }
    }
}

function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// =======================
// Stripe Integration
// =======================
let stripe;
let elements;
let cardElement;
let isStripeInitialized = false;

function initializeStripe() {
    if (isStripeInitialized) return;
    
    // Replace with your actual Stripe publishable key
    const publishableKey = 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY_HERE';
    
    if (publishableKey.includes('YOUR_STRIPE_PUBLISHABLE_KEY_HERE')) {
        console.warn('⚠️ Please update your Stripe publishable key in the JavaScript');
        showNotification('Stripe configuration needed. Please contact support.', 'warning');
        return;
    }
    
    try {
        stripe = Stripe(publishableKey);
        elements = stripe.elements({
            appearance: {
                theme: 'night',
                variables: {
                    colorPrimary: '#FFD700',
                    colorBackground: 'rgba(255, 255, 255, 0.05)',
                    colorText: '#ffffff',
                    fontFamily: 'Inter, sans-serif',
                    borderRadius: '8px',
                }
            }
        });

        cardElement = elements.create('card');
        cardElement.mount('#stripe-card-element');

        cardElement.on('change', function(event) {
            const displayError = document.getElementById('stripe-card-errors');
            if (displayError) {
                displayError.textContent = event.error ? event.error.message : '';
            }
        });

        // Set up payment button
        const submitButton = document.getElementById('submit-payment');
        if (submitButton) {
            submitButton.addEventListener('click', handlePayment);
        }

        isStripeInitialized = true;
        console.log('✅ Stripe initialized successfully');
        
    } catch (error) {
        console.error('❌ Stripe initialization failed:', error);
        showNotification('Payment system unavailable. Please try again later.', 'error');
    }
}

async function handlePayment(event) {
    event.preventDefault();
    
    const submitButton = event.target;
    const originalText = submitButton.innerHTML;
    const emailInput = document.getElementById('email');
    
    // Validate email
    if (!emailInput.value || !validateEmailFormat(emailInput.value)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // Show loading state
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitButton.disabled = true;

    try {
        // In a real implementation, you would:
        // 1. Create a payment intent on your server
        // 2. Confirm the payment with Stripe
        // 3. Handle the response and redirect or show success
        
        // For demo purposes, we'll simulate a successful payment
        await simulatePaymentProcessing();
        
        // Show success message
        showSuccessMessage();
        
    } catch (error) {
        console.error('Payment error:', error);
        showNotification('Payment failed. Please try again.', 'error');
    } finally {
        // Reset button state
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
}

function simulatePaymentProcessing() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, 2000);
    });
}

function validateEmailFormat(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

function showSuccessMessage() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-body" style="text-align: center; padding: 3rem;">
                    <div class="success-checkmark">
                        <i class="fas fa-check"></i>
                    </div>
                    <h3 style="color: #FFD700; margin-bottom: 1rem;">Welcome to the Elite Circle!</h3>
                    <p style="margin-bottom: 2rem;">Your subscription is now active. You'll receive Discord access instructions via email within 5 minutes.</p>
                    <div style="background: rgba(255,215,0,0.1); padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
                        <h4 style="color: #FFD700; margin-bottom: 1rem;">What's Next?</h4>
                        <ul style="text-align: left; margin-top: 0.5rem;">
                            <li>Check your email for Discord invite link</li>
                            <li>Complete your Discord profile</li>
                            <li>Introduce yourself in the welcome channel</li>
                            <li>Start receiving daily trade signals</li>
                        </ul>
                    </div>
                    <button class="btn btn-primary" onclick="closePaymentModal()">
                        <i class="fas fa-rocket"></i>
                        Let's Get Started!
                    </button>
                </div>
            </div>
        `;
    }
}

// =======================
// Animations
// =======================
function initializeAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe all sections for animation
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.add('fade-in');
        observer.observe(section);
    });
}

// =======================
// Notification System
// =======================
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Set styles based on type
    const colors = {
        success: '#4CAF50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196F3'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        max-width: 350px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        display: flex;
        align-items: center;
        gap: 1rem;
    `;
    
    // Add icon based on type
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    notification.innerHTML = `
        <i class="${icons[type] || icons.info}"></i>
        <span>${message}</span>
        <button style="background: none; border: none; color: white; cursor: pointer; margin-left: auto; font-size: 1.2rem;" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 5000);
}

// =======================
// Utility Functions
// =======================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// =======================
// Global Functions (for inline event handlers)
// =======================
window.openPaymentModal = openPaymentModal;
window.closePaymentModal = closePaymentModal;
window.showNotification = showNotification;

// =======================
// Error Handling
// =======================
window.addEventListener('error', (e) => {
    console.error('JavaScript Error:', e.error);
    
    // Show user-friendly error message in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        showNotification('A JavaScript error occurred. Check the console for details.', 'error');
    }
});

// =======================
// Performance Monitoring
// =======================
window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`🚀 Page loaded in ${Math.round(loadTime)}ms`);
    
    // Track Core Web Vitals if available
    if ('PerformanceObserver' in window) {
        try {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'largest-contentful-paint') {
                        console.log('LCP:', entry.startTime);
                    }
                    if (entry.entryType === 'first-input') {
                        console.log('FID:', entry.processingStart - entry.startTime);
                    }
                }
            });
            
            observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
        } catch (e) {
            // Performance Observer not supported
        }
    }
});

console.log('✅ Keeton Trades main.js loaded successfully!'); 