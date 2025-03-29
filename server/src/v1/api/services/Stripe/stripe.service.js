import Stripe from 'stripe';

class StripeService {
    
  constructor() {
    this.stripe = new Stripe("sk_test_51PAs60SB7WwtOtybywUDUG9MdtdWGlWHMww0HcmcYxKH1Odx4US1PhizF5mrg5ihlNbE85KwgVv51SYYCXQU1NRU00zSlwYANZ");
  }

  async findOrCreateCustomer(email, name) {
    try {
      // Check if customer exists
      const existingCustomers = await this.stripe.customers.list({
        email,
        limit: 1
      });

      if (existingCustomers.data.length > 0) {
        return existingCustomers.data[0]; // Return existing customer
      }

      // Create new customer if not exists
      return await this.stripe.customers.create({
        email,
        name,
        description: `Customer created ${new Date().toISOString()}`
      });
    } catch (error) {
      throw this._handleStripeError(error);
    }
  }

  async attachCardToCustomer(paymentMethodId, customerId) {
    try {
      // Attach payment method
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId
      });

      // Set as default payment method
      await this.stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });

      // Return the payment method details
      return await this.stripe.paymentMethods.retrieve(paymentMethodId);
    } catch (error) {
      // Detach payment method if attachment failed
      if (error.type === 'StripeCardError') {
        await this.stripe.paymentMethods.detach(paymentMethodId).catch(() => {});
      }
      throw this._handleStripeError(error);
    }
  }

  _handleStripeError(error) {
    const errors = {
      'StripeCardError': 'Card declined. Please try another payment method.',
      'StripeRateLimitError': 'Too many requests. Please wait and try again.',
      'StripeInvalidRequestError': 'Invalid payment details.',
      'StripeAPIError': 'Payment service error.',
      'StripeConnectionError': 'Network error. Please check your connection.',
      'StripeAuthenticationError': 'Payment authentication failed.'
    };

    return new Error(errors[error.type] || 'Payment processing failed. Please try again.');
  }
}

export const stripeService = new StripeService();
