"use client";
import { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Function to validate email format
  const isValidEmail = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setMessage('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', { email }, {
        headers: { 'Content-Type': 'application/json' }
      });
      setMessage('Password reset email sent. Please check your inbox.');
    } catch (error) {
      console.error('Error sending password reset email:', error);
      setMessage('Error sending password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex items-center justify-center min-h-screen p-4 transition-opacity duration-300 ${loading ? 'bg-gray-100 opacity-70' : 'bg-gray-100'}`}>
      <div className="w-full max-w-md bg-white p-6 md:p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">Forgot Password</h2>
        <p className="text-gray-600 mb-6">Enter your email address below to receive a password reset link.</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
              placeholder="you@example.com"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || !isValidEmail(email)}
            className={`w-full py-3 rounded-xl text-white transition duration-150 ease-in-out ${loading || !isValidEmail(email) ? 'bg-blue-500 opacity-60 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
          {message && <p className="mt-4 text-center text-red-600">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
