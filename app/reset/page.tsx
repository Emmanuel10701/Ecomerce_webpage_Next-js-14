"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import CircularProgress from '@mui/material/CircularProgress';
import { FaCheckCircle } from 'react-icons/fa';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null); // Added state for token
  const router = useRouter();

  useEffect(() => {
    // Safely set the token when router.query is available
    if (router.query.token) {
      setToken(router.query.token as string);
    }
  }, [router.query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      await axios.post('/api/reset', { token, password });
      setMessage('Password has been reset successfully.');
      setTimeout(() => {
        setMessage('');
        router.push('/login');
      }, 2000);
    } catch (error) {
      setMessage('Error resetting password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Reset Password</h2>
        <p className="mb-6 text-gray-600">Enter your new password and confirm it below.</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="password">
              New Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="New password"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="confirm-password">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="Confirm new password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            className={`w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition duration-200 ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
          </button>

          {message && (
            <p className={`mt-4 text-center ${message.startsWith('Error') ? 'text-red-600' : 'text-green-600 flex items-center justify-center'}`}>
              {message.startsWith('Error') ? message : <><FaCheckCircle className="mr-2" /> {message}</>}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
