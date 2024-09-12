"use client";

import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/page'; // Adjust to your actual path
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Make sure to replace this with your own Stripe public key
const stripePromise = loadStripe('your-stripe-public-key');

const CheckoutPage: React.FC = () => {
  const { state } = useCart();
  const [billingInfo, setBillingInfo] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zip: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mpesa'>('card');
  const [mpesaDetails, setMpesaDetails] = useState({
    phoneNumber: '',
    amount: 0,
  });

  const stripe = useStripe();
  const elements = useElements();

  const total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        const response = await fetch('/api/customers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: 'some-user-id' }) // Replace with actual userId or relevant data
        });
        const data = await response.json();
        
        setBillingInfo({
          name: data.name || '',
          email: data.email || '',
          address: data.address || '',
          city: data.city || '',
          zip: data.zip || '',
        });

        setMpesaDetails(prevState => ({
          ...prevState,
          amount: total,
        }));
      } catch (error) {
        console.error('Error fetching customer details:', error);
      }
    };

    fetchCustomerDetails();
  }, [total]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBillingInfo(prevState => {
      const updatedInfo = { ...prevState, [name]: value };
      localStorage.setItem('billingInfo', JSON.stringify(updatedInfo));
      return updatedInfo;
    });
  };

  const handleMpesaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMpesaDetails(prevState => ({ ...prevState, [name]: value }));
  };

  const handleCheckout = async (event: React.FormEvent) => {
    event.preventDefault();

    if (paymentMethod === 'card') {
      if (!stripe || !elements) {
        console.error('Stripe.js or Elements not loaded.');
        return;
      }

      const cardNumber = elements.getElement(CardNumberElement);
      const cardExpiry = elements.getElement(CardExpiryElement);
      const cardCvc = elements.getElement(CardCvcElement);

      if (!cardNumber || !cardExpiry || !cardCvc) {
        console.error('Card Elements are not loaded.');
        return;
      }

      const { token, error } = await stripe.createToken({
        type: 'card',
        card: {
          number: cardNumber?.value,
          exp_month: cardExpiry?.value.split('/')[0],
          exp_year: cardExpiry?.value.split('/')[1],
          cvc: cardCvc?.value,
        },
      });

      if (error) {
        console.error('Error creating Stripe token:', error);
        alert('Error processing payment.');
        return;
      }

      try {
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: token.id,
            amount: total,
            billingInfo,
          }),
        });

        const result = await response.json();
        console.log('Card Payment Response:', result);

        alert('Payment successful.');
      } catch (error) {
        console.error('Card payment error:', error);
        alert('Error processing payment.');
      }
    } else if (paymentMethod === 'mpesa') {
      try {
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumber: mpesaDetails.phoneNumber,
            amount: total,
          }),
        });

        const result = await response.json();
        console.log('M-Pesa Response:', result);

        await fetch('/api/mpesa', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'paid',
            orderId: result.orderId,
          }),
        });

        alert('M-Pesa payment request sent.');
      } catch (error) {
        console.error('M-Pesa payment error:', error);
        alert('Error sending M-Pesa payment request.');
      }
    }
  };

  return (
    <div className="checkout p-4 max-w-screen-lg mx-auto">
      <h1 className="text-3xl text-slate-600 font-bold mb-6">Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Summary */}
        <div className="order-summary bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-blue-500 mb-4 text-center">Order Summary</h2>
          <div className="space-y-4">
            {state.items.map(item => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <img src={item.imageUrl || 'https://via.placeholder.com/50'} alt={item.name} className="w-10 h-10 object-cover" />
                  <div>
                    <h3 className="text-sm text-slate-400 font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-400">{item.quantity} x ${item.price.toFixed(2)}</p>
                  </div>
                </div>
                <p className="text-md text-green-700 font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-between items-center font-semibold">
            <span className='text-lg text-slate-500'>Total</span>
            <span className='text-slate-400 font-bold text-xl text-underline'>KSh {total.toFixed(2)}</span>
          </div>
        </div>

        {/* Billing Information */}
        <div className="billing-info bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-blue-500 mb-4">Billing Information</h2>
          <form onSubmit={handleCheckout}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                value={billingInfo.name}
                onChange={handleInputChange}
                placeholder="Full Name"
                className="p-3 border border-gray-300 rounded-lg text-slate-500 shadow-sm"
                required
              />
              <input
                type="email"
                name="email"
                value={billingInfo.email}
                onChange={handleInputChange}
                placeholder="Email Address"
                className="p-3 border border-gray-300 text-slate-500 rounded-lg shadow-sm"
                required
              />
              <input
                type="text"
                name="address"
                value={billingInfo.address}
                onChange={handleInputChange}
                placeholder="Address"
                className="p-3 border border-gray-300 text-slate-500 rounded-lg shadow-sm"
                required
              />
              <input
                type="text"
                name="city"
                value={billingInfo.city}
                onChange={handleInputChange}
                placeholder="City"
                className="p-3 border border-gray-300 text-slate-500 rounded-lg shadow-sm"
                required
              />
              <input
                type="text"
                name="zip"
                value={billingInfo.zip}
                onChange={handleInputChange}
                placeholder="Zip Code"
                className="p-3 border border-gray-300 text-slate-500 rounded-lg shadow-sm"
                required
              />
            </div>

            {/* Payment Method Selection */}
            <div className="payment-method mt-6">
              <h2 className="text-lg font-semibold text-blue-600">Select Payment Method</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Card Payment Option */}
                <label className={`flex items-center p-4 rounded-lg border cursor-pointer transition-transform ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} hover:scale-105`} htmlFor="card">
                  <input
                    type="radio"
                    id="card"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.1 13.4A2.5 2.5 0 017.5 12h9a2.5 2.5 0 012.4 1.4M5.1 13.4A2.5 2.5 0 017.5 15h9a2.5 2.5 0 012.4-1.6M5.1 13.4V17a2.5 2.5 0 002.4 2.5h9a2.5 2.5 0 002.4-2.5v-3.6M5.1 13.4H3.5M5.1 13.4a2.5 2.5 0 00-2.4 2.5v1M5.1 13.4V17a2.5 2.5 0 01-2.4-2.5v-3.6M19 13.4a2.5 2.5 0 00-2.4-2.5v-3.6a2.5 2.5 0 012.4-2.5M19 13.4v-3.6a2.5 2.5 0 00-2.4-2.5M19 13.4a2.5 2.5 0 002.4 2.5v1"/>
                    </svg>
                    <span className="text-lg font-semibold text-slate-600">Credit/Debit Card</span>
                  </div>
                </label>

                {/* M-Pesa Payment Option */}
                <label className={`flex items-center p-4 rounded-lg border cursor-pointer transition-transform ${paymentMethod === 'mpesa' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} hover:scale-105`} htmlFor="mpesa">
                  <input
                    type="radio"
                    id="mpesa"
                    name="paymentMethod"
                    value="mpesa"
                    checked={paymentMethod === 'mpesa'}
                    onChange={() => setPaymentMethod('mpesa')}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/M-Pesa_logo.svg/1200px-M-Pesa_logo.svg.png" alt="M-Pesa" className="w-8 h-8 object-cover" />
                    <span className="text-lg font-semibold text-slate-600">M-Pesa</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Card Payment Form */}
            {paymentMethod === 'card' && (
              <div className="card-payment mt-6 space-y-4">
                <div className="field">
                  <label htmlFor="cardNumber" className="block text-sm font-semibold text-slate-600">Card Number</label>
                  <CardNumberElement className="p-3 border border-gray-300 rounded-lg shadow-sm" />
                </div>
                <div className="field">
                  <label htmlFor="cardExpiry" className="block text-sm font-semibold text-slate-600">Expiration Date</label>
                  <CardExpiryElement className="p-3 border border-gray-300 rounded-lg shadow-sm" />
                </div>
                <div className="field">
                  <label htmlFor="cardCvc" className="block text-sm font-semibold text-slate-600">CVC</label>
                  <CardCvcElement className="p-3 border border-gray-300 rounded-lg shadow-sm" />
                </div>
              </div>
            )}

            {/* M-Pesa Payment Form */}
            {paymentMethod === 'mpesa' && (
              <div className="mpesa-payment mt-6">
                <input
                  type="text"
                  name="phoneNumber"
                  value={mpesaDetails.phoneNumber}
                  onChange={handleMpesaChange}
                  placeholder="Phone Number"
                  className="p-3 border border-gray-300 rounded-lg text-slate-500 shadow-sm"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full mt-6 bg-blue-600 text-white p-3 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
            >
              Complete Purchase
            </button>
          </form>
        </div>
      </div>
      <div className="payment-logos mt-6 flex justify-center space-x-4">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Visa_Logo_2011.svg/1200px-Visa_Logo_2011.svg.png" alt="Visa" className="w-16 h-16" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/MasterCard_Logo_2016.svg/1200px-MasterCard_Logo_2016.svg.png" alt="MasterCard" className="w-16 h-16" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/American_Express_logo.svg/1200px-American_Express_logo.svg.png" alt="American Express" className="w-16 h-16" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Discover_Card_Logo.svg/1200px-Discover_Card_Logo.svg.png" alt="Discover" className="w-16 h-16" />
      </div>
    </div>
  );
};

const CheckoutWrapper: React.FC = () => (
  <Elements stripe={stripePromise}>
    <CheckoutPage />
  </Elements>
);

export default CheckoutWrapper;
