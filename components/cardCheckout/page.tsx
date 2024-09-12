'use client';

import React, { useState } from 'react';
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Replace with your actual publishable key from Stripe
const stripePromise = loadStripe('your-publishable-key-here');

const CheckoutCard: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mpesa'>('card');
  const [error, setError] = useState<string | null>(null);
  const [mpesaNumber, setMpesaNumber] = useState<string>('');

  const handleCheckout = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null); // Reset error state

    if (paymentMethod === 'card') {
      if (!stripe || !elements) {
        setError('Stripe has not loaded correctly.');
        return;
      }

      const cardNumberElement = elements.getElement(CardNumberElement);
      const cardExpiryElement = elements.getElement(CardExpiryElement);
      const cardCvcElement = elements.getElement(CardCvcElement);

      if (!cardNumberElement || !cardExpiryElement || !cardCvcElement) {
        setError('Card elements not found.');
        return;
      }

      const { paymentMethod: paymentMethodResponse, error } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardNumberElement,
      });

      if (error) {
        setError(`Stripe payment method creation error: ${error.message}`);
      } else {
        console.log('Received Stripe payment method:', paymentMethodResponse);
        alert('Checkout functionality is not implemented yet.');
        // Here you would typically send the paymentMethod.id to your server
      }
    } else if (paymentMethod === 'mpesa') {
      if (!mpesaNumber.trim()) {
        setError('M-Pesa number is required.');
        return;
      }

      console.log('Received M-Pesa number:', mpesaNumber);
      alert('Checkout functionality is not implemented yet.');
      // Here you would typically send the M-Pesa number to your server
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mt-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Payment Information</h2>
      <form onSubmit={handleCheckout}>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Select Payment Method:</label>
          <select
            value={paymentMethod}
            onChange={e => setPaymentMethod(e.target.value as 'card' | 'mpesa')}
            className="border border-gray-300 p-2 rounded-lg bg-gray-50 w-full"
          >
            <option value="card">Card Payment</option>
            <option value="mpesa">M-Pesa</option>
          </select>
        </div>

        {paymentMethod === 'card' && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Card Number:</label>
              <div className="border border-gray-300 p-2 rounded-lg bg-gray-50">
                <CardNumberElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#333',
                        '::placeholder': {
                          color: '#888',
                        },
                        padding: '10px',
                      },
                      invalid: {
                        color: '#e24d4d',
                      },
                    },
                  }}
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Expiration Date:</label>
              <div className="border border-gray-300 p-2 rounded-lg bg-gray-50">
                <CardExpiryElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#333',
                        '::placeholder': {
                          color: '#888',
                        },
                        padding: '10px',
                      },
                      invalid: {
                        color: '#e24d4d',
                      },
                    },
                  }}
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">CCV/CVV:</label>
              <div className="border border-gray-300 p-2 rounded-lg bg-gray-50">
                <CardCvcElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#333',
                        '::placeholder': {
                          color: '#888',
                        },
                        padding: '10px',
                      },
                      invalid: {
                        color: '#e24d4d',
                      },
                    },
                  }}
                />
              </div>
            </div>
          </>
        )}

        {paymentMethod === 'mpesa' && (
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">M-Pesa Number:</label>
            <input
              type="text"
              value={mpesaNumber}
              onChange={(e) => setMpesaNumber(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg bg-gray-50 w-full"
              placeholder="Enter M-Pesa number"
            />
          </div>
        )}

        {error && <p className="text-red-600 mb-4">{error}</p>}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg"
            disabled={!stripe}
          >
            Complete Purchase
          </button>
        </div>
      </form>
    </div>
  );
};

// Wrap the component with Elements provider for Stripe
const StripeWrapper: React.FC = () => (
  <Elements stripe={stripePromise}>
    <CheckoutCard />
  </Elements>
);

export default StripeWrapper;
