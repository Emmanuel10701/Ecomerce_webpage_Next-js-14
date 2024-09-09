'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/page'; // Adjust to your actual path
import { useElements, useStripe } from '@stripe/react-stripe-js';
import Image from 'next/image';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutCard from '@/components/cardCheckout/page'; // Import the CheckoutCard component

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

  const total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    // Assuming you have userId or other identifier to fetch customer details
    const fetchCustomerDetails = async () => {
      try {
        const response = await fetch('/api/castomers', {
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
      // Handle card payment via CheckoutCard component
      // You might handle the form submission within the CheckoutCard component
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

        // Assuming you have an endpoint to update payment status after M-Pesa payment
        await fetch('/api/mpesa', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'paid',
            orderId: result.orderId, // Assuming your API returns an orderId
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

            {/* Payment Method */}
            <div className="payment-method mt-6">
              <h2 className="text-2xl font-semibold mb-4 text-blue-600">Select Payment Method</h2>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8h18M3 12h18M3 16h18"></path>
                    </svg>
                    <span className="text-lg font-semibold text-gray-800">Credit/Debit Card</span>
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
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zM2 6h20M6 2v20"></path>
                    </svg>
                    <span className="text-lg font-semibold text-gray-800">M-Pesa</span>
                  </div>
                </label>
              </div>
            </div>

            {/* M-Pesa Details */}
            {paymentMethod === 'mpesa' && (
              <div className="mpesa-details mt-4">
                <h2 className="text-2xl font-semibold text-blue-600 mb-4">M-Pesa Details</h2>
                <input
                  type="text"
                  name="phoneNumber"
                  value={mpesaDetails.phoneNumber}
                  onChange={handleMpesaChange}
                  placeholder="Phone Number"
                  className="p-3 border border-gray-300 text-slate-500 rounded-lg shadow-sm mb-4"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold mt-6 hover:bg-blue-700"
            >
              {paymentMethod === 'card' ? 'Pay with Card' : 'Pay with M-Pesa'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
