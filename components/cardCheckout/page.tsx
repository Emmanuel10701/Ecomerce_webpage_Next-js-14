"use client";

import React, { useState } from 'react';
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('your-publishable-key-here');

const CheckoutCard: React.FC<{ paymentMethod: 'card' | 'mpesa' }> = ({ paymentMethod }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (event: React.FormEvent) => {
    event.preventDefault();

    if (paymentMethod === 'card') {
      if (!stripe || !elements) {
        return;
      }

      const cardNumberElement = elements.getElement(CardNumberElement);
      const cardExpiryElement = elements.getElement(CardExpiryElement);
      const cardCvcElement = elements.getElement(CardCvcElement);

      if (!cardNumberElement || !cardExpiryElement || !cardCvcElement) {
        alert('Card elements not found.');
        return;
      }

      const { token, error } = await stripe.createToken(cardNumberElement);

      if (error) {
        console.error('Stripe token creation error:', error);
        setError('Error creating payment token.');
      } else {
        console.log('Received Stripe token:', token);
        alert('Checkout functionality is not implemented yet.');
      }
    }
  };

  return (
    <>
      {paymentMethod === 'card' && (
        <div className="bg-white p-6 rounded-lg shadow-lg mt-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Payment Information</h2>
          <form onSubmit={handleCheckout}>
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
            {error && <p className="text-red-600 mb-4">{error}</p>}
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
                disabled={!stripe}
              >
                Complete Purchase
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

// Wrap the component with Elements provider for Stripe
const StripeWrapper: React.FC<{ paymentMethod: 'card' | 'mpesa' }> = ({ paymentMethod }) => (
  <Elements stripe={stripePromise}>
    <CheckoutCard paymentMethod={paymentMethod} />
  </Elements>
);

export default StripeWrapper;
